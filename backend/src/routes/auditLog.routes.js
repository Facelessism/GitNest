import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getAuditLogs,
} from '../controllers/auditLog.controller.js';

const router = express.Router();

router.get('/:username/:reponame/audit-logs', protect, getAuditLogs);

export default router;
