import express from 'express';

import { protect } from '../middleware/authMiddleware.js';

import {
  cloneExternalRepository,
} from '../controllers/clone.controller.js';

const router = express.Router();

router.post(
  '/clone',
  protect,
  cloneExternalRepository
);

export default router;
