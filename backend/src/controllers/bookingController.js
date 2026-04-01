const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { User } = require('../models/User');
const emailService = require('../services/emailService');

// Escape special regex characters to prevent ReDoS
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ── In-memory rate limiter for unauthenticated endpoints ─────────────────────
// Limits the guest-lookup endpoint to 20 requests per 15-minute window per IP
// to reduce the ability to enumerate bookings by brute-forcing name/email
// combinations.  Replace with a shared store (Redis) in multi-instance deploys.
const GUEST_LOOKUP_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const GUEST_LOOKUP_MAX = 20;
const guestLookupAttempts = new Map(); // key: IP string, value: { count, windowStart }

const isGuestLookupLimited = (ip) => {
  const now = Date.now();
  const entry = guestLookupAttempts.get(ip);
  if (!entry) return false;
  if (now - entry.windowStart > GUEST_LOOKUP_WINDOW_MS) {
    guestLookupAttempts.delete(ip);
    return false;
  }
  return entry.count >= GUEST_LOOKUP_MAX;
};

const recordGuestLookup = (ip) => {
  const now = Date.now();
  const entry = guestLookupAttempts.get(ip);
  if (!entry || now - entry.windowStart > GUEST_LOOKUP_WINDOW_MS) {
    guestLookupAttempts.set(ip, { count: 1, windowStart: now });
  } else {
    entry.count += 1;
  }
};

// Validate HH:MM time string
const isValidTime = (t) => /^\d{2}:\d{2}$/.test(t);

// Simple email format check
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Validate YYYY-MM-DD date string
const isValidDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(Date.parse(d));

const ALLOWED_BOOKING_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'];

const getAvailableSlots = async (req, res, next) => {
  try {
    const { providerId, locationId, serviceId, date } = req.query;

    if (!providerId || !locationId || !serviceId || !date) {
      return res.status(400).json({ message: 'providerId, locationId, serviceId and date are required' });
    }
    if (!isValidDate(date)) {
      return res.status(400).json({ message: 'date must be a valid YYYY-MM-DD string' });
    }
    if (
      !mongoose.isValidObjectId(providerId) ||
      !mongoose.isValidObjectId(locationId) ||
      !mongoose.isValidObjectId(serviceId)
    ) {
      return res.status(400).json({ message: 'Invalid id parameter' });
    }

    const startOfDay = new Date(date + 'T00:00:00Z');
    const endOfDay = new Date(date + 'T23:59:59Z');

    const bookings = await Booking.find({
      provider: providerId,
      location: locationId,
      service: serviceId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'approved'] },
    })
      .select('startTime endTime')
      .lean();

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

const createBooking = async (req, res, next) => {
  try {
    const { providerId, locationId, serviceId, date, startTime, guestInfo, notes } = req.body;

    // Required field validation
    if (!providerId || !locationId || !serviceId || !date || !startTime) {
      return res.status(400).json({ message: 'providerId, locationId, serviceId, date and startTime are required' });
    }
    if (
      !mongoose.isValidObjectId(providerId) ||
      !mongoose.isValidObjectId(locationId) ||
      !mongoose.isValidObjectId(serviceId)
    ) {
      return res.status(400).json({ message: 'Invalid id parameter' });
    }
    if (!isValidDate(date)) {
      return res.status(400).json({ message: 'date must be a valid YYYY-MM-DD string' });
    }
    if (!isValidTime(startTime)) {
      return res.status(400).json({ message: 'startTime must be HH:MM format' });
    }

    // Determine if request comes from a logged-in client
    let clientId = null;
    let clientEmail = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        // Restrict to HS256 — same defence-in-depth as the auth middleware.
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        const user = await User.findById(decoded.id).lean();
        if (user && user.role === 'client' && user.isActive) {
          clientId = user._id;
          clientEmail = user.email;
        }
      } catch (_) {
        // Token invalid or expired — proceed as guest
      }
    }

    // Guest bookings require guestInfo
    if (!clientId) {
      if (!guestInfo || !guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone) {
        return res.status(400).json({ message: 'guestInfo with firstName, lastName, email and phone is required for guest bookings' });
      }
      if (!isValidEmail(guestInfo.email)) {
        return res.status(400).json({ message: 'Invalid email format in guestInfo' });
      }
    }

    // Compute endTime from service duration
    const service = await Service.findById(serviceId).lean();
    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (!service.isActive) return res.status(400).json({ message: 'Service is not active' });

    const durationMinutes = service.durationMinutes || 60;
    const [bh, bm] = startTime.split(':').map(Number);
    const endMin = bh * 60 + bm + durationMinutes;
    if (endMin > 24 * 60) {
      return res.status(400).json({ message: 'Service duration extends beyond midnight for the selected start time' });
    }
    const endTime = `${Math.floor(endMin / 60).toString().padStart(2, '0')}:${(endMin % 60).toString().padStart(2, '0')}`;

    const booking = await Booking.create({
      provider: providerId,
      location: locationId,
      service: serviceId,
      client: clientId,
      guestInfo: clientId ? null : {
        firstName: guestInfo.firstName.trim(),
        lastName: guestInfo.lastName.trim(),
        email: guestInfo.email.trim().toLowerCase(),
        phone: guestInfo.phone.trim(),
        isFirstTime: !!guestInfo.isFirstTime,
      },
      date,
      startTime,
      endTime,
      notes: notes ? String(notes).slice(0, 1000) : '',
    });

    const populated = await booking.populate(['service', 'location']);
    const provider = await User.findById(providerId).lean();

    // Emails are best-effort — a misconfigured SMTP must not fail the booking
    if (provider) {
      try {
        await emailService.sendBookingRequestToProvider(provider.email, populated);
      } catch (_) {}
    }

    try {
      const recipientEmail = clientEmail || guestInfo?.email;
      if (recipientEmail) {
        await emailService.sendNewBookingNotificationToClient(recipientEmail, populated);
      }
    } catch (_) {}

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

