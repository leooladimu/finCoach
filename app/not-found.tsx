import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-gradient-to-br from-amber-50 to-stone-50 rounded-lg border-4 border-double border-amber-800/40 p-8 shadow-2xl relative overflow-hidden">
          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-amber-900/30" />
          <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-amber-900/30" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-amber-900/30" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-amber-900/30" />

          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🧭</div>
            <h1 className="text-6xl font-serif font-bold text-stone-900 mb-2">
              404
            </h1>
            <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">
              Page Not Found
            </h2>
            <p className="text-stone-700 font-serif">
              Looks like you&apos;ve wandered off the financial path. Let&apos;s get you back on track.
            </p>
          </div>

          <div className="flex justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-amber-800 to-red-900 text-stone-50 font-serif font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
