const { User } = require('../models/User');

// Simple email format check
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const getMe = async (req, res, next) => {
  try {
    // Explicit field selection prevents the password field from being returned.
    // lean() bypasses the toJSON password-stripping transform on the User
    // schema, so we cannot rely on that transform — we must select() explicitly.
    const user = await User.findById(req.user._id)
      .select('-password')
      .lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const role = req.user.role;
    const allowed = {};

    // Email update is allowed for all roles
    if (req.body.email !== undefined) {
      if (!isValidEmail(req.body.email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      allowed.email = req.body.email.toLowerCase().trim();
    }

    if (role === 'provider') {
      if (req.body.displayName !== undefined) {
        if (typeof req.body.displayName !== 'string' || !req.body.displayName.trim()) {
          return res.status(400).json({ message: 'displayName must be a non-empty string' });
        }
        allowed.displayName = req.body.displayName.trim();
      }
      if (req.body.bio !== undefined) allowed.bio = String(req.body.bio).trim();
      if (req.body.phone !== undefined) allowed.phone = String(req.body.phone).trim();
    } else if (role === 'client') {
      if (req.body.firstName !== undefined) {
        if (typeof req.body.firstName !== 'string' || !req.body.firstName.trim()) {
          return res.status(400).json({ message: 'firstName must be a non-empty string' });
        }
        allowed.firstName = req.body.firstName.trim();
      }
      if (req.body.lastName !== undefined) {
        if (typeof req.body.lastName !== 'string' || !req.body.lastName.trim()) {
          return res.status(400).json({ message: 'lastName must be a non-empty string' });
        }
        allowed.lastName = req.body.lastName.trim();
      }
      if (req.body.phone !== undefined) allowed.phone = String(req.body.phone).trim();
    }

    const user = await User.findByIdAndUpdate(req.user._id, allowed, { new: true, runValidators: true })
      .select('-password')
      .lean();
    res.json(user);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Email already in use' });
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both currentPassword and newPassword are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'New password must differ from current password' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const valid = await user.comparePassword(currentPassword);
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save(); // triggers bcrypt hash via pre-save hook
    res.json({ message: 'Password updated' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, updateMe, changePassword };
