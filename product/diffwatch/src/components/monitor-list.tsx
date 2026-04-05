"use client";

import { useTransition } from "react";
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
  pricing: "bg-red-500/20 text-red-300 border-red-500/30",
  feature: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  copy: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  design: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  other: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
};

const IMPORTANCE_DOTS: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-zinc-500",
};

export function MonitorList({ monitors }: { readonly monitors: readonly MonitorItem[] }) {
  const [isPending, startTransition] = useTransition();

  function handleCheck(id: string) {
    startTransition(async () => {
      await checkMonitor(id);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteMonitor(id);
    });
  }

  if (monitors.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-500">
        <p className="text-lg mb-1">No monitors yet</p>
        <p className="text-sm">Add a URL above to start tracking changes</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {monitors.map((m) => {
        const lastChange = m.changes[0];
        return (
          <div
            key={m.id}
            className={`rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 hover:border-zinc-700 transition-colors ${isPending ? "opacity-50" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-zinc-200 truncate">{m.name}</h3>
                  <span className="text-xs text-zinc-600">{m._count.changes} changes</span>
                </div>
                <p className="text-xs text-zinc-500 truncate mt-0.5">{m.url}</p>
              </div>

              <div className="flex gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleCheck(m.id)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs font-medium hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors"
                >
                  Check now
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="px-2 py-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {lastChange && (
              <div className="mt-3 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${IMPORTANCE_DOTS[lastChange.importance] ?? IMPORTANCE_DOTS.low}`} />
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[lastChange.category] ?? CATEGORY_COLORS.other}`}>
                  {lastChange.category}
                </span>
                <span className="text-xs text-zinc-400 truncate">
                  {lastChange.summary}
                </span>
                <span className="text-[10px] text-zinc-600 ml-auto flex-shrink-0">
                  {new Date(lastChange.createdAt).toLocaleDateString("ko")}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
