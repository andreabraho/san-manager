const { Client } = require('../models/User');

const getProfile = async (req, res, next) => {
  try {
    // Explicit field selection — lean() bypasses toJSON transforms including
    // the password-stripping transform defined on the User schema, so the
    // select() whitelist is the only reliable guard here.
    const client = await Client.findById(req.user._id)
      .select('_id email firstName lastName phone isActive createdAt updatedAt role')
      .lean();
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    // Whitelist updatable fields to prevent mass assignment
    const { firstName, lastName, phone } = req.body;
    const update = {};

    if (firstName !== undefined) {
      if (typeof firstName !== 'string' || !firstName.trim()) {
        return res.status(400).json({ message: 'firstName must be a non-empty string' });
      }
      update.firstName = firstName.trim();
    }
    if (lastName !== undefined) {
      if (typeof lastName !== 'string' || !lastName.trim()) {
        return res.status(400).json({ message: 'lastName must be a non-empty string' });
      }
      update.lastName = lastName.trim();
    }
    if (phone !== undefined) {
      update.phone = String(phone).trim();
    }

    const client = await Client.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true })
      .select('_id email firstName lastName phone isActive createdAt updatedAt role')
      .lean();
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile };
