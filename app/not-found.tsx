import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="glass rounded-2xl border border-white/10 p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />

          <div className="relative text-center mb-6">
            <div className="text-6xl mb-4">🧭</div>
            <h1 className="text-6xl font-bold text-white mb-2">
              404
            </h1>
            <h2 className="text-2xl font-bold text-neutral-200 mb-2">
              Page Not Found
            </h2>
            <p className="text-neutral-400">
              Looks like you&apos;ve wandered off the financial path. Let&apos;s
              get you back on track.
            </p>
          </div>

          <div className="relative flex justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
