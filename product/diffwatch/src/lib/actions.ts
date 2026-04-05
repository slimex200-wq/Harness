"use server";

import { z } from "zod";
import { prisma } from "./prisma";
import { crawlUrl } from "./crawler";
import { computeDiff } from "./differ";
import { requireSession } from "./session";
import { getPlanConfig } from "./plans";
import { sendNotifications } from "./notify";
import { discoverPages } from "./discover";
import { revalidatePath } from "next/cache";

const createMonitorSchema = z.object({
  url: z.string().url().startsWith("http"),
  name: z.string().min(1).max(100),
  selector: z.string().max(200).optional(),
  webhookUrl: z.string().url().optional().or(z.literal("")),
});

export async function createMonitor(data: {
  url: string;
  name: string;
  selector?: string;
  webhookUrl?: string;
}) {
  const session = await requireSession();
  const validated = createMonitorSchema.parse(data);

  const plan = getPlanConfig(session.plan);
  const currentCount = await prisma.monitor.count({
    where: { userId: session.userId },
  });

  if (currentCount >= plan.maxMonitors) {
    throw new Error(
      `Plan limit reached: ${plan.name} allows ${plan.maxMonitors} monitors. Upgrade your plan.`,
    );
  }

  const monitor = await prisma.monitor.create({
    data: {
      url: validated.url,
      name: validated.name,
      selector: validated.selector || null,
      webhookUrl: validated.webhookUrl || null,
      userId: session.userId,
    },
  });

  try {
    const result = await crawlUrl(monitor.url, monitor.selector);
    await prisma.snapshot.create({
      data: {
        monitorId: monitor.id,
        content: result.textContent,
        hash: result.hash,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown";
    return { ...monitor, snapshotError: message };
  }

  revalidatePath("/");
  return monitor;
}

export async function discoverCompany(companyName: string) {
  const session = await requireSession();

  const plan = getPlanConfig(session.plan);
  const currentCount = await prisma.monitor.count({
    where: { userId: session.userId },
  });

  const result = await discoverPages(companyName);
  const remaining = plan.maxMonitors - currentCount;

  return {
    baseUrl: result.baseUrl,
    pages: result.pages.slice(0, remaining),
    totalFound: result.pages.length,
    remaining,
  };
}

export async function addDiscoveredMonitors(
  pages: ReadonlyArray<{ url: string; label: string; category: string }>,
) {
  const session = await requireSession();

  const plan = getPlanConfig(session.plan);
  const currentCount = await prisma.monitor.count({
    where: { userId: session.userId },
  });

  const remaining = plan.maxMonitors - currentCount;
  const toAdd = pages.slice(0, remaining);

  const created = [];
  for (const page of toAdd) {
    const monitor = await prisma.monitor.create({
      data: {
        url: page.url,
        name: page.label,
        userId: session.userId,
      },
    });

    try {
      const result = await crawlUrl(monitor.url, null);
      await prisma.snapshot.create({
        data: {
          monitorId: monitor.id,
          content: result.textContent,
          hash: result.hash,
        },
      });
    } catch {
      // Initial snapshot failure — will retry on next check
    }

    created.push(monitor);
  }

  revalidatePath("/");
  return { added: created.length, monitors: created };
}

export async function getMonitors() {
  const session = await requireSession();

  return prisma.monitor.findMany({
    where: { userId: session.userId },
    include: {
      _count: { select: { changes: true, snapshots: true } },
      changes: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMonitor(id: string) {
  const session = await requireSession();

  return prisma.monitor.findUnique({
    where: { id, userId: session.userId },
    include: {
      changes: { orderBy: { createdAt: "desc" }, take: 50 },
      snapshots: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { changes: true } },
    },
  });
}

export async function deleteMonitor(id: string) {
  const session = await requireSession();

  await prisma.monitor.delete({
    where: { id, userId: session.userId },
  });
  revalidatePath("/");
}

export async function updateMonitorWebhook(id: string, webhookUrl: string) {
  const session = await requireSession();
  const parsed = webhookUrl
    ? z.string().url().parse(webhookUrl)
    : null;

  await prisma.monitor.update({
    where: { id, userId: session.userId },
    data: { webhookUrl: parsed },
  });
  revalidatePath("/");
}

export async function checkMonitor(id: string) {
  const monitor = await prisma.monitor.findUnique({
    where: { id },
    include: {
      snapshots: { orderBy: { createdAt: "desc" }, take: 1 },
      user: { select: { email: true, plan: true } },
    },
  });

  if (!monitor) throw new Error("Monitor not found");

  const result = await crawlUrl(monitor.url, monitor.selector);
  const lastSnapshot = monitor.snapshots[0];
  let change = null;

  if (lastSnapshot && lastSnapshot.hash !== result.hash) {
    const diff = computeDiff(lastSnapshot.content, result.textContent);

    if (diff) {
      change = await prisma.change.create({
        data: {
          monitorId: monitor.id,
          category: diff.category,
          summary: diff.summary,
          diff: diff.diff,
          importance: diff.importance,
        },
      });

      // Send notifications
      const plan = getPlanConfig(monitor.user.plan);
      await sendNotifications({
        monitor,
        change: { ...diff, id: change.id },
        userEmail: monitor.user.email,
        plan,
      });

      await prisma.change.update({
        where: { id: change.id },
        data: { notified: true },
      });
    }
  }

  await prisma.snapshot.create({
    data: {
      monitorId: monitor.id,
      content: result.textContent,
      hash: result.hash,
    },
  });

  // Retain only the 10 most recent snapshots per monitor
  const oldSnapshots = await prisma.snapshot.findMany({
    where: { monitorId: monitor.id },
    orderBy: { createdAt: "desc" },
    skip: 10,
    select: { id: true },
  });

  if (oldSnapshots.length > 0) {
    await prisma.snapshot.deleteMany({
      where: { id: { in: oldSnapshots.map((s) => s.id) } },
    });
  }

  revalidatePath("/");
  return { changed: lastSnapshot ? lastSnapshot.hash !== result.hash : false };
}

export async function checkAllMonitors() {
  const pLimit = (await import("p-limit")).default;
  const limit = pLimit(5);

  const monitors = await prisma.monitor.findMany({
    where: { active: true },
  });

  const results = await Promise.allSettled(
    monitors.map((monitor) =>
      limit(async () => {
        const result = await checkMonitor(monitor.id);
        return { id: monitor.id, name: monitor.name, ...result };
      }),
    ),
  );

  return results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : {
          id: monitors[i].id,
          name: monitors[i].name,
          changed: false,
          error: r.reason instanceof Error ? r.reason.message : "Unknown",
        },
  );
}

export async function getDashboardStats() {
  const session = await requireSession();

  const totalMonitors = await prisma.monitor.count({
    where: { userId: session.userId, active: true },
  });
  const totalChanges = await prisma.change.count({
    where: { monitor: { userId: session.userId } },
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentChanges = await prisma.change.findMany({
    where: {
      createdAt: { gte: sevenDaysAgo },
      monitor: { userId: session.userId },
    },
    include: { monitor: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const byCategory = recentChanges.reduce<Record<string, number>>(
    (acc, change) => ({
      ...acc,
      [change.category]: (acc[change.category] ?? 0) + 1,
    }),
    {},
  );

  return {
    totalMonitors,
    totalChanges,
    recentChanges: recentChanges.slice(0, 50),
    byCategory,
    plan: session.plan,
  };
}
