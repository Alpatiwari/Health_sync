// src/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');
const rateLimitingMiddleware = require('./middleware/rateLimiting');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const healthDataRoutes = require('./routes/healthData');
const correlationRoutes = require('./routes/correlations');
const microMomentRoutes = require('./routes/microMoments');
const predictionRoutes = require('./routes/predictions');
const insightRoutes = require('./routes/insights');
const integrationRoutes = require('./routes/integrations');
const notificationRoutes = require('./routes/notifications');

// Job scheduler
const jobScheduler = require('./jobs');

const app = express();

// ==================================================================
// MIDDLEWARE SETUP
// ==================================================================
app.use(helmet());
app.use(compression());
app.use(cors(config.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', rateLimitingMiddleware.general);
app.use('/api/auth/', rateLimitingMiddleware.auth);

// Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { 
    ip: req.ip, 
    userAgent: req.get('User-Agent') 
  });
  next();
});

// ==================================================================
// ROUTES
// ==================================================================
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/health-data', authMiddleware, healthDataRoutes);
app.use('/api/correlations', authMiddleware, correlationRoutes);
app.use('/api/micro-moments', authMiddleware, microMomentRoutes);
app.use('/api/predictions', authMiddleware, predictionRoutes);
app.use('/api/insights', authMiddleware, insightRoutes);
app.use('/api/integrations', authMiddleware, integrationRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Error handling
app.use(errorHandler);

// ==================================================================
// DATABASE CONNECTION & SERVER START
// ==================================================================
const startServer = async () => {
  try {
    await mongoose.connect(config.database.mongodb.uri, config.database.mongodb.options);
    logger.info('Connected to MongoDB');

    // Start background jobs
    await jobScheduler.start();
    logger.info('Background jobs started');

    const PORT = config.server.port || 3000;
    app.listen(PORT, () => {
      logger.info(`HealthSync MicroMoment server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;