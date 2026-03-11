export default function PlanLoading() {
  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="glass rounded-2xl p-6 border border-white/5 animate-pulse">
          <div className="h-8 w-44 bg-white/10 rounded-lg mb-2" />
          <div className="h-4 w-64 bg-white/5 rounded-lg" />
        </div>

        {/* Action items skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass rounded-2xl p-6 border border-white/5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 shrink-0" />
                <div className="flex-1">
                  <div className="h-5 w-48 bg-white/10 rounded-lg mb-2" />
                  <div className="h-3 w-full bg-white/5 rounded-lg mb-1" />
                  <div className="h-3 w-3/4 bg-white/5 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
