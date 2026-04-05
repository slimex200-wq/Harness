import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <span className="text-lg font-bold text-white tracking-tight">DiffWatch</span>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="text-sm font-medium text-white bg-white/10 hover:bg-white/15 px-4 py-2 rounded-lg border border-white/10 transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero — left-aligned, no gradients */}
      <section className="px-6 pt-24 pb-20 max-w-5xl mx-auto">
        <div className="max-w-2xl">
          <p className="text-sm text-zinc-500 mb-4 uppercase tracking-widest font-medium">
            Competitive intelligence
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-[1.15] tracking-tight">
            Your competitors changed
            <br />
            their pricing last Tuesday.
            <br />
            <span className="text-zinc-500">You found out today.</span>
          </h1>
          <p className="mt-6 text-lg text-zinc-400 leading-relaxed max-w-lg">
            DiffWatch monitors competitor websites and tells you exactly what
            changed — pricing, features, positioning. Categorized by type,
            ranked by importance.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/auth/register"
              className="inline-flex items-center px-6 py-3 text-sm font-semibold text-zinc-950 bg-white hover:bg-zinc-100 rounded-lg transition-colors"
            >
              Start free
            </Link>
            <Link
              href="#how"
              className="inline-flex items-center px-6 py-3 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="border-y border-zinc-800/50 px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center gap-8 text-sm text-zinc-500">
          <span>Monitors checked every <strong className="text-zinc-300">6 hours</strong></span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">Changes classified into <strong className="text-zinc-300">4 categories</strong></span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">Alerts via <strong className="text-zinc-300">email + Slack</strong></span>
        </div>
      </section>

      {/* How it works — horizontal steps, not 3-column grid */}
      <section id="how" className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-sm text-zinc-500 uppercase tracking-widest font-medium mb-12">
          How it works
        </h2>
        <div className="space-y-12">
          <div className="flex gap-6 items-start">
            <span className="text-sm font-mono text-zinc-600 mt-0.5 shrink-0 w-6">01</span>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Enter a company name</h3>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
                Type "Stripe" and DiffWatch finds their pricing page, changelog, and product
                pages automatically. Or paste a specific URL.
              </p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <span className="text-sm font-mono text-zinc-600 mt-0.5 shrink-0 w-6">02</span>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">We check for changes</h3>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
                Every 6 hours, DiffWatch crawls each URL and compares it to the last
                snapshot. When something changes, we classify it automatically.
              </p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <span className="text-sm font-mono text-zinc-600 mt-0.5 shrink-0 w-6">03</span>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Get a diff, not noise</h3>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
                Pricing changes are flagged as high priority. New feature announcements
                as medium. Minor copy edits as low. You decide what matters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories — minimal, table-like */}
      <section className="px-6 py-20 border-t border-zinc-800/50 max-w-5xl mx-auto">
        <h2 className="text-sm text-zinc-500 uppercase tracking-widest font-medium mb-8">
          What we detect
        </h2>
        <div className="grid sm:grid-cols-2 gap-x-16 gap-y-6">
          {[
            { label: "Pricing", desc: "Price changes, plan restructuring, new tiers, discount patterns", priority: "High" },
            { label: "Features", desc: "New capabilities, integrations, beta launches, deprecations", priority: "Medium" },
            { label: "Positioning", desc: "Messaging shifts, value prop changes, target audience pivots", priority: "Low" },
            { label: "Operations", desc: "Team pages, careers, about us — signals of company direction", priority: "Low" },
          ].map((item) => (
            <div key={item.label} className="flex items-baseline gap-3 py-3 border-b border-zinc-800/30">
              <span className="text-sm font-medium text-zinc-200 w-24 shrink-0">{item.label}</span>
              <span className="text-sm text-zinc-500 flex-1">{item.desc}</span>
              <span className={`text-xs font-medium shrink-0 ${
                item.priority === "High" ? "text-red-400" : item.priority === "Medium" ? "text-amber-400" : "text-zinc-600"
              }`}>
                {item.priority}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing — clean, no colored borders */}
      <section className="px-6 py-20 border-t border-zinc-800/50 max-w-5xl mx-auto">
        <h2 className="text-sm text-zinc-500 uppercase tracking-widest font-medium mb-2">
          Pricing
        </h2>
        <p className="text-zinc-400 text-sm mb-10">Start free. Upgrade when you need more.</p>

        <div className="grid sm:grid-cols-4 gap-4">
          {[
            { name: "Free", price: "$0", monitors: "3", interval: "Daily", features: ["Email alerts", "7-day history"] },
            { name: "Starter", price: "$15", monitors: "5", interval: "Daily", features: ["Email alerts", "7-day history"] },
            { name: "Pro", price: "$39", monitors: "25", interval: "6h", features: ["Slack + email", "90-day history", "Webhook alerts"], popular: true },
            { name: "Team", price: "$79", monitors: "100", interval: "6h", features: ["Everything in Pro", "API access", "Unlimited history"] },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg p-5 ${
                plan.popular
                  ? "bg-white text-zinc-950 ring-1 ring-white"
                  : "bg-zinc-900/50 ring-1 ring-zinc-800"
              }`}
            >
              <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${plan.popular ? "text-zinc-500" : "text-zinc-500"}`}>
                {plan.name}
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className={`text-3xl font-bold ${plan.popular ? "text-zinc-950" : "text-white"}`}>{plan.price}</span>
                <span className={`text-sm ${plan.popular ? "text-zinc-500" : "text-zinc-600"}`}>/mo</span>
              </div>
              <p className={`text-xs mb-4 ${plan.popular ? "text-zinc-500" : "text-zinc-600"}`}>
                {plan.monitors} monitors, {plan.interval} checks
              </p>
              <ul className="space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className={`text-xs ${plan.popular ? "text-zinc-600" : "text-zinc-500"}`}>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className={`block mt-5 text-center text-xs font-medium py-2 rounded-md transition-colors ${
                  plan.popular
                    ? "bg-zinc-950 text-white hover:bg-zinc-800"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {plan.price === "$0" ? "Start free" : "Get started"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 px-6 py-6 max-w-5xl mx-auto flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-400">DiffWatch</span>
        <span className="text-xs text-zinc-700">Built with Harness Maker</span>
      </footer>
    </div>
  );
}
