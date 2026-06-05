import express from 'express';
import { getRepositoryTree } from '../controllers/fileBrowser.controller.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import validate from '../middleware/validate.js';
import { fileBrowserValidator } from '../validators/fileBrowser.validators.js';

const router = express.Router();

router.get(
  '/:username/:repoName/tree',
  optionalAuth,
  validate(fileBrowserValidator),
  getRepositoryTree
);

export default router;