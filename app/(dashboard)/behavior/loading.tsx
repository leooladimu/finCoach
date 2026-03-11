export default function BehaviorLoading() {
  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="glass rounded-2xl p-6 border border-white/5 animate-pulse">
          <div className="h-8 w-56 bg-white/10 rounded-lg mb-2" />
          <div className="h-4 w-80 bg-white/5 rounded-lg" />
        </div>

        {/* Spending overview skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl p-6 border border-white/5 animate-pulse">
              <div className="h-4 w-24 bg-white/10 rounded-lg mb-3" />
              <div className="h-8 w-20 bg-white/5 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="glass rounded-2xl p-6 border border-white/5 animate-pulse">
          <div className="h-72 bg-white/5 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
