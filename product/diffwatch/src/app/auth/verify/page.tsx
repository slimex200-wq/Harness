import { verifyEmail } from "@/lib/auth-actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token ? await verifyEmail(token) : { success: false };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-white mb-4">
          {result.success ? "Email Verified" : "Verification Failed"}
        </h1>
        <p className="text-sm text-zinc-400 mb-6">
          {result.success
            ? "Your email has been verified. You can now use all features."
            : "Invalid or expired verification link."}
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
