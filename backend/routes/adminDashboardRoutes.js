const express = require('express');
const controller = require('../controllers/adminDashboardController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyToken, requireAdmin);
router.get('/', controller.overview);
router.get('/notifications', controller.notifications);

module.exports = router;
