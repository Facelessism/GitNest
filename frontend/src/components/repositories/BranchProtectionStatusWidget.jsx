import { CheckCircle2, CircleAlert, XCircle } from 'lucide-react';

const itemClass = 'flex items-start gap-2 text-sm';

export default function BranchProtectionStatusWidget({
  rule,
  approvalsGranted,
  approvalsRequired,
  statusChecksOk,
}) {
  if (!rule) return null;

  const approvalsOk = approvalsGranted >= approvalsRequired;
  const approvalsMessage = approvalsOk
    ? `Approvals satisfied (${approvalsGranted}/${approvalsRequired})`
    : `At least ${approvalsRequired} approval(s) required (${approvalsGranted}/${approvalsRequired} granted)`;

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] p-5">
      <div className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">Branch Protection</div>
      <div className="grid gap-3">
        <div className={itemClass}>
          {approvalsOk ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 text-amber-500" />
          )}
          <span className="text-zinc-700 dark:text-zinc-300">{approvalsMessage}</span>
        </div>

        {rule.requireStatusChecks ? (
          <div className={itemClass}>
            {statusChecksOk ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
            ) : (
              <CircleAlert className="mt-0.5 h-4 w-4 text-amber-500" />
            )}
            <span className="text-zinc-700 dark:text-zinc-300">
              Status checks required - no CI system configured yet
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
