import { getMonitors, getDashboardStats } from "@/lib/actions";
import { getSession } from "@/lib/session";
import { getPlanConfig } from "@/lib/plans";
import { AddMonitorForm } from "@/components/add-monitor-form";
import { MonitorList } from "@/components/monitor-list";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [monitors, stats, session] = await Promise.all([
    getMonitors(),
    getDashboardStats(),
    getSession(),
  ]);

  const plan = getPlanConfig(stats.plan);

  return (
    <div className="min-h-screen">
      {/* Top nav */}
      <nav className="border-b border-zinc-800/50 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold text-white tracking-tight">
              DiffWatch
            </Link>
            <div className="hidden sm:flex items-center gap-1 text-xs text-zinc-500">
              <span className="px-2 py-1 rounded bg-zinc-800/50">{plan.name}</span>
              <span>{stats.totalMonitors}/{plan.maxMonitors} monitors</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {session?.email}
            </Link>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats row */}
        <div className="flex items-center gap-8 mb-8 text-sm">
          <div>
            <span className="text-2xl font-bold text-white">{stats.totalChanges}</span>
            <span className="text-zinc-500 ml-2">changes detected</span>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <div>
            <span className="text-2xl font-bold text-white">{stats.recentChanges.length}</span>
            <span className="text-zinc-500 ml-2">this week</span>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Checking every</span>
            <span className="font-medium text-zinc-200 capitalize">{plan.checkInterval}</span>
          </div>
          {Object.keys(stats.byCategory).length > 0 && (
            <>
              <div className="h-4 w-px bg-zinc-800" />
              <div className="flex gap-2">
                {Object.entries(stats.byCategory).map(([cat, count]) => (
                  <span
                    key={cat}
                    className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400"
                  >
                    {cat} {count}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Add + Recent activity */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                Add monitor
              </h2>
              <AddMonitorForm planHasWebhook={plan.webhookAlerts} />
            </div>

            {stats.recentChanges.length > 0 && (
              <div>
                <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                  Recent activity
                </h2>
                <div className="space-y-1">
                  {stats.recentChanges.slice(0, 8).map((change) => (
                    <div key={change.id} className="flex items-baseline gap-2 py-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                        change.importance === "high" ? "bg-red-500" :
                        change.importance === "medium" ? "bg-amber-500" : "bg-zinc-600"
                      }`} />
                      <div className="min-w-0">
                        <p className="text-xs text-zinc-300 truncate">{change.summary}</p>
                        <p className="text-[10px] text-zinc-600">
                          {change.monitor.name} &middot; {new Date(change.createdAt).toLocaleDateString("ko")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Monitors */}
          <div className="lg:col-span-2">
            {monitors.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-800 p-10 text-center">
                <p className="text-zinc-400 text-sm mb-1">No monitors yet</p>
                <p className="text-zinc-600 text-xs">
                  Enter a company name or URL on the left to start tracking changes.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Monitors ({monitors.length})
                  </h2>
                </div>
                <MonitorList monitors={monitors} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
