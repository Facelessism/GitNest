import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getRepositoryTree } from '../controllers/fileBrowser.controller.js';
import { optionalAuth } from '../middleware/optionalAuth.js';

const router = express.Router();

router.get(
  '/:username/:repoName/tree',
  optionalAuth,
  getRepositoryTree
);

export default router;