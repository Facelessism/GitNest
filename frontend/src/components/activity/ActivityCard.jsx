import { formatActivity, getActivityTimestamp } from '../../utils/activityFormatter.js';

const ActivityCard = ({ activity }) => {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 overflow-hidden rounded-full bg-zinc-100 text-center text-sm font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
          {activity.actor?.avatarUrl ? (
            <img src={activity.actor.avatarUrl} alt={activity.actor.username} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center">{activity.actor?.username?.[0]?.toUpperCase() ?? 'U'}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{formatActivity(activity)}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {activity.repository?.name || activity.metadata?.repoName || 'Repository'} · {getActivityTimestamp(activity.createdAt)}
          </p>
        </div>
      </div>
    </article>
  );
};

export default ActivityCard;
