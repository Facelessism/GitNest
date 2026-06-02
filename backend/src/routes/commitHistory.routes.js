import express from 'express';
import { fetchCommitHistory } from '../controllers/commitHistory.controller.js';
import { optionalAuth } from '../middleware/optionalAuth.js';

const router = express.Router();

router.get(
  '/:username/:repoName/commits',
  optionalAuth,
  fetchCommitHistory
);

export default router;