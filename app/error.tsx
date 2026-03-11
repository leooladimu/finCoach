"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="glass rounded-2xl border border-red-500/20 p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />

          <div className="relative text-center mb-6">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Something Went Wrong
            </h1>
            <p className="text-neutral-400">
              We encountered an unexpected error. Don&apos;t worry, your data is
              safe.
            </p>
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="relative mb-6 bg-red-500/10 rounded-xl p-4 border border-red-500/20">
              <p className="text-sm font-mono text-red-400 break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-6 py-3 glass text-neutral-200 font-semibold rounded-xl border border-white/10 hover:border-emerald-500/30 transition-all text-center"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
