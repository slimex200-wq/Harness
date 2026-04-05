const RESEND_API = "https://api.resend.com/emails";

interface EmailParams {
  readonly to: string;
  readonly subject: string;
  readonly html: string;
}

export async function sendEmail(params: EmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Email service not configured");
  }

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: "DiffWatch <noreply@diffwatch.dev>",
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`Email send failed: ${res.status}`);
  }
}

export function verificationEmail(email: string, token: string): EmailParams {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;
  return {
    to: email,
    subject: "Verify your DiffWatch account",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 0;">
        <h2 style="margin-bottom: 16px;">Welcome to DiffWatch</h2>
        <p style="color: #555; line-height: 1.6;">
          Click the button below to verify your email address.
        </p>
        <a href="${url}" style="display: inline-block; margin: 24px 0; padding: 12px 32px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Verify Email
        </a>
        <p style="font-size: 12px; color: #999;">
          If you didn't create this account, ignore this email.
        </p>
      </div>
    `,
  };
}

export function resetPasswordEmail(email: string, token: string): EmailParams {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
  return {
    to: email,
    subject: "Reset your DiffWatch password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 0;">
        <h2 style="margin-bottom: 16px;">Password Reset</h2>
        <p style="color: #555; line-height: 1.6;">
          Click the button below to reset your password. This link expires in 1 hour.
        </p>
        <a href="${url}" style="display: inline-block; margin: 24px 0; padding: 12px 32px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Reset Password
        </a>
        <p style="font-size: 12px; color: #999;">
          If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  };
}
