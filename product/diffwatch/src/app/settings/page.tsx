import { getSession } from "@/lib/session";
import { getPlanConfig, PLANS } from "@/lib/plans";
import { redirect } from "next/navigation";
import { UpgradeButton } from "@/components/upgrade-button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/landing");

  const currentPlan = getPlanConfig(session.plan);

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

        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        <section className="mb-10">
          <h2 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">
            Account
          </h2>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Email</span>
              <span className="text-zinc-200">{session.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Plan</span>
              <span className="text-indigo-300 font-semibold uppercase">{currentPlan.name}</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">
            Plans
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {Object.entries(PLANS).map(([key, plan]) => {
              const isCurrent = key === session.plan;
              const prices: Record<string, string> = {
                free: "$0",
                starter: "$15",
                pro: "$39",
                team: "$79",
              };

              return (
                <div
                  key={key}
                  className={`rounded-xl border p-4 ${
                    isCurrent
                      ? "border-indigo-500/50 bg-indigo-500/5"
                      : "border-zinc-800 bg-zinc-900/30"
                  }`}
                >
                  <h3 className="font-semibold text-zinc-200">{plan.name}</h3>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">{prices[key]}</span>
                    <span className="text-zinc-500 text-xs">/mo</span>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-xs text-zinc-400">
                    <li>{plan.maxMonitors} monitors</li>
                    <li>{plan.checkInterval} checks</li>
                    <li>{plan.historyDays === -1 ? "Unlimited" : `${plan.historyDays}-day`} history</li>
                    {plan.webhookAlerts && <li>Webhook alerts</li>}
                    {plan.emailAlerts && <li>Email alerts</li>}
                    {plan.apiAccess && <li>API access</li>}
                  </ul>
                  <div className="mt-4">
                    {isCurrent ? (
                      <span className="text-xs text-indigo-400 font-medium">Current plan</span>
                    ) : key === "free" ? null : (
                      <UpgradeButton plan={key} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
