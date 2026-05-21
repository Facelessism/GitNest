import express from 'express';
import {
  getGlobalActivities,
  getRepositoryActivities,
  getUserActivities,
} from '../controllers/activity.controller.js';

const router = express.Router();

router.get('/global', getGlobalActivities);
router.get('/user/:username', getUserActivities);
router.get('/repository/:repo', getRepositoryActivities);

export default router;
