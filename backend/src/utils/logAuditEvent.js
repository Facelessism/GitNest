import AuditLog from '../models/AuditLog.model.js';
import { devLog } from './devLogger.js';

export const logAuditEvent = async ({
  actorId,
  actionType,
  repositoryId = null,
  ipAddress = null,
  metadata = {},
}) => {
  try {
    return await AuditLog.create({
      actorId,
      actionType,
      repositoryId,
      ipAddress,
      metadata,
    });
  } catch (error) {
    devLog('[audit-log]', error?.message || error);
    return null;
  }
};
