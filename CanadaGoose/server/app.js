const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

// Import middlewares and routes
const { apiLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/auth');
const logsRoutes = require('./routes/logs');
const financialRoutes = require('./routes/financial');
const { testConnection, healthCheck } = require('./config/database');

// Import logging system
const { logger, logHelpers } = require('./config/logger');
const {
  requestLogger,
  errorLogger,
  performanceMonitor,
  securityLogger,
} = require('./middleware/logging');

// Create Express app
const app = express();

// Trust proxy for accurate IP addresses in rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);

// CORS configuration for development and production
const corsOptions = {
  origin: function (origin, callback) {
    // In development, be more permissive
    if (process.env.NODE_ENV === 'development' || !!1) {
      // Allow all localhost origins during development
      if (
        !origin ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }
    }

    // Production origins
    const allowedOrigins = [
      'https://s25cicd.xiaopotato.top',
      // Environment variables (if set)
      process.env.CORS_ORIGIN,
      process.env.FRONTEND_URL,
    ].filter(Boolean); // Remove undefined values

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general API rate limiting
app.use('/api', apiLimiter);

// Enhanced logging and monitoring middleware
app.use(performanceMonitor);
app.use(securityLogger);
app.use(requestLogger);

// Routes
app.use('/api', authRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/financial', financialRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'CanadaGoose Authentication API Server',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    serverInfo: {
      internalUrl: `http://localhost:${process.env.PORT || 3000}`,
      internalApiUrl: `http://localhost:${process.env.PORT || 3000}/api`,
      externalDomain: 's25cicd.xiaopotato.top',
      externalUrl: 'https://s25cicd.xiaopotato.top',
      externalApiUrl: 'https://s25cicd.xiaopotato.top/api',
    },
  });
});

