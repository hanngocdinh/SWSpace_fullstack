const express = require('express');
const router = express.Router();

// Deprecated legacy Mongo health route replaced by global /health.
router.get('/health', (req, res) => {
  res.json({
    ok: true,
    driver: 'postgresql',
    message: 'MongoDB health endpoint removed. Use /health for server status.',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
