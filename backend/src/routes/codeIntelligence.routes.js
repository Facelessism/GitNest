import express from 'express';
import { optionalAuth, protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import schemaValidator from '../middleware/schemaValidator.js';
import { contracts } from '../contracts/index.js';
import { repoParamValidator } from '../validators/repository.validators.js';
import {
  indexIdValidator,
  symbolDetailValidator,
  symbolSearchValidator,
} from '../validators/codeIntelligence.validators.js';
import {
  getIndexingStatus,
  getSymbolDetails,
  searchSymbols,
  triggerIndexing,
} from '../controllers/codeIntelligence.controller.js';

const router = express.Router();

router.post(
  '/:username/:reponame/index',
  protect,
  ...schemaValidator(contracts.codeIntelligence.triggerIndex),
  validate(repoParamValidator),
  triggerIndexing
);

router.get(
  '/:username/:reponame/index/status/:indexId',
  protect,
  ...schemaValidator(contracts.codeIntelligence.indexStatus),
  validate(indexIdValidator),
  getIndexingStatus
);

router.get(
  '/:username/:reponame/symbols/search',
  optionalAuth,
  ...schemaValidator(contracts.codeIntelligence.searchSymbols),
  validate(symbolSearchValidator),
  searchSymbols
);

router.get(
  '/:username/:reponame/symbols/:symbolId',
  optionalAuth,
  ...schemaValidator(contracts.codeIntelligence.symbolDetails),
  validate(symbolDetailValidator),
  getSymbolDetails
);

export default router;
