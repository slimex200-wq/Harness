"use client";

import { useState } from "react";

export function DiffViewer({ diff }: { readonly diff: string }) {
  const [expanded, setExpanded] = useState(false);

  if (!diff) return null;

  const lines = diff.split("\n");
  const preview = lines.slice(0, 8);
  const hasMore = lines.length > 8;

  const displayLines = expanded ? lines : preview;

  return (
    <div>
      <div className="rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden">
        <pre className="text-xs p-3 overflow-x-auto leading-relaxed">
          {displayLines.map((line, i) => {
            let className = "text-zinc-500";
            if (line.startsWith("+ ")) className = "text-emerald-400";
            else if (line.startsWith("- ")) className = "text-red-400";

            return (
              <div key={i} className={className}>
                {line}
              </div>
            );
          })}
        </pre>
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          {expanded ? "Collapse" : `Show all ${lines.length} lines`}
        </button>
      )}
    </div>
  );
}
