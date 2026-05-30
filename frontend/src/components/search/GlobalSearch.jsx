import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { performGlobalSearch } from '../../api/searchApi.js';
import SearchResults from './SearchResults.jsx';
import SearchResultsSkeleton from './SearchResultsSkeleton.jsx';
import { useToastStore } from '../../store/useToastStore.js';

export default function GlobalSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  const debouncedQuery = useMemo(() => {
    let timeoutId;
    return (query) => {
      return new Promise((resolve) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          resolve(query);
        }, 300);
      });
    };
  }, []);

  const { data: searchResults, isLoading, isError, error } = useQuery({
    queryKey: ['search', searchQuery, activeType, page],
    queryFn: async () => {
      if (!searchQuery.trim() || searchQuery.trim().length < 2) {
        return null;
      }
      try {
        return await performGlobalSearch({
          query: searchQuery,
          type: activeType,
          page,
          limit: 20,
        });
      } catch (err) {
        if (err.message?.includes('Search query must be')) {
          return null;
        }
        throw err;
      }
    },
    enabled: searchQuery.trim().length >= 2,
    staleTime: 1000 * 60,
  });

  const handleClear = useCallback(() => {
    setSearchQuery('');
    setPage(1);
    setActiveType('all');
  }, []);

  const handleTypeChange = useCallback((type) => {
    setActiveType(type);
    setPage(1);
  }, []);

  if (isError) {
    addToast({
      message: error?.message || 'Failed to search',
      type: 'error',
    });
  }

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search repositories, users, pull requests..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full pl-9 pr-9 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] text-sm outline-none focus:border-emerald-400/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-200 dark:hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4 text-zinc-500" />
            </button>
          )}
        </div>

        {/* Search Panel */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Results Dropdown */}
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg z-20 max-h-[600px] overflow-y-auto">
              {searchQuery.trim().length < 2 ? (
                <div className="p-4 text-center text-zinc-500 dark:text-zinc-400">
                  <p className="text-sm">Type at least 2 characters to search</p>
                </div>
              ) : (
                <>
                  {/* Type Filter Tabs */}
                  <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex gap-2 flex-wrap">
                    {['all', 'users', 'repositories', 'pullRequests'].map((type) => (
                      <button
                        key={type}
                        onClick={() => handleTypeChange(type)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          activeType === type
                            ? 'bg-emerald-400 text-black'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {type === 'pullRequests' ? 'Pull Requests' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Results */}
                  <div className="p-4">
                    {isLoading ? (
                      <SearchResultsSkeleton />
                    ) : (
                      <SearchResults results={searchResults} isLoading={isLoading} />
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
