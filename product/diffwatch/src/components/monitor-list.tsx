"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteMonitor, checkMonitor } from "@/lib/actions";

interface MonitorItem {
  readonly id: string;
  readonly url: string;
  readonly name: string;
  readonly active: boolean;
  readonly createdAt: Date;
  readonly _count: { readonly changes: number; readonly snapshots: number };
  readonly changes: ReadonlyArray<{
    readonly category: string;
    readonly importance: string;
    readonly summary: string;
    readonly createdAt: Date;
  }>;
}

const CATEGORY_COLORS: Record<string, string> = {
  pricing: "bg-red-500/15 text-red-400",
  feature: "bg-blue-500/15 text-blue-400",
  copy: "bg-zinc-500/15 text-zinc-400",
  design: "bg-purple-500/15 text-purple-400",
  other: "bg-zinc-500/15 text-zinc-400",
};

type CheckFeedback = { changed: boolean } | { error: string };

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function MonitorList({ monitors }: { readonly monitors: readonly MonitorItem[] }) {
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [checkFeedback, setCheckFeedback] = useState<Record<string, CheckFeedback>>({});

  async function handleCheck(id: string) {
    setPendingIds((prev) => new Set([...prev, id]));
    setCheckFeedback((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    try {
      const result = await checkMonitor(id);
      setCheckFeedback((prev) => ({ ...prev, [id]: result }));
    } catch (err) {
      setCheckFeedback((prev) => ({
        ...prev,
        [id]: { error: err instanceof Error ? err.message : "Check failed" },
      }));
    } finally {
      setPendingIds((prev) => {
        const next = new Set([...prev]);
        next.delete(id);
        return next;
      });
    }
  }

  async function handleDelete(id: string) {
    setDeleteConfirmId(null);
    setPendingIds((prev) => new Set([...prev, id]));
    try {
      await deleteMonitor(id);
    } finally {
      setPendingIds((prev) => {
        const next = new Set([...prev]);
        next.delete(id);
        return next;
      });
    }
  }

  if (monitors.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-800 p-10 text-center">
        <p className="text-zinc-400 text-sm mb-1">No monitors yet</p>
        <p className="text-zinc-600 text-xs">
          Enter a company name or URL to start tracking changes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {monitors.map((m) => {
        const lastChange = m.changes[0];
        const isPending = pendingIds.has(m.id);
        const feedback = checkFeedback[m.id];
        const domain = getDomain(m.url);

        return (
          <div
            key={m.id}
            className={`group rounded-lg border border-zinc-800/80 bg-zinc-900/30 hover:border-zinc-700 transition-all ${isPending ? "opacity-50 pointer-events-none" : ""}`}
          >
            <div className="p-4">
              {/* Top row: name + domain + actions */}
              <div className="flex items-center justify-between gap-3 mb-2">
                <Link href={`/monitor/${m.id}`} className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Favicon */}
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                    alt=""
                    width={16}
                    height={16}
                    className="shrink-0 rounded-sm"
                  />
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                      {m.name}
                    </span>
                    <span className="text-xs text-zinc-600 ml-2">{domain}</span>
                  </div>
                </Link>

                <div className="flex items-center gap-2 shrink-0">
                  {m._count.changes > 0 && (
                    <span className="text-[10px] text-zinc-500 tabular-nums">
                      {m._count.changes} changes
                    </span>
                  )}
                  <button
                    onClick={() => handleCheck(m.id)}
                    disabled={isPending}
                    className="px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-400 text-[11px] font-medium hover:bg-zinc-700 hover:text-zinc-200 transition-colors disabled:opacity-50"
                  >
                    {isPending ? "..." : "Check"}
                  </button>

                  {deleteConfirmId === m.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="px-2 py-1 rounded-md text-red-400 bg-red-500/10 text-[11px] font-medium hover:bg-red-500/20 transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 rounded-md text-zinc-500 text-[11px] hover:text-zinc-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(m.id)}
                      className="p-1 rounded-md text-zinc-700 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Feedback row */}
              {feedback && (
                <div className="mb-2 ml-7">
                  {"error" in feedback ? (
                    <span className="text-[11px] text-red-400">Failed: {feedback.error}</span>
                  ) : feedback.changed ? (
                    <span className="text-[11px] text-emerald-400">Change detected</span>
                  ) : (
                    <span className="text-[11px] text-zinc-600">No changes</span>
                  )}
                </div>
              )}

              {/* Last change row */}
              {lastChange ? (
                <div className="flex items-center gap-2 ml-7">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${CATEGORY_COLORS[lastChange.category] ?? CATEGORY_COLORS.other}`}>
                    {lastChange.category}
                  </span>
                  <span className="text-[11px] text-zinc-500 truncate flex-1">
                    {lastChange.summary}
                  </span>
                  <span className="text-[10px] text-zinc-700 shrink-0 tabular-nums">
                    {timeAgo(lastChange.createdAt)}
                  </span>
                </div>
              ) : (
                <div className="ml-7">
                  <span className="text-[11px] text-zinc-700">
                    Added {timeAgo(m.createdAt)} &middot; No changes yet
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
