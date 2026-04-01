const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getProfile, updateProfile } = require('../controllers/clientController');

router.use(authenticate, authorize('client'));
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
