import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import { registerValidator, loginValidator } from '../validators/auth.validators.js';
import schemaValidator from '../middleware/schemaValidator.js';
import { contracts } from '../contracts/index.js';
import { sendError } from '../utils/responseHandlers.js';
import ERROR_CODES from '../constants/errorCodes.js';

const router = express.Router();

const toNumber = (value, fallback) => {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Rate limiter for the login endpoint.
 *
 * Stricter window because login is the primary brute-force attack vector.
 * Default: 5 attempts per 15 minutes per IP.
 *
 * IMPORTANT: this limiter must remain the FIRST middleware in the route chain.
 * If it is placed after any validation middleware, requests that fail format
 * checks are short-circuited by the error handler before the counter is
 * incremented — making the limiter completely ineffective against malformed
 * payloads, which is exactly the shape of a probing/fuzzing attack.
 */
const loginLimiter = rateLimit({
	windowMs: toNumber(process.env.LOGIN_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
	max: toNumber(process.env.LOGIN_RATE_LIMIT_MAX, 5),
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: false,
	handler: (req, res) => {
		sendError(res, {
			statusCode: 429,
			code: ERROR_CODES.RATE_LIMITED,
			message: 'Too many login attempts. Please wait before trying again.',
			requestId: req.requestId,
		});
	},
});

/**
 * Rate limiter for the register endpoint.
 *
 * More lenient than login because registration is a one-time action per user,
 * but still capped to prevent mass account creation.
 * Default: 10 attempts per 60 minutes per IP.
 *
 * Same ordering constraint as loginLimiter — must be FIRST in the chain.
 */
const registerLimiter = rateLimit({
	windowMs: toNumber(process.env.REGISTER_RATE_LIMIT_WINDOW_MS, 60 * 60 * 1000),
	max: toNumber(process.env.REGISTER_RATE_LIMIT_MAX, 10),
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: false,
	handler: (req, res) => {
		sendError(res, {
			statusCode: 429,
			code: ERROR_CODES.RATE_LIMITED,
			message: 'Too many registration attempts. Please wait before trying again.',
			requestId: req.requestId,
		});
	},
});

// loginLimiter and registerLimiter must be first — see comment on loginLimiter above.
router.post('/register', registerLimiter, ...schemaValidator(contracts.auth.register), registerValidator, validateRequest, register);
router.post('/login', loginLimiter, ...schemaValidator(contracts.auth.login), loginValidator, validateRequest, login);
router.get('/me', protect, ...schemaValidator(contracts.auth.me), getMe);

export default router;