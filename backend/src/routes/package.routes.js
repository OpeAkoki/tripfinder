// package routes - public browsing, admin-only write access
const router = require('express').Router();
const c = require('../controllers/package.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

router.get('/', c.list);
router.get('/:id', c.getOne);
router.post('/', authenticate, requireRole('admin'), c.create);
router.put('/:id', authenticate, requireRole('admin'), c.update);
router.delete('/:id', authenticate, requireRole('admin'), c.remove);
module.exports = router;
