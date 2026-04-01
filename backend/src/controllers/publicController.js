const mongoose = require('mongoose');
const { Provider } = require('../models/User');
const HomePage = require('../models/HomePage');
const Service = require('../models/Service');
const Location = require('../models/Location');
const Availability = require('../models/Availability');
const Booking = require('../models/Booking');
const { chatWithKnowledge } = require('../services/aiService');

const MAX_DAYS = 120; // hard cap on the lookahead window

const getProviderPage = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ username: req.params.username, isActive: true })
      .select('username displayName bio')
      .lean();
    if (!provider) return res.status(404).json({ message: 'Provider not found' });

    const homePage = await HomePage.findOne({ provider: provider._id }).lean();
    res.json({ provider, homePage: homePage || { widgets: [], cols: 12 } });
  } catch (err) {
    next(err);
  }
};

const getProviderServices = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ username: req.params.username, isActive: true })
      .select('_id')
      .lean();
    if (!provider) return res.status(404).json({ message: 'Provider not found' });

    const services = await Service.find({ provider: provider._id, isActive: true })
      .populate('locations', 'name city')
      .lean();
    res.json(services);
  } catch (err) {
    next(err);
  }
};

const getProviderLocations = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ username: req.params.username, isActive: true })
      .select('_id')
      .lean();
    if (!provider) return res.status(404).json({ message: 'Provider not found' });

    const locations = await Location.find({ provider: provider._id, isActive: true }).lean();
    res.json(locations);
  } catch (err) {
    next(err);
  }
};

