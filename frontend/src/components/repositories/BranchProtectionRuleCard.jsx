import { useMemo, useState } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import BranchProtectionRuleFields from './BranchProtectionRuleFields.jsx';

const toEditorState = (rule) => ({
  branchPattern: rule.branchPattern || '',
  requirePullRequest: rule.requirePullRequest ?? true,
  requiredApprovalsCount: String(rule.requiredApprovalsCount ?? 1),
  requireStatusChecks: rule.requireStatusChecks ?? false,
});

const buildSummary = (rule) => {
  const parts = [];

  if (rule.requirePullRequest) {
    parts.push('Requires PR');
    parts.push(`${rule.requiredApprovalsCount ?? 0} approval${(rule.requiredApprovalsCount ?? 0) === 1 ? '' : 's'}`);
  }

  if (rule.requireStatusChecks) {
    parts.push('Status checks required');
  }

  return parts.length > 0 ? parts.join('  ') : 'No additional requirements';
};

export default function BranchProtectionRuleCard({ rule, onSave, onDelete, saving = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(() => toEditorState(rule));

  const summary = useMemo(() => buildSummary(rule), [rule]);

  const startEditing = () => {
    setDraft(toEditorState(rule));
    setIsEditing(true);
  };

  const stopEditing = () => {
    setIsEditing(false);
    setDraft(toEditorState(rule));
  };

  const handleSave = async () => {
    await onSave({
      branchPattern: draft.branchPattern.trim(),
      requirePullRequest: draft.requirePullRequest,
      requiredApprovalsCount: Number(draft.requiredApprovalsCount || 0),
      requireStatusChecks: draft.requireStatusChecks,
    });
    setIsEditing(false);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-5">
      {!isEditing ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="text-base font-bold text-zinc-900 dark:text-white">{rule.branchPattern}</div>
            <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{summary}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-white/10 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:border-emerald-400/30 hover:text-emerald-400 transition-colors"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete protection rule for '${rule.branchPattern}'?`)) {
                  onDelete();
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-white/10 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:border-amber-400/30 hover:text-amber-400 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          <BranchProtectionRuleFields
            branchPattern={draft.branchPattern}
            requirePullRequest={draft.requirePullRequest}
            requiredApprovalsCount={draft.requiredApprovalsCount}
            requireStatusChecks={draft.requireStatusChecks}
            onBranchPatternChange={(value) => setDraft((current) => ({ ...current, branchPattern: value }))}
            onRequirePullRequestChange={(checked) => setDraft((current) => ({ ...current, requirePullRequest: checked }))}
            onRequiredApprovalsCountChange={(value) => setDraft((current) => ({ ...current, requiredApprovalsCount: value }))}
            onRequireStatusChecksChange={(checked) => setDraft((current) => ({ ...current, requireStatusChecks: checked }))}
          />

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={stopEditing}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-white/10 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check className="h-4 w-4" />
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
