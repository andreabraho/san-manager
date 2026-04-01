const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Base user schema — SuperAdmin, Provider, Client all live in this collection
// using Mongoose discriminators (role field as discriminator key)

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['superadmin', 'provider', 'client'],
      required: true,
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    discriminatorKey: 'role',
    // Strip password from every JSON serialisation automatically so controllers
    // never have to remember .select('-password').
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Index on role so admin queries that filter by role stay fast.
userSchema.index({ role: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);

// ── SuperAdmin ────────────────────────────────────────────────
const SuperAdmin = User.discriminator(
  'superadmin',
  new mongoose.Schema({
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  })
);

// ── Provider ─────────────────────────────────────────────────
const providerDiscriminatorSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  }, // used in public URL /username
  displayName: { type: String, required: true, trim: true },
  bio: { type: String, default: '', trim: true },
  phone: { type: String, default: '', trim: true },
  canUploadImages: { type: Boolean, default: false }, // approved by superadmin
});

// username is already declared unique above (which creates an index), but we
// add an explicit compound index so lookups combining username + isActive
// (the most common public-page query) use a single efficient index.
providerDiscriminatorSchema.index({ username: 1, isActive: 1 });

const Provider = User.discriminator('provider', providerDiscriminatorSchema);

// ── Client ───────────────────────────────────────────────────
const Client = User.discriminator(
  'client',
  new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, default: '', trim: true },
  })
);

module.exports = { User, SuperAdmin, Provider, Client };
