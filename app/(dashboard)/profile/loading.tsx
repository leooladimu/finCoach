export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile header skeleton */}
        <div className="glass rounded-2xl p-8 border border-white/5 animate-pulse">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/10" />
            <div>
              <div className="h-7 w-40 bg-white/10 rounded-lg mb-2" />
              <div className="h-4 w-56 bg-white/5 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Profile details skeleton */}
        <div className="glass rounded-2xl p-6 border border-white/5 animate-pulse">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-24 bg-white/10 rounded-lg" />
                <div className="h-4 w-48 bg-white/5 rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Money style skeleton */}
        <div className="glass rounded-2xl p-6 border border-white/5 animate-pulse">
          <div className="h-6 w-36 bg-white/10 rounded-lg mb-4" />
          <div className="h-32 bg-white/5 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
