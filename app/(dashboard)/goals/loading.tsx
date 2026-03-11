export default function GoalsLoading() {
  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="glass rounded-2xl p-6 border border-white/5 animate-pulse">
          <div className="h-8 w-48 bg-white/10 rounded-lg mb-2" />
          <div className="h-4 w-72 bg-white/5 rounded-lg" />
        </div>

        {/* Chart skeleton */}
        <div className="glass rounded-2xl p-6 border border-white/5 animate-pulse">
          <div className="h-64 bg-white/5 rounded-xl" />
        </div>

        {/* Goals list skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass rounded-2xl p-6 border border-white/5 animate-pulse">
              <div className="h-5 w-32 bg-white/10 rounded-lg mb-3" />
              <div className="h-3 w-full bg-white/5 rounded-lg mb-2" />
              <div className="h-3 w-2/3 bg-white/5 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
