const express = require('express');
const controller = require('../controllers/adminUserController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/:id/recent-bookings', controller.recentBookings);
router.get('/:id', controller.detail);
router.put('/:id', controller.update);
router.patch('/:id/status', controller.updateStatus);
router.delete('/:id', controller.destroy);

module.exports = router;
