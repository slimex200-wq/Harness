"use client";

import { useState, useTransition } from "react";
import { createMonitor, discoverCompany, addDiscoveredMonitors } from "@/lib/actions";

interface DiscoveredPage {
  readonly url: string;
  readonly category: string;
  readonly label: string;
}

export function AddMonitorForm({
  planHasWebhook,
}: {
  readonly planHasWebhook: boolean;
}) {
  const [mode, setMode] = useState<"company" | "manual">("company");
  const [companyName, setCompanyName] = useState("");
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [selector, setSelector] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Discovery state
  const [discovered, setDiscovered] = useState<DiscoveredPage[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [baseUrl, setBaseUrl] = useState("");

  function handleDiscover(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) return;

    setError("");
    setDiscovered(null);
    startTransition(async () => {
      try {
        const result = await discoverCompany(companyName.trim());
        setBaseUrl(result.baseUrl);
        if (result.pages.length === 0) {
          setError("No trackable pages found. Try adding a URL manually.");
        } else {
          setDiscovered(result.pages);
          setSelected(new Set(result.pages.map((_, i) => i)));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Discovery failed");
      }
    });
  }

  function handleAddDiscovered() {
    if (!discovered) return;

    const pages = discovered.filter((_, i) => selected.has(i));
    if (pages.length === 0) return;

    setError("");
    startTransition(async () => {
      try {
        await addDiscoveredMonitors(pages);
        setDiscovered(null);
        setSelected(new Set());
        setCompanyName("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add monitors");
      }
    });
  }

  function handleManualSubmit(e: React.FormEvent) {
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

  function toggleSelect(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  const CATEGORY_COLORS: Record<string, string> = {
    pricing: "bg-red-500/20 text-red-300 border-red-500/30",
    changelog: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    blog: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    product: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    docs: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    about: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 mb-2">
        <button
          type="button"
          onClick={() => { setMode("company"); setDiscovered(null); setError(""); }}
          className={`text-xs px-3 py-1 rounded-lg transition-colors ${mode === "company" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "text-zinc-500 hover:text-zinc-300"}`}
        >
          Company name
        </button>
        <button
          type="button"
          onClick={() => { setMode("manual"); setDiscovered(null); setError(""); }}
          className={`text-xs px-3 py-1 rounded-lg transition-colors ${mode === "manual" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "text-zinc-500 hover:text-zinc-300"}`}
        >
          Manual URL
        </button>
      </div>

      {mode === "company" ? (
        <>
          <form onSubmit={handleDiscover} className="flex gap-2">
            <input
              type="text"
              placeholder="Company name (e.g. Stripe, Notion, Linear)"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isPending || !companyName.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-500 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50 transition-colors"
            >
              {isPending && !discovered ? "Scanning..." : "Discover"}
            </button>
          </form>

          {discovered && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  Found {discovered.length} pages on{" "}
                  <span className="text-zinc-200">{baseUrl}</span>
                </p>
                <button
                  onClick={handleAddDiscovered}
                  disabled={isPending || selected.size === 0}
                  className="px-4 py-1.5 rounded-lg bg-indigo-500 text-xs font-semibold text-white hover:bg-indigo-400 disabled:opacity-50 transition-colors"
                >
                  {isPending ? "Adding..." : `Track ${selected.size} pages`}
                </button>
              </div>

              <div className="space-y-2">
                {discovered.map((page, i) => (
                  <label
                    key={page.url}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      selected.has(i)
                        ? "border-indigo-500/30 bg-indigo-500/5"
                        : "border-zinc-800 bg-zinc-900/50 opacity-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(i)}
                      onChange={() => toggleSelect(i)}
                      className="accent-indigo-500"
                    />
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[page.category] ?? CATEGORY_COLORS.about}`}>
                      {page.category}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 truncate">{page.label}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{page.url}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <form onSubmit={handleManualSubmit} className="space-y-3">
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
        </form>
      )}

      {error && <p className="text-xs text-red-400 px-1">{error}</p>}
    </div>
  );
}
