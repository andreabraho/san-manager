const path = require('path');
const { Provider } = require('../models/User');
const HomePage = require('../models/HomePage');

const getProfile = async (req, res, next) => {
  try {
    // Explicit field selection: lean() bypasses the toJSON password-stripping
    // transform, so we must never rely on that transform when using lean().
    const provider = await Provider.findById(req.user._id)
      .select('_id email username displayName bio phone isActive canUploadImages createdAt updatedAt role')
      .lean();
    if (!provider) return res.status(404).json({ message: 'Provider not found' });
    res.json(provider);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    // Whitelist fields — username and canUploadImages must not be user-settable here
    const { displayName, bio, phone } = req.body;
    const update = {};

    if (displayName !== undefined) {
      if (typeof displayName !== 'string' || !displayName.trim()) {
        return res.status(400).json({ message: 'displayName must be a non-empty string' });
      }
      update.displayName = displayName.trim();
    }
    if (bio !== undefined) update.bio = String(bio).trim();
    if (phone !== undefined) update.phone = String(phone).trim();

    const provider = await Provider.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true })
      .select('_id email username displayName bio phone isActive canUploadImages createdAt updatedAt role')
      .lean();
    if (!provider) return res.status(404).json({ message: 'Provider not found' });
    res.json(provider);
  } catch (err) {
    next(err);
  }
};

const uploadImage = async (req, res, next) => {
  try {
    if (!req.user.canUploadImages) {
      return res.status(403).json({ message: 'Image upload not approved yet' });
    }
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    // Use the backend's own base URL (SERVER_URL env), falling back to a relative path
    const base = process.env.SERVER_URL || '';
    const url = `${base}/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (err) {
    next(err);
  }
};

const getHomePage = async (req, res, next) => {
  try {
    const page = await HomePage.findOne({ provider: req.user._id }).lean();
    res.json(page || { widgets: [], cols: 12 });
  } catch (err) {
    next(err);
  }
};

const saveHomePage = async (req, res, next) => {
  try {
    const { widgets, cols, branding } = req.body;
    const update = {};

    if (widgets !== undefined) {
      if (!Array.isArray(widgets)) {
        return res.status(400).json({ message: 'widgets must be an array' });
      }
      update.widgets = widgets;
    }
    if (cols !== undefined) {
      if (typeof cols !== 'number' || cols < 1) {
        return res.status(400).json({ message: 'cols must be a positive number' });
      }
      update.cols = cols;
    }
    if (branding !== undefined) {
      if (typeof branding !== 'object' || Array.isArray(branding)) {
        return res.status(400).json({ message: 'branding must be an object' });
      }
      update.branding = branding;
    }

    const page = await HomePage.findOneAndUpdate(
      { provider: req.user._id },
      update,
      { upsert: true, new: true }
    );
    res.json(page);
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, uploadImage, getHomePage, saveHomePage };
