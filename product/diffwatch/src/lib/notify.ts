import type { PlanConfig } from "./plans";

interface NotifyParams {
  readonly monitor: {
    readonly name: string;
    readonly url: string;
    readonly webhookUrl: string | null;
  };
  readonly change: {
    readonly id: string;
    readonly category: string;
    readonly importance: string;
    readonly summary: string;
  };
  readonly userEmail: string;
  readonly plan: PlanConfig;
}

async function sendWebhook(
  webhookUrl: string,
  params: NotifyParams,
): Promise<void> {
  const payload = {
    text: `[DiffWatch] ${params.monitor.name}: ${params.change.summary}`,
    embeds: [
      {
        title: `${params.change.category.toUpperCase()} change detected`,
        description: params.change.summary,
        url: params.monitor.url,
        color:
          params.change.importance === "high"
            ? 0xff4444
            : params.change.importance === "medium"
              ? 0xffaa00
              : 0x888888,
        fields: [
          { name: "Monitor", value: params.monitor.name, inline: true },
          { name: "Category", value: params.change.category, inline: true },
          { name: "Importance", value: params.change.importance, inline: true },
        ],
      },
    ],
  };

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000),
  });
}

async function sendEmail(
  email: string,
  params: NotifyParams,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: "DiffWatch <alerts@diffwatch.dev>",
      to: [email],
      subject: `[${params.change.importance.toUpperCase()}] ${params.monitor.name}: ${params.change.category} change`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="margin-bottom: 4px;">${params.monitor.name}</h2>
          <p style="color: #888; font-size: 14px;">${params.monitor.url}</p>
          <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-weight: 600;">${params.change.summary}</p>
            <p style="margin: 8px 0 0; font-size: 13px; color: #666;">
              Category: ${params.change.category} &bull; Importance: ${params.change.importance}
            </p>
          </div>
          <p style="font-size: 12px; color: #aaa;">Sent by DiffWatch</p>
        </div>
      `,
    }),
    signal: AbortSignal.timeout(10000),
  });
}

export async function sendNotifications(params: NotifyParams): Promise<void> {
  const tasks: Promise<void>[] = [];

  if (params.plan.webhookAlerts && params.monitor.webhookUrl) {
    tasks.push(
      sendWebhook(params.monitor.webhookUrl, params).catch(() => {
        // Webhook failure should not block the pipeline
      }),
    );
  }

  if (params.plan.emailAlerts) {
    tasks.push(
      sendEmail(params.userEmail, params).catch(() => {
        // Email failure should not block the pipeline
      }),
    );
  }

  await Promise.all(tasks);
}
