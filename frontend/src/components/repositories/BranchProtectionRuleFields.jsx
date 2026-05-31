export default function BranchProtectionRuleFields({
  branchPattern,
  requirePullRequest,
  requiredApprovalsCount,
  requireStatusChecks,
  onBranchPatternChange,
  onRequirePullRequestChange,
  onRequiredApprovalsCountChange,
  onRequireStatusChecksChange,
}) {
  return (
    <div className="grid gap-4">
      <label className="grid gap-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Branch pattern</span>
        <input
          type="text"
          value={branchPattern}
          onChange={(event) => onBranchPatternChange(event.target.value)}
          placeholder="e.g. main, release/*"
          className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:border-emerald-400/50"
        />
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] px-4 py-3">
        <input
          type="checkbox"
          checked={requirePullRequest}
          onChange={(event) => onRequirePullRequestChange(event.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 text-emerald-500 focus:ring-emerald-400"
        />
        <span className="text-sm text-zinc-700 dark:text-zinc-300">Require a pull request before merging</span>
      </label>

      {requirePullRequest ? (
        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Required approvals</span>
          <input
            type="number"
            min="0"
            max="10"
            value={requiredApprovalsCount}
            onChange={(event) => onRequiredApprovalsCountChange(event.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:border-emerald-400/50"
          />
        </label>
      ) : null}

      <label className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] px-4 py-3">
        <input
          type="checkbox"
          checked={requireStatusChecks}
          onChange={(event) => onRequireStatusChecksChange(event.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 text-emerald-500 focus:ring-emerald-400"
        />
        <span className="text-sm text-zinc-700 dark:text-zinc-300">Require status checks to pass</span>
      </label>
    </div>
  );
}
