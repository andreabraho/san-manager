const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getProfile,
  updateProfile,
  uploadImage,
  getHomePage,
  saveHomePage,
} = require('../controllers/providerController');
const {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  shareLocation,
  removeShare,
  getShareInvites,
  respondToShare,
} = require('../controllers/locationController');
const {
  getServices,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const {
  getAvailabilities,
  createAvailability,
  updateAvailability,
  deleteAvailability,
} = require('../controllers/availabilityController');

router.use(authenticate, authorize('provider'));

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/upload-image', upload.single('image'), uploadImage);

// Home page editor
router.get('/homepage', getHomePage);
router.put('/homepage', saveHomePage);

// Locations
router.get('/locations', getLocations);
router.post('/locations', createLocation);
// Static sub-paths MUST come before /:id routes to avoid param shadowing
router.get('/locations/share-invites', getShareInvites);
router.put('/locations/:id', updateLocation);
router.delete('/locations/:id', deleteLocation);

// Location sharing
router.post('/locations/:id/share', shareLocation);
router.delete('/locations/:id/share/:providerId', removeShare);
router.patch('/locations/:id/share-response', respondToShare);

// Services
router.get('/services', getServices);
router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

// Availability
router.get('/availability', getAvailabilities);
router.post('/availability', createAvailability);
router.put('/availability/:id', updateAvailability);
router.delete('/availability/:id', deleteAvailability);

module.exports = router;
