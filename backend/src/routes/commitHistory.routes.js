import express from 'express';
import { fetchCommitHistory } from '../controllers/commitHistory.controller.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import validate from '../middleware/validate.js';
import { commitHistoryValidator } from '../validators/commitHistory.validators.js';

const router = express.Router();

router.get(
  '/:username/:repoName/commits',
  optionalAuth,
  validate(commitHistoryValidator),
  fetchCommitHistory
);

export default router;