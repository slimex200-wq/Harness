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
      <div className="w-full max-w-3xl mx-auto px-4 py-8">
        <header className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">DiffWatch</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Competitive intelligence. Track website changes in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {session?.email}
            </Link>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
              {plan.name}
            </span>
            <LogoutButton />
          </div>
        </header>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.totalMonitors}</div>
            <div className="text-xs text-zinc-500 mt-1">
              Monitors ({stats.totalMonitors}/{plan.maxMonitors})
            </div>
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
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-center">
            <div className="text-2xl font-bold text-white capitalize">{plan.checkInterval}</div>
            <div className="text-xs text-zinc-500 mt-1">Check freq.</div>
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
          <AddMonitorForm planHasWebhook={plan.webhookAlerts} />
        </div>

        {monitors.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-8">
            <h2 className="text-lg font-semibold text-white mb-2">Welcome to DiffWatch</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Track any website for changes and get notified instantly. Here&apos;s how it works:
            </p>
            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold text-indigo-400">
                  1
                </span>
                <div>
                  <p className="text-sm font-medium text-zinc-200">Enter a URL to monitor</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Paste any public URL — competitor pricing pages, product announcements, docs.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold text-indigo-400">
                  2
                </span>
                <div>
                  <p className="text-sm font-medium text-zinc-200">Get notified when changes are detected</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    DiffWatch checks automatically and emails you a diff whenever something changes.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold text-indigo-400">
                  3
                </span>
                <div>
                  <p className="text-sm font-medium text-zinc-200">Stay ahead of the competition</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    React faster to competitor moves, pricing updates, and product launches.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        ) : (
          <div>
            <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">
              Monitors
            </h2>
            <MonitorList monitors={monitors} />
          </div>
        )}
      </div>
    </div>
  );
}
