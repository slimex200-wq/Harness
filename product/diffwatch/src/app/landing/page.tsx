import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <section className="relative px-6 py-32 sm:py-40">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/50 via-zinc-950 to-zinc-950" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            Competitive Intelligence Platform
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-tight">
            <span className="text-white">Know when competitors</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              change anything.
            </span>
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            DiffWatch monitors competitor websites and instantly tells you what changed -
            pricing updates, new features, copy changes - classified by importance,
            not pixel noise.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-400 transition-all"
            >
              Start tracking for free
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-700 px-8 py-3.5 text-base font-semibold text-zinc-300 hover:border-zinc-500 transition-all"
            >
              Sign in
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto text-center">
            <div>
              <div className="text-3xl font-bold text-white">5s</div>
              <div className="text-sm text-zinc-500 mt-1">Setup time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">4</div>
              <div className="text-sm text-zinc-500 mt-1">Change categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">0</div>
              <div className="text-sm text-zinc-500 mt-1">Pixel noise</div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 bg-zinc-900/30">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-16">
            Not just another change detector
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center mb-4">
                <span className="text-red-400 text-lg font-bold">$</span>
              </div>
              <h3 className="font-semibold text-zinc-200 mb-2">Pricing Intelligence</h3>
              <p className="text-sm text-zinc-500">
                Detects price changes, plan restructuring, and discount patterns.
                Classified as HIGH importance automatically.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <span className="text-blue-400 text-lg font-bold">+</span>
              </div>
              <h3 className="font-semibold text-zinc-200 mb-2">Feature Tracking</h3>
              <p className="text-sm text-zinc-500">
                Spots new feature announcements, integration launches, and
                capability changes before your team does.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="w-10 h-10 rounded-lg bg-zinc-500/20 flex items-center justify-center mb-4">
                <span className="text-zinc-400 text-lg font-bold">A</span>
              </div>
              <h3 className="font-semibold text-zinc-200 mb-2">Copy Changes</h3>
              <p className="text-sm text-zinc-500">
                Tracks messaging shifts, positioning changes, and value prop
                updates. Low noise, high signal.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-16">Pricing</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Starter",
                price: "$15",
                features: ["5 URLs", "Daily checks", "Email alerts", "7-day history"],
              },
              {
                name: "Pro",
                price: "$39",
                popular: true,
                features: ["25 URLs", "Hourly checks", "Slack alerts", "Trend dashboard", "90-day history"],
              },
              {
                name: "Team",
                price: "$79",
                features: ["100 URLs", "Real-time", "API access", "Team sharing", "Unlimited history"],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-6 ${
                  plan.popular
                    ? "border-indigo-500/50 bg-indigo-500/5"
                    : "border-zinc-800 bg-zinc-900/50"
                }`}
              >
                {plan.popular && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500 text-white mb-3 inline-block">
                    Most Popular
                  </span>
                )}
                <h3 className="font-semibold text-zinc-200">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-zinc-500">/mo</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-zinc-400">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-800 px-6 py-8">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <span className="font-bold text-zinc-200">DiffWatch</span>
          <span className="text-xs text-zinc-600">Built with Harness Maker</span>
        </div>
      </footer>
    </div>
  );
}
