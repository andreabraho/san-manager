const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getStats,
  getProviders,
  getClients,
  setUserActive,
  approveProviderImages,
  createSuperAdmin,
  getWidgetTypes,
  setWidgetTypeEnabled,
} = require('../controllers/adminController');

router.use(authenticate, authorize('superadmin'));

router.get('/stats', getStats);
router.get('/providers', getProviders);
router.get('/clients', getClients);
router.patch('/users/:id/active', setUserActive);
router.patch('/providers/:id/approve-images', approveProviderImages);
router.post('/superadmin', createSuperAdmin);
router.get('/widget-types', getWidgetTypes);
router.patch('/widget-types/:id/enabled', setWidgetTypeEnabled);

module.exports = router;
