const winston = require('winston');
const { createCloudWatchTransport } = require('./cloudwatch');

// Create logger instance
const createLogger = () => {
  const transports = [
    // Console transport for development
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        })
      ),
    }),
  ];

  console.log('🔍 Logging Service Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    ENABLE_CLOUDWATCH_LOGGING: process.env.ENABLE_CLOUDWATCH_LOGGING,
  });

  // Add CloudWatch transport only in production and when explicitly enabled
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.ENABLE_CLOUDWATCH_LOGGING === 'true'
  ) {
    try {
      const cloudwatchTransport = createCloudWatchTransport();
      if (cloudwatchTransport) {
        transports.push(cloudwatchTransport);
        console.log('✅ CloudWatch transport added');
      }
    } catch (error) {
      console.warn('⚠️  CloudWatch transport creation failed:', error.message);
    }
  } else {
    console.log('📝 Development mode: CloudWatch transport disabled');
  }

  // Create logger
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: {
      service: 'canadagoose-backend',
      environment: process.env.NODE_ENV || 'dev',
      version: process.env.npm_package_version || 'unknown',
    },
    transports,
  });

  // Handle uncaught exceptions
  logger.exceptions.handle(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          return `${timestamp} [${level}]: ${message}\n${stack}`;
        })
      ),
    })
  );

  return logger;
};

// Create default logger instance (singleton)
let logger = null;
const getLogger = () => {
  if (!logger) {
    logger = createLogger();
  }
  return logger;
};

// Helper functions for structured logging
const logHelpers = {
  // API Request Logging
  logRequest: (req, res, responseTime) => {
    getLogger().info('API Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id || 'anonymous',
      requestId: req.headers['x-request-id'] || 'unknown',
    });
  },

  // Error Logging
  logError: (error, context = {}) => {
    getLogger().error('Application Error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      ...context,
    });
  },

  // Authentication Logging
  logAuth: (action, success, details = {}) => {
    const level = success ? 'info' : 'warn';
    getLogger().log(level, `Authentication ${action}`, {
      action,
      success,
      ...details,
    });
  },

  // Database Logging
  logDatabase: (operation, success, details = {}) => {
    const level = success ? 'info' : 'error';
    getLogger().log(level, `Database ${operation}`, {
      operation,
      success,
      ...details,
    });
  },

  // Business Logic Logging
  logBusiness: (action, details = {}) => {
    getLogger().info(`Business Action: ${action}`, details);
  },

  // Security Logging
  logSecurity: (event, details = {}) => {
    getLogger().warn(`Security Event: ${event}`, details);
  },
};

module.exports = {
  get logger() {
    return getLogger();
  },
  createLogger,
  logHelpers,
  getLogger,
};
