const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    isActive: { type: Boolean, default: true },
    sharedWith: [
      {
        provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending',
        },
      },
    ],
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

// Provider location list (getProviderLocations, hasLocationAccess look-ups).
locationSchema.index({ provider: 1, isActive: 1 });

module.exports = mongoose.model('Location', locationSchema);
