const express = require('express');
const jwt = require('jsonwebtoken');
// Replace direct Mongoose model usage by abstraction repository (MongoDB or PostgreSQL)
const { getUserRepository } = require('../repositories/userRepository');
const auth = require('../middleware/auth');

const router = express.Router();

const repo = getUserRepository();
const generateToken = (user) => {
  const id = repo.getId ? repo.getId(user) : (user._id?.toString?.() || user.id);
  return jwt.sign({ userId: id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName, phone } = req.body;
  const existingUser = await repo.existsByEmailOrUsername(email, username);
    if (existingUser) return res.status(400).json({ success: false, message: 'User with this email or username already exists' });
  const user = await repo.createUser({ username, email, password, fullName, phone });
    const token = generateToken(user);
  const safe = repo.getSafeUser ? repo.getSafeUser(user) : { id: user._id, username: user.username, email: user.email, fullName: user.fullName, role: user.role };
  res.status(201).json({ success: true, message: 'User registered successfully', token, user: safe });
  } catch (error) {
    console.error('Register error:', error); res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: 'Please provide username and password' });
  const user = await repo.findByLogin(username);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid username or password' });
  if (user.isActive === false) return res.status(401).json({ success: false, message: 'Account is deactivated' });
  const ok = await repo.comparePassword(user, password);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid username or password' });
  await repo.updateLastLogin(user);
    const token = generateToken(user);
  const safe = repo.getSafeUser ? repo.getSafeUser(user) : { id: user._id, username: user.username, email: user.email, fullName: user.fullName, role: user.role };
  res.json({ success: true, message: 'Login successful', token, user: safe });
  } catch (error) { console.error('Login error:', error); res.status(500).json({ success: false, message: 'Server error during login', error: error.message }); }
});

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await repo.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const safe = repo.getSafeUser ? repo.getSafeUser(user) : { id: user._id, username: user.username, email: user.email, fullName: user.fullName, role: user.role, phone: user.phone, createdAt: user.createdAt, lastLogin: user.lastLogin };
    res.json({ success: true, user: safe });
  } catch (error) { console.error('Profile error:', error); res.status(500).json({ success: false, message: 'Server error getting profile', error: error.message }); }
});

router.put('/profile', auth, async (req, res) => {
  try { const { fullName, phone } = req.body; const user = await repo.updateProfile(req.user.id, { fullName, phone }); if (!user) return res.status(404).json({ success: false, message: 'User not found' }); const safe = repo.getSafeUser ? repo.getSafeUser(user) : user; res.json({ success: true, message: 'Profile updated successfully', user: safe }); } catch (error) { console.error('Update profile error:', error); res.status(500).json({ success: false, message: 'Server error updating profile', error: error.message }); }
});

router.post('/logout', auth, (req, res) => { res.json({ success: true, message: 'Logged out successfully' }); });

router.get('/users', auth, async (req, res) => {
  try { const me = await repo.findById(req.user.id); if (!me || me.role !== 'admin') return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' }); const users = await repo.listAll(); res.json({ success: true, count: users.length, users: users.map(u => repo.getSafeUser ? repo.getSafeUser(u) : u) }); } catch (error) { console.error('Get users error:', error); res.status(500).json({ success: false, message: 'Server error getting users', error: error.message }); }
});

router.put('/change-password', auth, async (req, res) => {
  try { const { currentPassword, newPassword } = req.body; if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Please provide current password and new password' }); const user = await repo.findById(req.user.id); if (!user) return res.status(404).json({ success: false, message: 'User not found' }); const ok = await repo.comparePassword(user, currentPassword); if (!ok) return res.status(400).json({ success: false, message: 'Current password is incorrect' }); await repo.changePassword(repo.getId ? repo.getId(user) : user.id, newPassword); res.json({ success: true, message: 'Password changed successfully' }); } catch (error) { console.error('Change password error:', error); res.status(500).json({ success: false, message: 'Server error changing password', error: error.message }); }
});

module.exports = router;
