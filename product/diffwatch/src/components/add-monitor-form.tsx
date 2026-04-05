"use client";

import { useState, useTransition } from "react";
import { createMonitor } from "@/lib/actions";

export function AddMonitorForm({
  planHasWebhook,
}: {
  readonly planHasWebhook: boolean;
}) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [selector, setSelector] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || !name.trim()) return;

    setError("");
    startTransition(async () => {
      try {
        await createMonitor({
          url: url.trim(),
          name: name.trim(),
          selector: selector.trim() || undefined,
          webhookUrl: webhookUrl.trim() || undefined,
        });
        setUrl("");
        setName("");
        setSelector("");
        setWebhookUrl("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Monitor name (e.g. Stripe Pricing)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={isPending || !url.trim() || !name.trim()}
          className="px-5 py-2.5 rounded-xl bg-indigo-500 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50 transition-colors"
        >
          {isPending ? "..." : "Track"}
        </button>
      </div>
      <input
        type="url"
        placeholder="https://competitor.com/pricing"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
        className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <input
        type="text"
        placeholder="CSS selector (optional, e.g. .pricing-table)"
        value={selector}
        onChange={(e) => setSelector(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-xs text-zinc-400 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      {planHasWebhook && (
        <input
          type="url"
          placeholder="Webhook URL for alerts (Slack/Discord, optional)"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-xs text-zinc-400 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      )}
      {error && (
        <p className="text-xs text-red-400 px-1">{error}</p>
      )}
    </form>
  );
}
