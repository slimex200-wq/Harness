"use client";

import { useState } from "react";

export function UpgradeButton({ plan }: { readonly plan: string }) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Stripe not configured yet");
      }
    } catch {
      alert("Failed to start checkout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="w-full py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs font-medium hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors disabled:opacity-50"
    >
      {loading ? "..." : "Upgrade"}
    </button>
  );
}
