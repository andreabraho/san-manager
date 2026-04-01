const router = require('express').Router();
const {
  getProviderPage,
  getProviderServices,
  getProviderLocations,
  getAvailableDates,
  getAvailableSlots,
  aiChat,
} = require('../controllers/publicController');

// All routes here are unauthenticated (public)
router.get('/providers/:username', getProviderPage);
router.get('/providers/:username/services', getProviderServices);
router.get('/providers/:username/locations', getProviderLocations);
router.get('/providers/:username/available-dates', getAvailableDates);
router.get('/providers/:username/available-slots', getAvailableSlots);
router.post('/chat', aiChat);

module.exports = router;
