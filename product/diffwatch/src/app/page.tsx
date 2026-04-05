import { getMonitors, getDashboardStats } from "@/lib/actions";
import { AddMonitorForm } from "@/components/add-monitor-form";
import { MonitorList } from "@/components/monitor-list";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [monitors, stats] = await Promise.all([
    getMonitors(),
    getDashboardStats(),
  ]);

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-3xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">DiffWatch</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Competitive intelligence. Track website changes in real-time.
          </p>
        </header>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.totalMonitors}</div>
            <div className="text-xs text-zinc-500 mt-1">Monitors</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.totalChanges}</div>
            <div className="text-xs text-zinc-500 mt-1">Changes</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {stats.recentChanges.length}
            </div>
            <div className="text-xs text-zinc-500 mt-1">Last 7 days</div>
          </div>
        </div>

        {Object.keys(stats.byCategory).length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {Object.entries(stats.byCategory).map(([cat, count]) => (
              <span
                key={cat}
                className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300"
              >
                {cat}: {count}
              </span>
            ))}
          </div>
        )}

        <div className="mb-8">
          <AddMonitorForm />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">
            Monitors
          </h2>
          <MonitorList monitors={monitors} />
        </div>
      </div>
    </div>
  );
}
