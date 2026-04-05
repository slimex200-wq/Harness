import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-4">
        <p className="text-6xl font-bold text-zinc-700">404</p>
        <h2 className="text-xl font-semibold text-white">Page not found</h2>
        <p className="text-sm text-zinc-400">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-indigo-500 text-sm font-semibold text-white hover:bg-indigo-400 transition-colors"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
