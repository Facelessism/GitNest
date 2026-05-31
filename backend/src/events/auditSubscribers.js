import eventEmitter from './eventEmitter.js';
import { devLog } from '../utils/devLogger.js';
import { logAuditEvent } from '../utils/logAuditEvent.js';

export const registerAuditSubscribers = () => {
  eventEmitter.on('REPO_CREATED', ({ actorId, repositoryId, repoName, visibility }) => {
    try {
      logAuditEvent({
        actorId,
        actionType: 'repo.create',
        repositoryId,
        metadata: { repoName, visibility },
      });
    } catch (error) {
      devLog('[audit-subscriber] REPO_CREATED', error?.message || error);
    }
  });

  eventEmitter.on('REPO_UPDATED', ({ actorId, repositoryId, repoName, changes }) => {
    try {
      logAuditEvent({
        actorId,
        actionType: 'repo.update',
        repositoryId,
        metadata: { repoName, changes },
      });
    } catch (error) {
      devLog('[audit-subscriber] REPO_UPDATED', error?.message || error);
    }
  });

  eventEmitter.on('REPO_DELETED', ({ actorId, repositoryId, repoName }) => {
    try {
      logAuditEvent({
        actorId,
        actionType: 'repo.delete',
        repositoryId,
        metadata: { repoName },
      });
    } catch (error) {
      devLog('[audit-subscriber] REPO_DELETED', error?.message || error);
    }
  });

  eventEmitter.on(
    'BRANCH_PROTECTION_CREATED',
    ({ actorId, repositoryId, repoName, branch, rules }) => {
      try {
        logAuditEvent({
          actorId,
          actionType: 'branch_protection.create',
          repositoryId,
          metadata: { repoName, branch, rules },
        });
      } catch (error) {
        devLog('[audit-subscriber] BRANCH_PROTECTION_CREATED', error?.message || error);
      }
    },
  );

  eventEmitter.on(
    'BRANCH_PROTECTION_UPDATED',
    ({ actorId, repositoryId, repoName, branch, ruleId, changes }) => {
      try {
        logAuditEvent({
          actorId,
          actionType: 'branch_protection.update',
          repositoryId,
          metadata: { repoName, branch, ruleId, changes },
        });
      } catch (error) {
        devLog('[audit-subscriber] BRANCH_PROTECTION_UPDATED', error?.message || error);
      }
    },
  );

  eventEmitter.on(
    'BRANCH_PROTECTION_DELETED',
    ({ actorId, repositoryId, repoName, branch, ruleId }) => {
      try {
        logAuditEvent({
          actorId,
          actionType: 'branch_protection.delete',
          repositoryId,
          metadata: { repoName, branch, ruleId },
        });
      } catch (error) {
        devLog('[audit-subscriber] BRANCH_PROTECTION_DELETED', error?.message || error);
      }
    },
  );

  eventEmitter.on('USER_LOGGED_IN', ({ actorId, email }) => {
    try {
      logAuditEvent({
        actorId,
        actionType: 'auth.login',
        metadata: { email },
      });
    } catch (error) {
      devLog('[audit-subscriber] USER_LOGGED_IN', error?.message || error);
    }
  });
};
