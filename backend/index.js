// Load environment variables FIRST before importing any modules that rely on them.
// This fixes 500 errors on /api/auth/login and /api/auth/register where JWT_SECRET was undefined.
require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const packageRoutes = require('./routes/packageRoutes');
// Unified User API (PostgreSQL-only now)
const userAuthRoutes = require('./userapi/routes/auth');
const userHealthRoutes = require('./userapi/routes/health');
// Migrated user domain routes
const userBookingRoutes = require('./userapi/routes/bookings');
const userPaymentRoutes = require('./userapi/routes/payment-methods');
const userQrRoutes = require('./userapi/routes/qr');
const paymentRoutes = require('./routes/paymentRoutes');
const userTeamRoutes = require('./userapi/routes/team-services');
const floor1Routes = require('./routes/floor1Routes');
const floor2Routes = require('./routes/floor2Routes');
const floor3Routes = require('./routes/floor3Routes');
const teamRoomsRoutes = require('./routes/teamRoomsRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const adminDashboardRoutes = require('./routes/adminDashboardRoutes');
const helmet = require('helmet');
const morgan = require('morgan');

const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
// Configure CORS: allow the dev frontends (3000 and 5174) by default,
// and allow overriding via ALLOWED_ORIGINS env (comma-separated).
const defaultAllowed = ['http://localhost:3000', 'http://localhost:5174'];
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : defaultAllowed;

// In development allow any origin (reflect) so dev frontends can talk to API.
if (process.env.NODE_ENV === 'production') {
  app.use(cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      console.warn('CORS blocked request from origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    exposedHeaders: ['Content-Range', 'X-Total-Count']
  }));
} else {
  // dev: reflect origin (sets Access-Control-Allow-Origin to request origin)
  app.use(cors({ origin: true, credentials: true, exposedHeaders: ['Content-Range', 'X-Total-Count'] }));
}

// Use the cors middleware to handle preflight (OPTIONS) and normal CORS responses.
// This keeps behavior consistent and avoids accidentally dropping headers on errors.
// In dev we already called app.use(cors(...)) above; ensure OPTIONS are handled too.
app.options('*', cors({ origin: process.env.NODE_ENV === 'production' ? function (origin, callback) {
  if (!origin) return callback(null, true);
  if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
  return callback(new Error('Not allowed by CORS'));
} : true, credentials: true }));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static images from backend/public/images at /images/*
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
// Serve uploaded videos (calibration source) at /uploads/*
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: dbStatus ? 'Connected' : 'Disconnected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (err) {
    res.status(500).json({
      status: 'ERROR',
      message: err.message
    });
  }
});

// API routes placeholder
app.get('/api', (req, res) => {
  res.json({
    message: 'SWSpace API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

app.use('/api/packages', packageRoutes);
// Auth endpoints are no longer exposed here. All authentication must go
// through the User API (backend_user). This backend only validates tokens.
// app.use('/api/auth', authRoutes);
// Merged User Authentication (MongoDB)
app.use('/api/auth', userAuthRoutes);
app.use('/api/user', userHealthRoutes); // /api/user/health
app.use('/api/bookings', userBookingRoutes);
app.use('/api/payment-methods', userPaymentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/qr', userQrRoutes);
app.use('/api/team', userTeamRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
// Space management - Floor 1
app.use('/api/space/floor1', floor1Routes);
// Space management - Floor 2 & Floor 3 (AI occupancy only)
app.use('/api/space/floor2', floor2Routes);
app.use('/api/space/floor3', floor3Routes);
// Admin team rooms management (Floor 2/3)
app.use('/api/admin/team-rooms', teamRoomsRoutes);
// Integration routes (Mongo + Scheduler health, sync, etc.)
app.use('/api/integration', integrationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Please check your database configuration.');
      process.exit(1);
    }

    // MongoDB fully removed for user domain; always PostgreSQL only now.
    console.log('[userapi] PostgreSQL-only mode. Mongo connection disabled.');

    app.listen(PORT, () => {
      console.log(`SWSpace Backend Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API endpoint: http://localhost:${PORT}/api`);
      console.log(`Integration health: http://localhost:${PORT}/api/integration/health`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();