// auth routes
const router = require('express').Router();
const c = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { registerSchema, loginSchema } = require('../validation/booking.schema');

router.post('/register', validate(registerSchema), c.register);
router.post('/login', validate(loginSchema), c.login);
router.get('/me', authenticate, c.me);
module.exports = router;
