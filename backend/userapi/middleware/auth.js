const jwt = require('jsonwebtoken');
const { getUserRepository } = require('../repositories/userRepository');

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || req.headers.Authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const uid = payload.userId || payload.sub;
    if (!uid) return res.status(401).json({ success: false, message: 'Invalid token payload' });

    // Load user via abstraction (Mongo or PostgreSQL)
    const repo = getUserRepository();
    const user = await repo.findById(uid);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    if (user.isActive === false || user.status === 'inactive') {
      return res.status(401).json({ success: false, message: 'User is deactivated' });
    }

    req.user = {
      _id: user._id || user.id,
      id: uid,
      userId: uid,
      email: user.email,
      fullName: user.fullName || user.full_name,
      username: user.username,
      role: user.role
    };
    next();
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) return next();
  return res.status(403).json({ success: false, message: 'Admin access required' });
}

module.exports = Object.assign(auth, { requireAdmin });