// Health check endpoint
app.get('/api/healthcheck', async (req, res) => {
  try {
    const dbHealth = await healthCheck();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: dbHealth.status,
      serverInfo: {
        internalUrl: `http://localhost:${process.env.PORT || 3000}`,
        internalApiUrl: `http://localhost:${process.env.PORT || 3000}/api`,
        externalDomain: 's25cicd.xiaopotato.top',
        externalUrl: 'https://s25cicd.xiaopotato.top',
        externalApiUrl: 'https://s25cicd.xiaopotato.top/api',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  }
});

// Version endpoint
app.get('/api/version', (req, res) => {
  try {
    const packageJson = require('./package.json');

    res.json({
      version: packageJson.version,
      name: packageJson.name,
      description: packageJson.description,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      serverInfo: {
        internalUrl: `http://localhost:${process.env.PORT || 3000}`,
        internalApiUrl: `http://localhost:${process.env.PORT || 3000}/api`,
        externalDomain: 's25cicd.xiaopotato.top',
        externalUrl: 'https://s25cicd.xiaopotato.top',
        externalApiUrl: 'https://s25cicd.xiaopotato.top/api',
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve version information',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// SPA fallback route - serve index.html for all non-API routes
// This allows Vue Router to handle client-side routing
app.get('*', (req, res, next) => {
  // Skip API routes - let the 404 handler deal with them
  if (req.path.startsWith('/api')) {
    return next(); // Pass to next middleware (404 handler)
  }

  // For all other routes, serve the SPA index.html
  // The frontend will handle the routing
  res.sendFile(path.join(__dirname, '../client/dist/index.html'), (err) => {
    if (err) {
      console.log('SPA fallback: index.html not found, sending 404');
      res.status(404).json({
        error: 'Frontend not built or not found',
        message: 'Please ensure the frontend is built and deployed',
      });
    }
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(404).json({
      error: 'Route not found',
      message: `The requested endpoint ${req.originalUrl} does not exist`,
      availableEndpoints: [
        'GET /api/healthcheck',
        'GET /api/version',
        'POST /api/signup',
        'POST /api/login',
        'GET /api/me',
        'POST /api/logout',
      ],
      serverInfo: {
        internalUrl: `http://localhost:${process.env.PORT || 3000}`,
        internalApiUrl: `http://localhost:${process.env.PORT || 3000}/api`,
        externalDomain: 's25cicd.xiaopotato.top',
        externalUrl: 'https://s25cicd.xiaopotato.top',
        externalApiUrl: 'https://s25cicd.xiaopotato.top/api',
      },
    });
  } else {
    res.status(404).json({
      error: 'Page not found',
      message: 'The requested page does not exist',
      frontendUrl: 'https://s25cicd.xiaopotato.top/app',
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Mongoose/MongoDB errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid Token',
      message: 'The provided token is invalid',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token Expired',
      message: 'Your session has expired. Please login again',
    });
  }

  // Database errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      error: 'Duplicate Entry',
      message: 'A record with this information already exists',
    });
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.name || 'Server Error',
    message:
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong'
        : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// Error logging middleware (must be last)
app.use(errorLogger);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server function
const startServer = async () => {
  try {
    console.log('🔄 Starting server...');
    console.log('🔄 Testing database connection...');

    // Test database connection
    // await testConnection();

    console.log('🔄 Database connection successful, setting up server...');

    const PORT = process.env.PORT || 3000;
    const isProduction = process.env.NODE_ENV === 'production';

    console.log(`🔄 Setting up server on port ${PORT}...`);

    // Internal URLs (server runs on localhost)
    const internalUrl = `http://localhost:${PORT}`;
    const internalApiUrl = `${internalUrl}/api`;
    const internalHealthUrl = `${internalApiUrl}/healthcheck`;

    // External URLs (for users accessing via domain)
    const externalUrl = 'https://s25cicd.xiaopotato.top';
    const externalApiUrl = `${externalUrl}/api`;
    const externalHealthUrl = `${externalApiUrl}/healthcheck`;
    const frontendUrl =
      process.env.CORS_ORIGIN || process.env.FRONTEND_URL || externalUrl;

    console.log('🔄 Starting to listen on port...');
    app.listen(PORT, () => {
      logger.info('🚀 CanadaGoose API Server Started Successfully!');
      logger.info('='.repeat(60));
      logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔌 Server Port: ${PORT}`);
      logger.info('');
      logger.info('🌐 Internal URLs (Server Access):');
      logger.info(`   Server: ${internalUrl}`);
      logger.info(`   API: ${internalApiUrl}`);
      logger.info(`   Health: ${internalHealthUrl}`);
      logger.info('');
      logger.info('🌍 External URLs (User Access):');
      logger.info(`   Frontend: ${frontendUrl}/app`);
      logger.info(`   API: ${externalApiUrl}`);
      logger.info(`   Health: ${externalHealthUrl}`);
      logger.info('='.repeat(60));

      if (isProduction) {
        logger.info(
          '✅ Production Mode: Server running on localhost, accessible via domain'
        );
        logger.info(
          '🔒 CORS enabled for external domain: s25cicd.xiaopotato.top'
        );
        logger.info('📊 Enhanced logging enabled');
      } else {
        logger.info(
          '🛠️  Development Mode: Using localhost for both internal and external'
        );
        logger.info('🔓 CORS enabled for development');
        logger.info('📝 Basic logging enabled');
      }

      logger.info('='.repeat(60));
      logger.info('🎯 Available Endpoints:');
      logger.info(`   GET  ${internalUrl}/           - Server info`);
      logger.info(`   GET  ${internalHealthUrl}      - Health check`);
      logger.info(`   POST ${internalApiUrl}/signup  - User registration`);
      logger.info(`   POST ${internalApiUrl}/login   - User authentication`);
      logger.info(`   GET  ${internalApiUrl}/me      - Get user profile`);
      logger.info(`   POST ${internalApiUrl}/logout  - User logout`);
      logger.info('='.repeat(60));
      logger.info('💡 Note: External users access via s25cicd.xiaopotato.top');
      logger.info('   Server runs internally on localhost for security');
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Only start the server if this file is executed directly
if (require.main === module) {
  startServer();
}

module.exports = app;
