import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import {
  fetchBranches,
  createRepositoryBranch,
  checkoutRepositoryBranch,
  deleteRepositoryBranch,
} from '../controllers/branch.controller.js';

const router = express.Router();

// Public read — anyone can list branches of a public repo
router.get(
  '/:username/:repoName/branches',
  optionalAuth,
  fetchBranches
);

// Protected write — only owner can create, checkout, delete
router.post(
  '/:username/:repoName/branches',
  protect,
  createRepositoryBranch
);

router.post(
  '/:username/:repoName/branches/checkout',
  protect,
  checkoutRepositoryBranch
);

router.delete(
  '/:username/:repoName/branches/:branchName',
  protect,
  deleteRepositoryBranch
);

export default router;