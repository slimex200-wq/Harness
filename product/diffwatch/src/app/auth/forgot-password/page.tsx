"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/auth-actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await requestPasswordReset(email);
        setSubmitted(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">DiffWatch</h1>
          <p className="text-sm text-zinc-500 mt-1">Reset your password</p>
        </div>

        {submitted ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/30 mx-auto">
              <span className="text-indigo-400 text-lg">@</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Check your email</h2>
              <p className="text-sm text-zinc-400 mt-1">
                If an account exists for <span className="text-zinc-200">{email}</span>, we&apos;ve sent a reset link.
              </p>
            </div>
            <Link
              href="/auth/login"
              className="block text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <>
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

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 rounded-xl bg-indigo-500 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50 transition-colors"
              >
                {isPending ? "Sending..." : "Send reset link"}
              </button>
            </form>

            <p className="text-center text-sm text-zinc-500 mt-6">
              <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300">
                Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
