"use client";

import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // 서버사이드에서 logger는 클라이언트 컴포넌트에서 직접 사용 불가
    // digest를 포함해 콘솔에 기록
    console.error("[Error Boundary]", error.digest ?? "no-digest", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-4">
        <h2 className="text-xl font-semibold text-white">
          Something went wrong
        </h2>
        <p className="text-sm text-zinc-400">
          An unexpected error occurred. Please try again.
        </p>
        {error.digest && (
          <p className="text-xs text-zinc-600 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <button
          onClick={() => unstable_retry()}
          className="mt-4 px-6 py-2.5 rounded-xl bg-indigo-500 text-sm font-semibold text-white hover:bg-indigo-400 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
