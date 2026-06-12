import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import validate from '../middleware/validate.js';
import {
  fetchBranchesValidator,
  createBranchValidator,
  checkoutBranchValidator,
  deleteBranchValidator,
} from '../validators/branch.validators.js';
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
  validate(fetchBranchesValidator),
  fetchBranches
);

// Protected write — only owner can create, checkout, delete
router.post(
  '/:username/:repoName/branches',
  protect,
  validate(createBranchValidator),
  createRepositoryBranch
);

router.post(
  '/:username/:repoName/branches/checkout',
  protect,
  validate(checkoutBranchValidator),
  checkoutRepositoryBranch
);

router.delete(
  '/:username/:repoName/branches/:branchName',
  protect,
  validate(deleteBranchValidator),
  deleteRepositoryBranch
);

export default router;