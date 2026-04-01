const mongoose = require('mongoose');
const Availability = require('../models/Availability');
const Location = require('../models/Location');

// Check if provider has access to a location (owner or accepted share)
const hasLocationAccess = async (providerId, locationId) => {
  const loc = await Location.findById(locationId).lean();
  if (!loc) return false;
  if (loc.provider.equals(providerId)) return true;
  const share = loc.sharedWith.find(
    (s) => s.provider.equals(providerId) && s.status === 'accepted'
  );
  return !!share;
};

// Time overlap: returns true if [s1,e1) overlaps [s2,e2) (HH:MM strings)
const timesOverlap = (s1, e1, s2, e2) => s1 < e2 && e1 > s2;

// Check if a new slot conflicts with existing slots from OTHER providers at the same location
const hasConflict = async ({ locationId, providerId, type, dayOfWeek, date, startTime, endTime, excludeId }) => {
  const filter = {
    location: locationId,
    provider: { $ne: providerId },
    isActive: true,
  };

  const others = await Availability.find(filter).lean();

  for (const other of others) {
    if (other.type === 'recurring' && type === 'recurring') {
      if (other.dayOfWeek !== dayOfWeek) continue;
      if (timesOverlap(startTime, endTime, other.startTime, other.endTime)) return other;
    } else if (other.type === 'single' && type === 'single') {
      const otherDate = new Date(other.date).toISOString().slice(0, 10);
      const newDate = new Date(date + 'T00:00:00Z').toISOString().slice(0, 10);
      if (otherDate !== newDate) continue;
      if (timesOverlap(startTime, endTime, other.startTime, other.endTime)) return other;
    } else if (other.type === 'single' && type === 'recurring') {
      // A single-date entry blocks the recurring slot on that specific day
      const otherDow = new Date(other.date).getUTCDay();
      if (otherDow !== dayOfWeek) continue;
      if (timesOverlap(startTime, endTime, other.startTime, other.endTime)) return other;
    } else if (other.type === 'recurring' && type === 'single') {
      const newDow = new Date(date + 'T00:00:00Z').getUTCDay();
      if (other.dayOfWeek !== newDow) continue;
      if (timesOverlap(startTime, endTime, other.startTime, other.endTime)) return other;
    }
  }
  return null;
};

// Validate HH:MM time string
const isValidTime = (t) => /^\d{2}:\d{2}$/.test(t);

const getAvailabilities = async (req, res, next) => {
  try {
    const { locationId } = req.query;
    const filter = { provider: req.user._id };
    if (locationId) {
      if (!mongoose.isValidObjectId(locationId)) {
        return res.status(400).json({ message: 'Invalid locationId' });
      }
      filter.location = locationId;
    }
    const list = await Availability.find(filter).populate('location', 'name').lean();
    res.json(list);
  } catch (err) {
    next(err);
  }
};

const createAvailability = async (req, res, next) => {
  try {
    const { location: locationId, type, dayOfWeek, date, startTime, endTime, validFrom, validUntil } = req.body;

    // Input validation
    if (!locationId || !type || !startTime || !endTime) {
      return res.status(400).json({ message: 'location, type, startTime and endTime are required' });
    }
    if (!mongoose.isValidObjectId(locationId)) {
      return res.status(400).json({ message: 'Invalid location id' });
    }
    if (!['recurring', 'single'].includes(type)) {
      return res.status(400).json({ message: 'type must be recurring or single' });
    }
    if (!isValidTime(startTime) || !isValidTime(endTime)) {
      return res.status(400).json({ message: 'startTime and endTime must be HH:MM format' });
    }
    if (startTime >= endTime) {
      return res.status(400).json({ message: 'endTime must be after startTime' });
    }
    if (type === 'recurring') {
      if (dayOfWeek === undefined || dayOfWeek === null || typeof dayOfWeek !== 'number' || dayOfWeek < 0 || dayOfWeek > 6) {
        return res.status(400).json({ message: 'dayOfWeek (0-6) is required for recurring availability' });
      }
    }
    if (type === 'single') {
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ message: 'date (YYYY-MM-DD) is required for single availability' });
      }
    }

    const access = await hasLocationAccess(req.user._id, locationId);
    if (!access) return res.status(403).json({ message: 'No access to this location' });

    const conflict = await hasConflict({ locationId, providerId: req.user._id, type, dayOfWeek, date, startTime, endTime });
    if (conflict) {
      return res.status(409).json({ message: 'Time slot conflicts with another provider at this location' });
    }

    // Build document explicitly — do not spread req.body to prevent mass assignment
    const doc = {
      provider: req.user._id,
      location: locationId,
      type,
      startTime,
      endTime,
    };
    if (type === 'recurring') {
      doc.dayOfWeek = dayOfWeek;
      if (validFrom) doc.validFrom = validFrom;
      if (validUntil) doc.validUntil = validUntil;
    } else {
      doc.date = date;
    }

    const avail = await Availability.create(doc);
    res.status(201).json(avail);
  } catch (err) {
    next(err);
  }
};

const updateAvailability = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid availability id' });
    }

    const existing = await Availability.findOne({ _id: req.params.id, provider: req.user._id });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    // Whitelist updatable fields
    const { startTime, endTime, dayOfWeek, date, validFrom, validUntil, isActive } = req.body;
    const update = {};

    if (startTime !== undefined) {
      if (!isValidTime(startTime)) return res.status(400).json({ message: 'startTime must be HH:MM format' });
      update.startTime = startTime;
    }
    if (endTime !== undefined) {
      if (!isValidTime(endTime)) return res.status(400).json({ message: 'endTime must be HH:MM format' });
      update.endTime = endTime;
    }
    const newStart = update.startTime || existing.startTime;
    const newEnd = update.endTime || existing.endTime;
    if (newStart >= newEnd) {
      return res.status(400).json({ message: 'endTime must be after startTime' });
    }

    if (dayOfWeek !== undefined) {
      if (existing.type === 'recurring' && (typeof dayOfWeek !== 'number' || dayOfWeek < 0 || dayOfWeek > 6)) {
        return res.status(400).json({ message: 'dayOfWeek must be 0-6 for recurring availability' });
      }
      update.dayOfWeek = dayOfWeek;
    }
    if (date !== undefined) {
      if (existing.type === 'single' && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date)))) {
        return res.status(400).json({ message: 'date must be a valid YYYY-MM-DD string for single availability' });
      }
      update.date = date;
    }
    if (validFrom !== undefined) update.validFrom = validFrom;
    if (validUntil !== undefined) update.validUntil = validUntil;
    if (isActive !== undefined) update.isActive = !!isActive;

    const merged = { ...existing.toObject(), ...update };
    const conflict = await hasConflict({
      locationId: merged.location,
      providerId: req.user._id,
      type: merged.type,
      dayOfWeek: merged.dayOfWeek,
      date: merged.date,
      startTime: merged.startTime,
      endTime: merged.endTime,
      excludeId: existing._id,
    });
    if (conflict) {
      return res.status(409).json({ message: 'Time slot conflicts with another provider at this location' });
    }

    const avail = await Availability.findOneAndUpdate(
      { _id: req.params.id, provider: req.user._id },
      update,
      { new: true }
    );
    res.json(avail);
  } catch (err) {
    next(err);
  }
};

const deleteAvailability = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid availability id' });
    }
    const deleted = await Availability.findOneAndDelete({ _id: req.params.id, provider: req.user._id });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAvailabilities, createAvailability, updateAvailability, deleteAvailability };