// Returns array of available date strings (YYYY-MM-DD) for the next `days` days
// Query: locationId (optional), serviceId (optional), days (default 60, max MAX_DAYS)
const getAvailableDates = async (req, res, next) => {
  try {
    const { locationId, serviceId } = req.query;
    const days = Math.min(Math.max(parseInt(req.query.days) || 60, 1), MAX_DAYS);

    if (locationId && !mongoose.isValidObjectId(locationId)) {
      return res.status(400).json({ message: 'Invalid locationId' });
    }
    if (serviceId && !mongoose.isValidObjectId(serviceId)) {
      return res.status(400).json({ message: 'Invalid serviceId' });
    }

    const provider = await Provider.findOne({ username: req.params.username, isActive: true })
      .select('_id')
      .lean();
    if (!provider) return res.status(404).json({ message: 'Provider not found' });

    const filter = { provider: provider._id, isActive: true };
    if (locationId) filter.location = locationId;
    const availabilities = await Availability.find(filter).lean();

    let durationMinutes = 60;
    if (serviceId) {
      const svc = await Service.findOne({ _id: serviceId, provider: provider._id }).select('durationMinutes').lean();
      if (svc) durationMinutes = svc.durationMinutes || 60;
    }

    const timeToMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const minToTime = (m) => `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`;

    const now = new Date();
    const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // Build the full date range first, then fetch all bookings in one query
    const dateRange = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setUTCDate(startDate.getUTCDate() + i);
      dateRange.push(date);
    }

    const rangeStart = dateRange[0];
    const rangeEnd = new Date(dateRange[dateRange.length - 1]);
    rangeEnd.setUTCHours(23, 59, 59, 999);

    // Single query for all bookings in the entire range — eliminates N+1
    const allBookings = await Booking.find({
      provider: provider._id,
      ...(locationId ? { location: locationId } : {}),
      date: { $gte: rangeStart, $lte: rangeEnd },
      status: { $in: ['pending', 'approved'] },
    })
      .select('startTime endTime date')
      .lean();

    // Index bookings by date string for O(1) lookup
    const bookingsByDate = {};
    for (const b of allBookings) {
      const key = new Date(b.date).toISOString().slice(0, 10);
      if (!bookingsByDate[key]) bookingsByDate[key] = [];
      bookingsByDate[key].push(b);
    }

    const result = [];

    for (const date of dateRange) {
      const dow = date.getUTCDay();
      const dateStr = date.toISOString().slice(0, 10);

      const windows = [];
      for (const a of availabilities) {
        if (a.type === 'recurring') {
          if (a.dayOfWeek !== dow) continue;
          if (a.validFrom && date < new Date(a.validFrom)) continue;
          if (a.validUntil && date > new Date(a.validUntil)) continue;
          windows.push({ start: a.startTime, end: a.endTime });
        } else {
          if (new Date(a.date).toISOString().slice(0, 10) !== dateStr) continue;
          windows.push({ start: a.startTime, end: a.endTime });
        }
      }
      if (windows.length === 0) continue;

      const allSlots = new Set();
      for (const w of windows) {
        let cur = timeToMin(w.start);
        const last = timeToMin(w.end) - durationMinutes;
        while (cur <= last) { allSlots.add(minToTime(cur)); cur += durationMinutes; }
      }
      if (allSlots.size === 0) continue;

      const bookings = bookingsByDate[dateStr] || [];

      const freeSlots = [...allSlots].filter((slot) => {
        const sStart = timeToMin(slot);
        const sEnd = sStart + durationMinutes;
        return !bookings.some((b) => {
          const bStart = timeToMin(b.startTime);
          const bEnd = b.endTime && b.endTime !== b.startTime
            ? timeToMin(b.endTime)
            : bStart + durationMinutes;
          return sStart < bEnd && sEnd > bStart;
        });
      });

      if (freeSlots.length > 0) result.push(dateStr);
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Returns available time slot strings ["09:00", "09:30", ...] for a specific date
// Query: locationId, serviceId, date (YYYY-MM-DD)
const getAvailableSlots = async (req, res, next) => {
  try {
    const { locationId, serviceId, date } = req.query;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))) {
      return res.status(400).json({ message: 'date must be a valid YYYY-MM-DD string' });
    }
    if (locationId && !mongoose.isValidObjectId(locationId)) {
      return res.status(400).json({ message: 'Invalid locationId' });
    }
    if (serviceId && !mongoose.isValidObjectId(serviceId)) {
      return res.status(400).json({ message: 'Invalid serviceId' });
    }

    const provider = await Provider.findOne({ username: req.params.username, isActive: true })
      .select('_id')
      .lean();
    if (!provider) return res.status(404).json({ message: 'Provider not found' });

    let durationMinutes = 60;
    if (serviceId) {
      const service = await Service.findOne({ _id: serviceId, provider: provider._id }).select('durationMinutes').lean();
      if (service) durationMinutes = service.durationMinutes || 60;
    }

    const dateObj = new Date(date + 'T00:00:00Z');
    const dow = dateObj.getUTCDay();

    const availFilter = { provider: provider._id, isActive: true };
    if (locationId) availFilter.location = locationId;
    const availabilities = await Availability.find(availFilter).lean();

    const timeToMin = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const minToTime = (m) => {
      const h = Math.floor(m / 60).toString().padStart(2, '0');
      const min = (m % 60).toString().padStart(2, '0');
      return `${h}:${min}`;
    };

    const windows = [];
    for (const a of availabilities) {
      if (a.type === 'recurring') {
        if (a.dayOfWeek !== dow) continue;
        if (a.validFrom && dateObj < new Date(a.validFrom)) continue;
        if (a.validUntil && dateObj > new Date(a.validUntil)) continue;
        windows.push({ start: a.startTime, end: a.endTime });
      } else {
        if (new Date(a.date).toISOString().slice(0, 10) !== date) continue;
        windows.push({ start: a.startTime, end: a.endTime });
      }
    }

    if (windows.length === 0) return res.json([]);

    const allSlots = new Set();
    for (const w of windows) {
      let cur = timeToMin(w.start);
      const last = timeToMin(w.end) - durationMinutes;
      while (cur <= last) {
        allSlots.add(minToTime(cur));
        cur += durationMinutes;
      }
    }

    const startOfDay = new Date(date + 'T00:00:00Z');
    const endOfDay = new Date(date + 'T23:59:59Z');

    const bookingsFilter = {
      provider: provider._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'approved'] },
    };
    if (locationId) bookingsFilter.location = locationId;

    const bookings = await Booking.find(bookingsFilter).select('startTime endTime').lean();

    const available = [...allSlots].sort().filter((slot) => {
      const slotStart = timeToMin(slot);
      const slotEnd = slotStart + durationMinutes;
      return !bookings.some((b) => {
        const bStart = timeToMin(b.startTime);
        const bEnd = b.endTime && b.endTime !== b.startTime
          ? timeToMin(b.endTime)
          : bStart + durationMinutes;
        return slotStart < bEnd && slotEnd > bStart;
      });
    });

    res.json(available);
  } catch (err) {
    next(err);
  }
};

