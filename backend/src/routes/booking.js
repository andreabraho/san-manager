const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  createBooking,
  getProviderBookings,
  updateBookingStatus,
  getClientBookings,
  getAvailableSlots,
  guestLookup,
} = require('../controllers/bookingController');

// Public: get available slots for a provider/location/service/date
router.get('/slots', getAvailableSlots);

// Public: look up bookings by guest identity (email + name)
router.post('/guest-lookup', guestLookup);

// Public: create a booking (guest or registered client)
router.post('/', createBooking);

// Provider: view and manage their bookings
router.get('/provider', authenticate, authorize('provider'), getProviderBookings);
router.patch('/:id/status', authenticate, authorize('provider'), updateBookingStatus);

// Client: view their own bookings
router.get('/client', authenticate, authorize('client'), getClientBookings);

module.exports = router;
