const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getMe, updateMe, changePassword } = require('../controllers/meController');

router.use(authenticate);

router.get('/', getMe);
router.put('/', updateMe);
router.put('/password', changePassword);

module.exports = router;
