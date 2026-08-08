export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Hero Greeting Skeleton */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-600/80 via-emerald-500/80 to-cyan-500/80 px-8 py-8">
        <div className="h-3 w-48 rounded bg-white/20 animate-shimmer" />
        <div className="mt-3 h-8 w-72 rounded-lg bg-white/20 animate-shimmer" />
        <div className="mt-4 flex gap-2">
          <div className="h-7 w-32 rounded-full bg-white/15 animate-shimmer" />
          <div className="h-7 w-36 rounded-full bg-white/15 animate-shimmer" />
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div className="glass-card rounded-2xl p-4 flex flex-col items-center gap-3" key={i}>
            <div className="h-12 w-12 rounded-[14px] animate-shimmer" />
            <div className="h-3 w-20 rounded animate-shimmer" />
          </div>
        ))}
      </div>

      {/* Section label */}
      <div>
        <div className="h-3 w-28 rounded animate-shimmer mb-3" />
        {/* KPI Cards Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div className="glass-card rounded-2xl p-5" key={i}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-3 flex-1">
                  <div className="h-2.5 w-20 animate-shimmer rounded" />
                  <div className="h-7 w-28 animate-shimmer rounded" />
                  <div className="h-2.5 w-24 animate-shimmer rounded" />
                </div>
                <div className="h-12 w-12 rounded-[14px] animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-[14px] animate-shimmer" />
          <div className="space-y-2">
            <div className="h-4 w-32 animate-shimmer rounded" />
            <div className="h-3 w-48 animate-shimmer rounded" />
          </div>
        </div>
        <div className="h-72 animate-shimmer rounded-xl" />
      </div>

      {/* Timeline + Unpaid Grid Skeleton */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Timeline */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="h-3 w-24 animate-shimmer rounded" />
            <div className="h-3 w-16 animate-shimmer rounded" />
          </div>
          <div className="space-y-3 pl-6">
            {[1, 2, 3].map((i) => (
              <div className="glass-card rounded-xl p-4 flex items-start gap-3.5" key={i}>
                <div className="h-10 w-10 rounded-full animate-shimmer shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 animate-shimmer rounded" />
                  <div className="h-3 w-52 animate-shimmer rounded" />
                  <div className="h-3 w-28 animate-shimmer rounded" />
                </div>
                <div className="h-4 w-20 animate-shimmer rounded shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Unpaid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="h-3 w-28 animate-shimmer rounded" />
            <div className="h-3 w-16 animate-shimmer rounded" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div className="glass-card rounded-xl p-4 space-y-3" key={i}>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-32 animate-shimmer rounded" />
                    <div className="h-3 w-24 animate-shimmer rounded" />
                  </div>
                  <div className="space-y-1.5 text-right">
                    <div className="h-4 w-20 animate-shimmer rounded" />
                    <div className="h-2.5 w-28 animate-shimmer rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-2 flex-1 animate-shimmer rounded-full" />
                  <div className="h-3 w-8 animate-shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
