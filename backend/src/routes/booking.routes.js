// booking routes
const router = require('express').Router();
const c = require('../controllers/booking.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { createBookingSchema } = require('../validation/booking.schema');

router.post('/', authenticate, validate(createBookingSchema), c.create);
router.get('/all', authenticate, requireRole('advisor', 'admin'), c.listAll);
router.get('/', authenticate, c.list);
router.get('/:id', authenticate, c.getOne);
router.put('/:id', authenticate, validate(createBookingSchema), c.update);
router.delete('/:id', authenticate, c.cancel);
module.exports = router;
