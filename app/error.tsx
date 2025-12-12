'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-gradient-to-br from-red-50 to-amber-50 rounded-lg border-4 border-double border-red-800/40 p-8 shadow-2xl relative overflow-hidden">
          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-red-900/30" />
          <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-red-900/30" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-red-900/30" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-red-900/30" />

          <div className="text-center mb-6">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">
              Something Went Wrong
            </h1>
            <p className="text-stone-700 font-serif">
              We encountered an unexpected error. Don&apos;t worry, your data is safe.
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 bg-red-100/60 rounded-lg p-4 border border-red-300/50">
              <p className="text-sm font-mono text-red-900 break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-gradient-to-r from-amber-800 to-red-900 text-stone-50 font-serif font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-stone-50 text-stone-900 font-serif font-semibold rounded-lg border-2 border-stone-300 hover:border-amber-800 transition-all text-center"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
