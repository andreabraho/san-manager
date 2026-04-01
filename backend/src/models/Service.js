const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // locations where this service is offered (subset of provider's locations)
    locations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }],
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    durationMinutes: {
      type: Number,
      required: true,
      min: [1, 'durationMinutes must be at least 1'],
    }, // e.g. 60
    price: {
      type: Number,
      default: 0,
      min: [0, 'price cannot be negative'],
    },
    maxPeople: {
      type: Number,
      default: 1,
      min: [1, 'maxPeople must be at least 1'],
    }, // 1 = individual appointment
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

// Provider service list (getProviderServices, Service.findOne for duration lookup).
serviceSchema.index({ provider: 1, isActive: 1 });

module.exports = mongoose.model('Service', serviceSchema);
