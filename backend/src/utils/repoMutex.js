/**
 * repoMutex.js
 *
 * Module-scoped per-repository-path mutex implemented with promise chaining.
 * Guarantees that git operations (checkout + merge) on the same working-tree
 * directory are never interleaved across concurrent requests in the same
 * Node.js process — no external dependencies required.
 *
 * Usage:
 *   const release = await acquireRepoLock(repoPath);
 *   try {
 *     // critical section — git checkout + git merge
 *   } finally {
 *     release();
 *   }
 */

// Map<canonicalPath, Promise<void>> — the tail of the current promise chain
// for each repository path.
const locks = new Map();

/**
 * Acquires the mutex for the given repository path.
 * Callers queue behind any in-flight operation on the same path and are
 * served in FIFO order.
 *
 * @param {string} repoPath - Absolute path to the repository working tree.
 * @returns {Promise<Function>} Resolves to a `release` function that MUST be
 *   called in a finally block to unblock the next waiter.
 */
export const acquireRepoLock = (repoPath) => {
  // Normalise the key so symlinks / relative paths don't create duplicate entries.
  const key = repoPath;

  // The previous tail (or a resolved promise if the path is idle).
  const previous = locks.get(key) ?? Promise.resolve();

  let release;

  // The new tail: a promise that resolves only when release() is called.
  const next = new Promise((resolve) => {
    release = resolve;
  });

  // Chain: the current caller waits for the previous tail, then holds the
  // lock until it calls release().
  const waitAndHold = previous.then(() => {
    // Inside the critical section — caller runs now.
  });

  // Store the new tail so the *next* waiter chains behind this one.
  locks.set(key, next);

  // Clean up the map entry once this lock is released to prevent memory growth.
  next.then(() => {
    // Only delete if we are still the current tail (no new waiter queued).
    if (locks.get(key) === next) {
      locks.delete(key);
    }
  });

  // Return a promise that resolves (with the release fn) once it's our turn.
  return waitAndHold.then(() => release);
};

/**
 * Returns the number of paths currently tracked in the lock map.
 * Exposed for testing only.
 */
export const _lockMapSize = () => locks.size;