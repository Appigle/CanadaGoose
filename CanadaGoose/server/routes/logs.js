const express = require('express');
const { logger, logHelpers } = require('../config/logger');
const { metrics } = require('../config/cloudwatch');

const router = express.Router();

// POST /api/logs - Receive frontend logs
router.post('/', async (req, res) => {
  try {
    const logEntry = req.body;

    // Validate log entry
    if (!logEntry.level || !logEntry.message) {
      logger.warn('Invalid frontend log entry received', {
        logEntry,
        requestId: req.requestId,
        ip: req.ip,
      });
      return res.status(400).json({
        error: 'Invalid log entry. Missing required fields: level, message',
      });
    }

    // Validate log level
    const validLevels = ['error', 'warn', 'info', 'debug'];
    if (!validLevels.includes(logEntry.level.toLowerCase())) {
      logger.warn('Invalid log level received from frontend', {
        level: logEntry.level,
        logEntry,
        requestId: req.requestId,
      });
      return res.status(400).json({
        error: `Invalid log level. Must be one of: ${validLevels.join(', ')}`,
      });
    }

    // Add backend context
    const enrichedLog = {
      ...logEntry,
      source: 'frontend',
      backendTimestamp: new Date().toISOString(),
      requestId: req.requestId,
    };

    // Log to CloudWatch based on level
    switch (logEntry.level.toLowerCase()) {
      case 'error':
        logger.error('Frontend Error', enrichedLog);
        // Record error metrics
        try {
          metrics.recordError('FrontendError', logEntry.message);
        } catch (metricsError) {
          logger.warn('Failed to record error metric', {
            error: metricsError.message,
          });
        }
        break;
      case 'warn':
        logger.warn('Frontend Warning', enrichedLog);
        break;
      case 'info':
        logger.info('Frontend Info', enrichedLog);
        break;
      case 'debug':
        logger.debug('Frontend Debug', enrichedLog);
        break;
      default:
        logger.info('Frontend Log', enrichedLog);
    }

    // Record frontend-specific metrics
    try {
      if (logEntry.type === 'api_error') {
        metrics.recordError('FrontendAPIError', logEntry.message);
      } else if (logEntry.type === 'performance') {
        const duration = parseInt(
          logEntry.metadata?.duration?.replace('ms', '') || '0'
        );
        if (duration > 0) {
          metrics.recordResponseTime('FrontendOperation', 'GET', duration);
        }
      } else if (logEntry.type === 'security') {
        metrics.recordError('FrontendSecurityEvent', logEntry.message);
      }
    } catch (metricsError) {
      logger.warn('Failed to record frontend-specific metrics', {
        error: metricsError.message,
        logEntry,
        requestId: req.requestId,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Log received and processed',
    });
  } catch (error) {
    logger.error('Failed to process frontend log', {
      error: error.message,
      stack: error.stack,
      logEntry: req.body,
      requestId: req.requestId,
    });

    res.status(500).json({
      error: 'Internal server error processing log',
    });
  }
});

// GET /api/logs/health - Logging system health check
router.get('/health', (req, res) => {
  try {
    // Test logging functionality
    logger.info('Logging system health check', {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      requestId: req.requestId,
    });

    res.status(200).json({
      success: true,
      message: 'Logging system is healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    logger.error('Logging system health check failed', {
      error: error.message,
      requestId: req.requestId,
    });

    res.status(500).json({
      success: false,
      message: 'Logging system health check failed',
      error: error.message,
    });
  }
});

module.exports = router;