const getProviderBookings = async (req, res, next) => {
  try {
    const { status, locationId } = req.query;
    const filter = { provider: req.user._id };

    if (status) {
      if (!ALLOWED_BOOKING_STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid status filter' });
      }
      filter.status = status;
    }
    if (locationId) {
      if (!mongoose.isValidObjectId(locationId)) {
        return res.status(400).json({ message: 'Invalid locationId' });
      }
      filter.location = locationId;
    }

    const bookings = await Booking.find(filter)
      .populate('service', 'name durationMinutes')
      .populate('location', 'name city')
      .populate('client', 'firstName lastName email phone')
      .sort({ date: 1, startTime: 1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid booking id' });
    }

    const { status } = req.body;
    // Providers may only approve or reject — they cannot set pending/cancelled via this endpoint
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'status must be approved or rejected' });
    }

    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, provider: req.user._id },
      { status },
      { new: true }
    ).populate('service location');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    try {
      let recipientEmail = booking.guestInfo?.email;
      if (!recipientEmail && booking.client) {
        const clientUser = await User.findById(booking.client).select('email').lean();
        recipientEmail = clientUser?.email;
      }
      if (recipientEmail) {
        await emailService.sendBookingConfirmationToClient(recipientEmail, booking, status);
      }
    } catch (_) {}

    res.json(booking);
  } catch (err) {
    next(err);
  }
};

const getClientBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ client: req.user._id })
      .populate('service', 'name durationMinutes price')
      .populate('location', 'name city')
      .populate('provider', 'displayName username')
      .sort({ date: -1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

const guestLookup = async (req, res, next) => {
  try {
    // Rate-limit by client IP to prevent enumeration of guest bookings.
    // req.ip honours X-Forwarded-For when Express's trust proxy is set; fall
    // back to the socket address for local/dev environments.
    const clientIp = req.ip || req.socket?.remoteAddress || 'unknown';
    if (isGuestLookupLimited(clientIp)) {
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }
    recordGuestLookup(clientIp);

    const { email, firstName, lastName } = req.body;
    if (!email || !firstName || !lastName) {
      return res.status(400).json({ message: 'email, firstName and lastName are required' });
    }

    // Escape user-supplied strings before using in RegExp to prevent ReDoS
    const safeFirst = escapeRegex(firstName.trim());
    const safeLast = escapeRegex(lastName.trim());

    const bookings = await Booking.find({
      'guestInfo.email': email.trim().toLowerCase(),
      'guestInfo.firstName': { $regex: new RegExp(`^${safeFirst}$`, 'i') },
      'guestInfo.lastName': { $regex: new RegExp(`^${safeLast}$`, 'i') },
    })
      .populate('provider', 'username displayName')
      .populate('location', 'name address')
      .populate('service', 'name durationMinutes price')
      .sort({ date: -1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAvailableSlots,
  createBooking,
  getProviderBookings,
  updateBookingStatus,
  getClientBookings,
  guestLookup,
};
