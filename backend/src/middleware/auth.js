const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    // Explicitly restrict to HS256 to prevent algorithm-confusion attacks
    // (e.g. the "alg: none" exploit or RS256/HS256 confusion when a public key
    // is used as an HMAC secret).
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    // Use lean() — controllers never call .save() on req.user directly
    const user = await User.findById(decoded.id).lean();
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or disabled' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Role guard factory — usage: authorize('superadmin', 'provider')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

module.exports = { authenticate, authorize };
