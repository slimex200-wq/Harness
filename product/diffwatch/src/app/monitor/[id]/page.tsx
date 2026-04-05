import { notFound } from "next/navigation";
import Link from "next/link";
import { getMonitor } from "@/lib/actions";
import { DiffViewer } from "@/components/diff-viewer";

export const dynamic = "force-dynamic";

const CATEGORY_COLORS: Record<string, string> = {
  pricing: "bg-red-500/20 text-red-300 border-red-500/30",
  feature: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  copy: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  design: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  other: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
};

const IMPORTANCE_LABELS: Record<string, { text: string; color: string }> = {
  high: { text: "HIGH", color: "text-red-400" },
  medium: { text: "MED", color: "text-amber-400" },
  low: { text: "LOW", color: "text-zinc-500" },
};

export default async function MonitorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const monitor = await getMonitor(id);

  if (!monitor) notFound();

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1 mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <header className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">{monitor.name}</h1>
          <p className="text-sm text-zinc-500 mt-1 truncate">{monitor.url}</p>
          <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
            <span>{monitor._count.changes} total changes</span>
            <span>Interval: {monitor.interval}</span>
            <span className={monitor.active ? "text-emerald-500" : "text-zinc-600"}>
              {monitor.active ? "Active" : "Paused"}
            </span>
          </div>
        </header>

        <h2 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">
          Change History
        </h2>

        {monitor.changes.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p>No changes detected yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {monitor.changes.map((change) => {
              const imp = IMPORTANCE_LABELS[change.importance] ?? IMPORTANCE_LABELS.low;
              return (
                <div
                  key={change.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[change.category] ?? CATEGORY_COLORS.other}`}>
                      {change.category}
                    </span>
                    <span className={`text-[10px] font-bold ${imp.color}`}>
                      {imp.text}
                    </span>
                    <span className="text-[10px] text-zinc-600 ml-auto">
                      {new Date(change.createdAt).toLocaleString("ko")}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-300 mb-3">{change.summary}</p>

                  <DiffViewer diff={change.diff} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
