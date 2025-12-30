const jwt = require('jsonwebtoken');

// IMPORTANT: This backend now trusts tokens issued by the User API (backend_user).
// Ensure JWT_SECRET is the same value in both services.
const JWT_SECRET = process.env.JWT_SECRET || 'please_set_a_long_secret_in_env';

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // Token payload from backend_user contains: { userId, role, email }
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.userId || payload.sub, role: payload.role, email: payload.email };
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }
    next();
  } catch (err) {
    console.error('verifyToken error', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}

module.exports = {
  verifyToken,
  requireAdmin
};
