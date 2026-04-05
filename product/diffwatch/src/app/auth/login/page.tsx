"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/auth-actions";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await login({ email, password });
        router.push("/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Login failed");
      }
    });
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 items-center justify-center p-12">
        <div className="max-w-sm">
          <h2 className="text-2xl font-bold text-white mb-3">DiffWatch</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Know when competitors change their pricing, launch features,
            or shift positioning. Before they tell the market — you already know.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white">Sign in</h1>
          <p className="text-sm text-zinc-500 mt-1">Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Min 8 characters"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 rounded-xl bg-indigo-500 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-zinc-500">
            No account?{" "}
            <Link href="/auth/register" className="text-indigo-400 hover:text-indigo-300">
              Sign up free
            </Link>
          </p>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
