import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '../api/auditLog.api.js';

export const useAuditLogs = ({ username, reponame, page, filters }) => {
  return useQuery({
    queryKey: ['auditLogs', username, reponame, page, filters],
    queryFn: () => fetchAuditLogs({ username, reponame, page, filters }),
    enabled: Boolean(username && reponame),
  });
};
