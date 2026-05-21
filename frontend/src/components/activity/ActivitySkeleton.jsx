const ActivitySkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, index) => (
      <div
        key={index}
        className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-1/2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default ActivitySkeleton;
