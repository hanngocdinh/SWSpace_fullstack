// backend/routes/packageRoutes.js
const express = require('express');
const router = express.Router();
const ctl = require('../controllers/packageController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', ctl.list);

// In production restrict create/update/delete to admins. In development allow
// unauthenticated modifications for faster testing.
if (process.env.NODE_ENV === 'production') {
	router.post('/', verifyToken, requireAdmin, ctl.create);
	router.put('/:id', verifyToken, requireAdmin, ctl.update);
	router.delete('/:id', verifyToken, requireAdmin, ctl.remove);
} else {
	router.post('/', ctl.create);
	router.put('/:id', ctl.update);
	router.delete('/:id', ctl.remove);
}

module.exports = router;
