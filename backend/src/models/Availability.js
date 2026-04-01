const mongoose = require('mongoose');

// Availability is set per location by the provider.
// type 'recurring': repeats every week on a given day
// type 'single': a one-off date slot

const availabilitySchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    type: { type: String, enum: ['recurring', 'single'], required: true },

    // Recurring fields
    dayOfWeek: { type: Number, min: 0, max: 6 }, // 0 = Sunday … 6 = Saturday
    validFrom: { type: Date },                    // recurring rule start date (optional)
    validUntil: { type: Date },                   // recurring rule end date (optional)

    // Single-date fields
    date: { type: Date },

    // Shared
    startTime: { type: String, required: true, trim: true }, // "09:00"
    endTime: { type: String, required: true, trim: true },   // "17:00"
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

// Core availability look-up used in every public slot and date query as well as
// the conflict-check inside availabilityController.
availabilitySchema.index({ provider: 1, location: 1, isActive: 1 });

// Conflict-check queries all OTHER providers at the same location.
availabilitySchema.index({ location: 1, isActive: 1 });

module.exports = mongoose.model('Availability', availabilitySchema);
