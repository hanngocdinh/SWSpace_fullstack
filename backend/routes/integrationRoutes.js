const express = require('express');
const router = express.Router();
const { testConnection } = require('../config/database');

// PostgreSQL-only health endpoint (Mongo legacy removed)
router.get('/health', async (req, res) => {
  let pgConnected = false;
  try { pgConnected = !!(await testConnection()); } catch (_) { pgConnected = false; }
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    components: { postgres: { connected: pgConnected } },
    legacyMongoRemoved: true
  });
});

module.exports = router;
