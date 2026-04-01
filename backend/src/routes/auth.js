const router = require('express').Router();
const { registerProvider, registerClient, login } = require('../controllers/authController');

router.post('/register/provider', registerProvider);
router.post('/register/client', registerClient);
router.post('/login', login);

module.exports = router;
