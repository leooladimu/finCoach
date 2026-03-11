export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20"></div>
          <div className="absolute inset-0 rounded-full border-2 border-t-emerald-500 animate-spin"></div>
        </div>
        <p className="text-neutral-400">Loading your dashboard...</p>
      </div>
    </div>
  );
}
