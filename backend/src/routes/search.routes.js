import express from 'express';
import { globalSearch } from '../controllers/search.controller.js';
import schemaValidator from '../middleware/schemaValidator.js';
import { contracts } from '../contracts/index.js';
import validate from '../middleware/validate.js';
import { searchQueryValidator } from '../validators/search.validators.js';

const router = express.Router();

router.get('/', ...schemaValidator(contracts.search.global), validate(searchQueryValidator), globalSearch);

export default router;
