"use server";

import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "./prisma";
import { createSession, deleteSession } from "./session";
import { sendEmail, verificationEmail, resetPasswordEmail } from "./email";
import { checkRateLimit } from "./rate-limit";
import { logger } from "./logger";

const signupSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0].trim() ??
    headerStore.get("x-real-ip") ??
    "unknown"
  );
}

export async function signup(data: {
  email: string;
  password: string;
  name?: string;
}): Promise<{ success: true; needsVerification: boolean }> {
  const ip = await getClientIp();
  const rl = await checkRateLimit(`auth:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    logger.warn("Rate limit exceeded for signup", { ip });
    throw new Error("Too many attempts. Try again later.");
  }

  const validated = signupSchema.parse(data);

  const existing = await prisma.user.findUnique({
    where: { email: validated.email },
  });

  if (existing) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(validated.password, 12);
  const verificationToken = crypto.randomBytes(32).toString("hex");

  const user = await prisma.user.create({
    data: {
      email: validated.email,
      passwordHash,
      name: validated.name || null,
      verificationToken,
    },
  });

  // Send verification email (non-blocking)
  try {
    await sendEmail(verificationEmail(user.email, verificationToken));
  } catch {
    // Email service might not be configured — still allow login
  }

  await createSession({ id: user.id, email: user.email, plan: user.plan });
  return { success: true, needsVerification: !user.emailVerified };
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<{ success: true }> {
  const ip = await getClientIp();
  const rl = await checkRateLimit(`auth:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    logger.warn("Rate limit exceeded for login", { ip });
    throw new Error("Too many attempts. Try again later.");
  }

  const validated = loginSchema.parse(data);

  const user = await prisma.user.findUnique({
    where: { email: validated.email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const valid = await bcrypt.compare(validated.password, user.passwordHash);
  if (!valid) {
    throw new Error("Invalid email or password");
  }

  await createSession({ id: user.id, email: user.email, plan: user.plan });
  return { success: true };
}

export async function logout() {
  await deleteSession();
}

export async function verifyEmail(token: string): Promise<{ success: boolean }> {
  if (!token) return { success: false };

  const user = await prisma.user.findUnique({
    where: { verificationToken: token },
  });

  if (!user) return { success: false };

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verificationToken: null },
  });

  return { success: true };
}

export async function requestPasswordReset(
  email: string,
): Promise<{ success: true }> {
  z.string().email().parse(email);

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user) return { success: true };

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiresAt },
  });

  try {
    await sendEmail(resetPasswordEmail(user.email, resetToken));
  } catch {
    // Silently fail — don't reveal email existence
  }

  return { success: true };
}

export async function resetPassword(data: {
  token: string;
  password: string;
}): Promise<{ success: boolean }> {
  const password = z.string().min(8).parse(data.password);

  const user = await prisma.user.findUnique({
    where: { resetToken: data.token },
  });

  if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
    return { success: false };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiresAt: null,
    },
  });

  return { success: true };
}
