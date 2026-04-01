const mongoose = require('mongoose');
const Service = require('../models/Service');
const Location = require('../models/Location');

// Verify that all supplied locationIds belong to this provider (own or accepted-shared)
const validateLocationsAccess = async (providerId, locationIds) => {
  if (!locationIds || locationIds.length === 0) return true;
  for (const id of locationIds) {
    if (!mongoose.isValidObjectId(id)) return false;
  }
  const ownCount = await Location.countDocuments({
    _id: { $in: locationIds },
    provider: providerId,
  });
  if (ownCount === locationIds.length) return true;
  // Also check accepted-shared locations
  const sharedCount = await Location.countDocuments({
    _id: { $in: locationIds },
    sharedWith: { $elemMatch: { provider: providerId, status: 'accepted' } },
  });
  return ownCount + sharedCount === locationIds.length;
};

const getServices = async (req, res, next) => {
  try {
    const services = await Service.find({ provider: req.user._id })
      .populate('locations', 'name city')
      .lean();
    res.json(services);
  } catch (err) {
    next(err);
  }
};

const createService = async (req, res, next) => {
  try {
    const { name, description, durationMinutes, maxPeople, price, locations } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'name is required' });
    }
    if (!durationMinutes || typeof durationMinutes !== 'number' || durationMinutes <= 0) {
      return res.status(400).json({ message: 'durationMinutes must be a positive number' });
    }
    if (maxPeople !== undefined && (typeof maxPeople !== 'number' || maxPeople < 1)) {
      return res.status(400).json({ message: 'maxPeople must be a positive integer' });
    }
    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return res.status(400).json({ message: 'price must be a non-negative number' });
    }

    const locIds = Array.isArray(locations) ? locations : [];
    const hasAccess = await validateLocationsAccess(req.user._id, locIds);
    if (!hasAccess) {
      return res.status(403).json({ message: 'One or more locations are not accessible to you' });
    }

    const service = await Service.create({
      provider: req.user._id,
      name: name.trim(),
      description: description ? String(description).trim() : '',
      durationMinutes,
      maxPeople: maxPeople || 1,
      price: price !== undefined ? price : 0,
      locations: locIds,
    });
    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
};

const updateService = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid service id' });
    }

    // Whitelist updatable fields — prevent mass assignment
    const { name, description, durationMinutes, maxPeople, price, locations, isActive } = req.body;
    const update = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ message: 'name must be a non-empty string' });
      }
      update.name = name.trim();
    }
    if (description !== undefined) update.description = String(description).trim();
    if (durationMinutes !== undefined) {
      if (typeof durationMinutes !== 'number' || durationMinutes <= 0) {
        return res.status(400).json({ message: 'durationMinutes must be a positive number' });
      }
      update.durationMinutes = durationMinutes;
    }
    if (maxPeople !== undefined) {
      if (typeof maxPeople !== 'number' || maxPeople < 1) {
        return res.status(400).json({ message: 'maxPeople must be a positive integer' });
      }
      update.maxPeople = maxPeople;
    }
    if (locations !== undefined) {
      const locIds = Array.isArray(locations) ? locations : [];
      const hasAccess = await validateLocationsAccess(req.user._id, locIds);
      if (!hasAccess) {
        return res.status(403).json({ message: 'One or more locations are not accessible to you' });
      }
      update.locations = locIds;
    }
    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({ message: 'price must be a non-negative number' });
      }
      update.price = price;
    }
    if (isActive !== undefined) update.isActive = !!isActive;

    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, provider: req.user._id },
      update,
      { new: true }
    );
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    next(err);
  }
};

const deleteService = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid service id' });
    }
    const deleted = await Service.findOneAndDelete({ _id: req.params.id, provider: req.user._id });
    if (!deleted) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getServices, createService, updateService, deleteService };
