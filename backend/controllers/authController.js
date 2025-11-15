const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserModel = require('../models/userModel');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'please_set_a_long_secret_in_env';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_DAYS = Number(process.env.REFRESH_EXPIRES_DAYS || 30);

function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};
  return header.split(';').map(c => c.trim()).reduce((acc, pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return acc;
    const key = pair.substring(0, idx);
    const val = pair.substring(idx + 1);
    acc[key] = decodeURIComponent(val);
    return acc;
  }, {});
}

module.exports = {
  async register(req, res) {
    try {
      const { email, password, fullName, phone } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

      const existing = await UserModel.findByEmail(email.toLowerCase());
      if (existing) return res.status(409).json({ error: 'Email already registered' });

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Always create as 'user' role by default
      const user = await UserModel.create({
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        phone,
        role: 'user'
      });

      // Do not return password hash
      delete user.password_hash;

      res.status(201).json({ user });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

      const user = await UserModel.findByEmail(email.toLowerCase());
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ sub: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      // create refresh token (plain for dev). We'll store it in auth_sessions.refresh_token_hash column.
      const refreshToken = crypto.randomBytes(48).toString('hex');
      const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 3600 * 1000);
      try {
        await db.pool.query(
          `INSERT INTO auth_sessions (user_id, refresh_token_hash, user_agent, ip, expires_at) VALUES ($1,$2,$3,$4,$5)`,
          [user.id, refreshToken, req.headers['user-agent'] || null, req.ip || null, expiresAt]
        );
      } catch (e) {
        console.error('Failed to store refresh session', e);
      }

      // set HttpOnly cookie for refresh token
      const secure = process.env.NODE_ENV === 'production';
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure, sameSite: 'lax', maxAge: REFRESH_EXPIRES_DAYS * 24 * 3600 * 1000 });

      res.json({ token, user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name } });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: err.message });
    }
  }
,

  // POST /api/auth/refresh -> rotate refresh token and return new access token
  async refresh(req, res) {
    try {
      const cookies = parseCookies(req);
      const incoming = cookies.refreshToken || null;
      if (!incoming) return res.status(401).json({ error: 'No refresh token' });

      const { rows } = await db.pool.query(`SELECT * FROM auth_sessions WHERE refresh_token_hash=$1 AND expires_at > NOW() LIMIT 1`, [incoming]);
      const session = rows[0];
      if (!session) return res.status(401).json({ error: 'Invalid refresh token' });

      const user = await UserModel.findById(session.user_id);
      if (!user) return res.status(401).json({ error: 'Invalid session user' });

      const token = jwt.sign({ sub: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      // rotate refresh token: issue new, update DB and cookie
      const newRefresh = crypto.randomBytes(48).toString('hex');
      const newExpiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 3600 * 1000);
      await db.pool.query(`UPDATE auth_sessions SET refresh_token_hash=$1, expires_at=$2 WHERE id=$3`, [newRefresh, newExpiresAt, session.id]);

      const secure = process.env.NODE_ENV === 'production';
      res.cookie('refreshToken', newRefresh, { httpOnly: true, secure, sameSite: 'lax', maxAge: REFRESH_EXPIRES_DAYS * 24 * 3600 * 1000 });

      res.json({ token, user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name } });
    } catch (err) {
      console.error('Refresh error:', err);
      res.status(500).json({ error: 'Failed to refresh token' });
    }
  },

  // POST /api/auth/logout -> clear refresh session and cookie
  async logout(req, res) {
    try {
      const cookies = parseCookies(req);
      const incoming = cookies.refreshToken || null;
      if (incoming) {
        try { await db.pool.query(`DELETE FROM auth_sessions WHERE refresh_token_hash=$1`, [incoming]); } catch (e) { console.error(e); }
      }
      res.clearCookie('refreshToken');
      res.json({ ok: true });
    } catch (err) {
      console.error('Logout error:', err);
      res.status(500).json({ error: 'Failed to logout' });
    }
  }
};
