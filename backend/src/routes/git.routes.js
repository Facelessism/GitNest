import express from 'express';
import {
  initializeRepository,
  addFiles,
  commitChanges,
  pushRepository,
  pullRepository,
  revertCommit,
} from '../controllers/git.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:username/:reponame/init', protect, initializeRepository);
router.post('/:username/:reponame/add', protect, addFiles);
router.post('/:username/:reponame/commit', protect, commitChanges);
router.post('/:username/:reponame/push', protect, pushRepository);
router.post('/:username/:reponame/pull', protect, pullRepository);
router.post('/:username/:reponame/revert', protect, revertCommit);

export default router;
