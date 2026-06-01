import express from "express";
import crypto from "crypto";
import passport from "passport";
import generateToken from "../utils/generateToken.js";

const router = express.Router();

// In-memory store for one-time exchange codes.
// Replace with Redis (SETEX) in production for multi-instance deployments.
const exchangeCodes = new Map();

// Sweep expired codes every 60 seconds instead of one setTimeout per code.
// This avoids N dangling timers under load and handles server-restart invalidation cleanly.
const SWEEP_INTERVAL_MS = (Number(process.env.OAUTH_CODE_TTL_MS) || 30_000);
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of exchangeCodes) {
    if (now > entry.expiresAt) {
      exchangeCodes.delete(key);
    }
  }
}, SWEEP_INTERVAL_MS).unref(); // .unref() so this timer doesn't keep the process alive during tests

router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
  }),
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/login",
  }),
  (req, res) => {
    // Read TTL at request time — safe for test overrides and future config reloads
    const codeTtlMs = Number(process.env.OAUTH_CODE_TTL_MS) || 30_000;

    const jwt = generateToken(req.user._id);
    const code = crypto.randomBytes(32).toString("hex");

    exchangeCodes.set(code, {
      jwt,
      expiresAt: Date.now() + codeTtlMs,
    });

    // Token never touches the URL — only the opaque, short-lived code does
    res.redirect(`${process.env.FRONTEND_URL}/oauth-success?code=${code}`);
  },
);

// Frontend POSTs the opaque code here and receives the real JWT in the response body.
// The code is single-use and expires after OAUTH_CODE_TTL_MS (default 30s).
router.post("/exchange", (req, res) => {
  const { code } = req.body;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ message: "Missing exchange code" });
  }

  const entry = exchangeCodes.get(code);

  // Treat missing and expired the same way — no information leakage
  if (!entry || Date.now() > entry.expiresAt) {
    exchangeCodes.delete(code); // clean up if expired entry exists
    return res.status(401).json({ message: "Invalid or expired exchange code" });
  }

  // Single-use — delete before responding so a racing duplicate request gets 401
  exchangeCodes.delete(code);

  return res.status(200).json({ token: entry.jwt });
});

export default router;