// ── AI chat rate-limiter ──────────────────────────────────────────────────────
// The aiChat endpoint makes an outbound call to the Groq API on every request.
// Rate-limit by IP to prevent cost amplification and abuse.
// No external package is used — replace with Redis-backed limiter in production.
const AI_CHAT_WINDOW_MS = 60 * 1000; // 1 minute
const AI_CHAT_MAX = 15; // 15 questions per minute per IP
const aiChatAttempts = new Map();

const isAiChatLimited = (ip) => {
  const now = Date.now();
  const entry = aiChatAttempts.get(ip);
  if (!entry) return false;
  if (now - entry.windowStart > AI_CHAT_WINDOW_MS) { aiChatAttempts.delete(ip); return false; }
  return entry.count >= AI_CHAT_MAX;
};

const recordAiChat = (ip) => {
  const now = Date.now();
  const entry = aiChatAttempts.get(ip);
  if (!entry || now - entry.windowStart > AI_CHAT_WINDOW_MS) {
    aiChatAttempts.set(ip, { count: 1, windowStart: now });
  } else {
    entry.count += 1;
  }
};

// Characters that are common in prompt-injection payloads.  We don't attempt
// to sanitise the question — that is the LLM's job — but we do reject requests
// where the question contains control sequences that could confuse the Groq API
// wire format (null bytes, overlong lines, etc.).
const isSafeQuestion = (q) => !(/\x00/.test(q));

const aiChat = async (req, res, next) => {
  try {
    const clientIp = req.ip || req.socket?.remoteAddress || 'unknown';
    if (isAiChatLimited(clientIp)) {
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }
    recordAiChat(clientIp);

    const { knowledge, question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'question is required' });
    }
    if (!knowledge || !knowledge.trim()) {
      return res.status(400).json({ message: 'No knowledge base configured for this assistant.' });
    }
    if (question.trim().length > 500) {
      return res.status(400).json({ message: 'Question is too long (max 500 characters).' });
    }
    if (knowledge.trim().length > 20000) {
      return res.status(400).json({ message: 'Knowledge base is too large.' });
    }
    // Basic sanity check on the question string.
    if (!isSafeQuestion(question.trim())) {
      return res.status(400).json({ message: 'Invalid characters in question.' });
    }
    // SECURITY NOTE: The knowledge base is supplied by the client (the widget
    // config stored in the DB).  This is by design — each provider configures
    // their own chat assistant.  The LLM is instructed to stay within the
    // knowledge base; however, a determined attacker who controls a provider
    // account could craft a malicious knowledge base to attempt prompt
    // injection.  Future hardening: fetch the knowledge base server-side using
    // the username param (like getProviderPage does) instead of trusting the
    // client-supplied value.
    const answer = await chatWithKnowledge(knowledge.trim(), question.trim());
    res.json({ answer });
  } catch (err) {
    console.error('[aiChat error]', err?.message || err);
    next(err);
  }
};

module.exports = {
  getProviderPage,
  getProviderServices,
  getProviderLocations,
  getAvailableDates,
  getAvailableSlots,
  aiChat,
};
