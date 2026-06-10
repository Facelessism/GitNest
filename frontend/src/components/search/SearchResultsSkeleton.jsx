import Skeleton from '../ui/Skeleton.jsx';

const SearchResultsSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Users skeleton section */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-20" />
        {[1, 2, 3].map((i) => (
          <div key={`user-${i}`} className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>

      {/* Repositories skeleton section */}
      <div className="space-y-2 mt-6">
        <Skeleton className="h-5 w-28" />
        {[1, 2, 3].map((i) => (
          <div key={`repo-${i}`} className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-32" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Pull Requests skeleton section */}
      <div className="space-y-2 mt-6">
        <Skeleton className="h-5 w-32" />
        {[1, 2, 3].map((i) => (
          <div key={`pr-${i}`} className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResultsSkeleton;
