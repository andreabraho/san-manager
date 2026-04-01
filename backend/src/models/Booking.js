const mongoose = require('mongoose');

// guestInfo is used when the client books without an account
const guestInfoSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    isFirstTime: { type: Boolean, default: false },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },

    // Registered client OR guest (one of the two is always set)
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    guestInfo: { type: guestInfoSchema, default: null },

    date: { type: Date, required: true },
    startTime: { type: String, required: true, trim: true }, // "14:00"
    endTime: { type: String, required: true, trim: true },   // "15:00"

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },

    notes: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

// Primary slot-availability check: provider + location + date range + status.
// Covers getAvailableSlots, getAvailableDates, and getProviderBookings.
bookingSchema.index({ provider: 1, location: 1, date: 1, status: 1 });

// Provider dashboard: filter by provider + optional status, sorted by date.
bookingSchema.index({ provider: 1, status: 1, date: 1 });

// Client booking history (getClientBookings).
bookingSchema.index({ client: 1, date: -1 });

// Guest lookup by email — the most selective field in the guestLookup query.
bookingSchema.index({ 'guestInfo.email': 1 });

module.exports = mongoose.model('Booking', bookingSchema);
