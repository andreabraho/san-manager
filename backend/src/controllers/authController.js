const jwt = require('jsonwebtoken');
const { User, Provider, Client } = require('../models/User');

// Simple email format check — no external package needed
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Username: lowercase alphanumeric + hyphens only, 3-30 chars
const isValidUsername = (v) => /^[a-z0-9-]{3,30}$/.test(v);

// ── In-memory brute-force protection for login ───────────────────────────────
// Tracks failed login attempts per lowercase email.  No external package is
// required; this in-process store resets on server restart which is acceptable
// for a first line of defence.  In a multi-process/multi-instance deployment
// this must be replaced with a shared store (e.g. Redis via rate-limit-redis).
//
// Limits: 10 attempts per 15-minute window.  After the limit is reached the
// account is locked for the remainder of the window (no "unlock" endpoint is
// provided intentionally — this prevents enumeration via the unlock flow).
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOGIN_MAX_ATTEMPTS = 10;

const loginAttempts = new Map(); // key: email, value: { count, windowStart }

const isLoginRateLimited = (email) => {
  const now = Date.now();
  const entry = loginAttempts.get(email);
  if (!entry) return false;
  if (now - entry.windowStart > LOGIN_WINDOW_MS) {
    // Window expired — reset
    loginAttempts.delete(email);
    return false;
  }
  return entry.count >= LOGIN_MAX_ATTEMPTS;
};

const recordLoginFailure = (email) => {
  const now = Date.now();
  const entry = loginAttempts.get(email);
  if (!entry || now - entry.windowStart > LOGIN_WINDOW_MS) {
    loginAttempts.set(email, { count: 1, windowStart: now });
  } else {
    entry.count += 1;
  }
};

const clearLoginFailures = (email) => {
  loginAttempts.delete(email);
};

// Explicitly set algorithm to HS256 to prevent algorithm-confusion attacks.
// Without this, an attacker could craft a token with alg:"none" and bypass
// signature verification in older jsonwebtoken versions.
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const registerProvider = async (req, res, next) => {
  try {
    const { email, password, username, displayName, phone } = req.body;
    if (!email || !password || !username || !displayName) {
      return res.status(400).json({ message: 'email, password, username and displayName are required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    if (!isValidUsername(username.toLowerCase())) {
      return res.status(400).json({ message: 'Username must be 3-30 characters: lowercase letters, numbers, and hyphens only' });
    }
    if (typeof displayName !== 'string' || !displayName.trim()) {
      return res.status(400).json({ message: 'displayName must be a non-empty string' });
    }
    const provider = await Provider.create({
      email: email.toLowerCase().trim(),
      password,
      username: username.toLowerCase().trim(),
      displayName: displayName.trim(),
      phone: phone ? String(phone).trim() : '',
    });
    const token = signToken(provider._id);
    res.status(201).json({ token, user: { id: provider._id, role: 'provider', username: provider.username } });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ message: `${field} already in use` });
    }
    next(err);
  }
};

const registerClient = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'email, password, firstName and lastName are required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    if (typeof firstName !== 'string' || !firstName.trim()) {
      return res.status(400).json({ message: 'firstName must be a non-empty string' });
    }
    if (typeof lastName !== 'string' || !lastName.trim()) {
      return res.status(400).json({ message: 'lastName must be a non-empty string' });
    }
    const client = await Client.create({
      email: email.toLowerCase().trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone ? String(phone).trim() : '',
    });
    const token = signToken(client._id);
    res.status(201).json({ token, user: { id: client._id, role: 'client' } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'email already in use' });
    }
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }
    if (!isValidEmail(email)) {
      // Don't reveal whether the email exists — keep message generic
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Brute-force check — return 429 with a generic message to avoid leaking
    // whether the account exists.
    if (isLoginRateLimited(normalizedEmail)) {
      return res.status(429).json({ message: 'Too many login attempts. Please try again later.' });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      // Record the failure only for the submitted email (even if it doesn't
      // exist) so an attacker cannot distinguish "wrong password" from "no
      // such account" via the rate-limit counter itself.
      recordLoginFailure(normalizedEmail);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.isActive) return res.status(403).json({ message: 'Account disabled' });

    // Successful login — clear the failure counter so a legitimate user who
    // previously mistyped their password is not locked out going forward.
    clearLoginFailures(normalizedEmail);

    const token = signToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        role: user.role,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { registerProvider, registerClient, login };
