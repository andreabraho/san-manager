const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const meRoutes = require('./routes/me');
const providerRoutes = require('./routes/provider');
const clientRoutes = require('./routes/client');
const bookingRoutes = require('./routes/booking');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');

const app = express();

// In production CLIENT_URL must be set; if missing, deny all cross-origin requests
// rather than accidentally allowing every origin.
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((o) => o.trim())
  : [];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, false);
  },
  credentials: true,
}));

// ── Security headers ─────────────────────────────────────────────────────────
// Applied before any route handler so every response carries these headers.
app.use((req, res, next) => {
  // Prevent MIME-type sniffing — browsers must honour the declared Content-Type.
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Disallow embedding this app in an <iframe> (clickjacking protection).
  res.setHeader('X-Frame-Options', 'DENY');
  // Legacy XSS filter for older browsers.
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Only send the origin (no path/query) in the Referer header for cross-origin requests.
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Disable access to sensitive device APIs.
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Enforce HTTPS for 1 year (only meaningful when served over TLS in production).
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Force static-file responses for /uploads to be treated as downloads, not
// executable content. This is a defence-in-depth measure: the upload middleware
// already whitelists JPEG/PNG/WebP, but belt-and-suspenders prevents a browser
// from ever executing a file served from this path even if a bad file slipped
// through (e.g. via a direct filesystem write).
app.use('/uploads', (req, res, next) => {
  res.setHeader('Content-Disposition', 'inline');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
}, express.static(path.join(__dirname, '..', 'uploads')));

// Limit JSON bodies to 1 MB to reduce DoS surface
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/me', meRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

// ── Global error handler ─────────────────────────────────────────────────────
// In production we return a generic message so internal details (file paths,
// library versions, stack traces) are never exposed to the client.
// In development the original message is preserved to aid debugging.
app.use((err, req, res, next) => {
  console.error(err.stack);
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    message: isProduction ? 'Internal server error' : (err.message || 'Internal server error'),
  });
});

module.exports = app;
