export default function AppLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 animate-shimmer rounded-lg" />
        <div className="h-4 w-80 animate-shimmer rounded-md" />
      </div>
      {/* Cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div className="rounded-2xl border border-border/60 bg-card p-5" key={i}>
            <div className="space-y-3">
              <div className="h-3 w-20 animate-shimmer rounded" />
              <div className="h-7 w-28 animate-shimmer rounded" />
              <div className="h-3 w-32 animate-shimmer rounded" />
            </div>
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      <div className="rounded-2xl border border-border/60 bg-card">
        <div className="border-b border-border/40 px-4 py-3">
          <div className="h-4 w-32 animate-shimmer rounded" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div className="flex gap-4 border-b border-border/40 px-4 py-4 last:border-0" key={i}>
            <div className="h-4 w-36 animate-shimmer rounded" />
            <div className="h-4 w-24 animate-shimmer rounded" />
            <div className="h-4 w-20 animate-shimmer rounded" />
            <div className="h-4 w-16 animate-shimmer rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
