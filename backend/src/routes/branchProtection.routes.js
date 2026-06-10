import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import schemaValidator from '../middleware/schemaValidator.js';
import { contracts } from '../contracts/index.js';
import {
  createRule,
  deleteRule,
  listRules,
  updateRule,
} from '../controllers/branchProtection.controller.js';

const router = express.Router();

router.get(
  '/:username/:reponame/settings/branch-protection',
  protect,
  ...schemaValidator(contracts.branchProtection.list),
  listRules
);

router.post(
  '/:username/:reponame/settings/branch-protection',
  protect,
  ...schemaValidator(contracts.branchProtection.create),
  createRule
);

router.put(
  '/:username/:reponame/settings/branch-protection/:ruleId',
  protect,
  ...schemaValidator(contracts.branchProtection.update),
  updateRule
);

router.delete(
  '/:username/:reponame/settings/branch-protection/:ruleId',
  protect,
  ...schemaValidator(contracts.branchProtection.remove),
  deleteRule
);

export default router;
