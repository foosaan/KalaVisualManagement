export default function JobsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-24 animate-shimmer rounded-lg" />
        <div className="h-4 w-64 animate-shimmer rounded-md" />
      </div>
      {/* Filter bar */}
      <div className="rounded-2xl border border-border/60 bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
          <div className="h-10 animate-shimmer rounded-lg" />
          <div className="h-10 animate-shimmer rounded-lg" />
          <div className="h-10 w-16 animate-shimmer rounded-lg" />
        </div>
      </div>
      {/* Table */}
      <div className="rounded-2xl border border-border/60 bg-card">
        <div className="border-b border-border/40 px-4 py-3">
          <div className="flex gap-8">
            {[80, 48, 56, 48, 40, 36].map((w, i) => (
              <div className="h-3 animate-shimmer rounded" key={i} style={{ width: `${w}px` }} />
            ))}
          </div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div className="flex items-center gap-6 border-b border-border/40 px-4 py-4 last:border-0" key={i}>
            <div className="h-4 w-40 animate-shimmer rounded" />
            <div className="h-4 w-24 animate-shimmer rounded" />
            <div className="h-4 w-20 animate-shimmer rounded" />
            <div className="h-4 w-20 animate-shimmer rounded" />
            <div className="h-5 w-16 animate-shimmer rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
