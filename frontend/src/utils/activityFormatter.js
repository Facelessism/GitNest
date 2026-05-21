const getActivityTimestamp = (createdAt) => {
  const date = new Date(createdAt).getTime();
  if (Number.isNaN(date)) return 'Unknown time';

  const diff = Date.now() - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export const formatActivity = (activity) => {
  const actorName = activity.actor?.username ?? 'Someone';
  const repoName = activity.repository?.name ?? activity.metadata?.repoName ?? 'repository';

  switch (activity.type) {
    case 'REPOSITORY_CREATED':
      return `${actorName} created repository ${repoName}`;
    case 'REPOSITORY_STARRED':
      return `${actorName} starred repository ${repoName}`;
    case 'PROFILE_UPDATED':
      return `${actorName} updated their profile`;
    default:
      return `${actorName} performed an action`;
  }
};

export { getActivityTimestamp };
