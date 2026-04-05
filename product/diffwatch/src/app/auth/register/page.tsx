"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup } from "@/lib/auth-actions";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await signup({ email, password, name: name || undefined });
        router.push("/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Signup failed");
      }
    });
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 items-center justify-center p-12">
        <div className="max-w-sm">
          <h2 className="text-2xl font-bold text-white mb-3">DiffWatch</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            Track competitor changes automatically. Get alerted when they update
            pricing, launch features, or shift their messaging.
          </p>
          <ul className="space-y-2 text-sm text-zinc-500">
            <li>3 free monitors included</li>
            <li>No credit card required</li>
            <li>Set up in under a minute</li>
          </ul>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-white">Create your account</h1>
            <p className="text-sm text-zinc-500 mt-1">Start tracking competitors for free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Min 8 characters"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 rounded-lg bg-white text-sm font-semibold text-zinc-950 hover:bg-zinc-100 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Creating account..." : "Create free account"}
            </button>
          </form>

          <p className="text-sm text-zinc-500 mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-white hover:text-zinc-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
