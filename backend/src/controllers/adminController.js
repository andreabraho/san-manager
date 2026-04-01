const mongoose = require('mongoose');
const { User, SuperAdmin, Provider, Client } = require('../models/User');
const Booking = require('../models/Booking');
const WidgetType = require('../models/WidgetType');

// Simple email format check
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const getStats = async (req, res, next) => {
  try {
    const [totalProviders, totalClients, totalBookings, pendingBookings] = await Promise.all([
      User.countDocuments({ role: 'provider' }),
      User.countDocuments({ role: 'client' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
    ]);
    res.json({ totalProviders, totalClients, totalBookings, pendingBookings });
  } catch (err) {
    next(err);
  }
};

const getProviders = async (req, res, next) => {
  try {
    // Select only the fields the admin UI needs — never return password hashes
    // or other internal fields even though they are nominally excluded by the
    // toJSON transform (lean() bypasses transforms).
    const providers = await Provider.find()
      .select('_id email username displayName bio phone isActive canUploadImages createdAt updatedAt role')
      .sort({ createdAt: -1 })
      .lean();
    res.json(providers);
  } catch (err) {
    next(err);
  }
};

const getClients = async (req, res, next) => {
  try {
    // Same as getProviders — explicit field whitelist to prevent accidental
    // future schema additions from being silently exposed.
    const clients = await Client.find()
      .select('_id email firstName lastName phone isActive createdAt updatedAt role')
      .sort({ createdAt: -1 })
      .lean();
    res.json(clients);
  } catch (err) {
    next(err);
  }
};

const setUserActive = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    if (typeof req.body.isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true }
    ).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, isActive: user.isActive });
  } catch (err) {
    next(err);
  }
};

const approveProviderImages = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid provider id' });
    }
    if (typeof req.body.approved !== 'boolean') {
      return res.status(400).json({ message: 'approved must be a boolean' });
    }
    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      { canUploadImages: req.body.approved },
      { new: true }
    ).lean();
    if (!provider) return res.status(404).json({ message: 'Provider not found' });
    res.json({ id: provider._id, canUploadImages: provider.canUploadImages });
  } catch (err) {
    next(err);
  }
};

// Only superadmin can create another superadmin
const createSuperAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    const admin = await SuperAdmin.create({
      email: email.toLowerCase().trim(),
      password,
      createdBy: req.user._id,
    });
    res.status(201).json({ id: admin._id, email: admin.email });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'email already in use' });
    }
    next(err);
  }
};

const getWidgetTypes = async (req, res, next) => {
  try {
    const types = await WidgetType.find().sort({ key: 1 }).lean();
    res.json(types);
  } catch (err) {
    next(err);
  }
};

const setWidgetTypeEnabled = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid widget type id' });
    }
    if (typeof req.body.isEnabled !== 'boolean') {
      return res.status(400).json({ message: 'isEnabled must be a boolean' });
    }
    const wt = await WidgetType.findByIdAndUpdate(
      req.params.id,
      { isEnabled: req.body.isEnabled },
      { new: true }
    ).lean();
    if (!wt) return res.status(404).json({ message: 'Widget type not found' });
    res.json(wt);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStats,
  getProviders,
  getClients,
  setUserActive,
  approveProviderImages,
  createSuperAdmin,
  getWidgetTypes,
  setWidgetTypeEnabled,
};
