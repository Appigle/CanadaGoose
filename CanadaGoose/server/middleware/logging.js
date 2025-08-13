const { logger, logHelpers } = require('../config/logger');
const { metrics } = require('../config/cloudwatch');

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestId =
    req.headers['x-request-id'] ||
    `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add request ID to request object
  req.requestId = requestId;

  // Add request ID to response headers
  res.setHeader('x-request-id', requestId);

  // Log request start
  logger.info('Request Started', {
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous',
  });

  // Override res.end to capture response time and log completion
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const responseTime = Date.now() - startTime;

    // Log request completion
    logHelpers.logRequest(req, res, responseTime);

    // Record metrics
    try {
      metrics.recordResponseTime(req.path, req.method, responseTime);
      metrics.recordRequestCount(req.path, req.method, res.statusCode);
      metrics.recordAPICall(req.path);
    } catch (error) {
      logger.error('Failed to record metrics', { error: error.message });
    }

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Error logging middleware
const errorLogger = (error, req, res, next) => {
  const responseTime = Date.now() - (req.startTime || Date.now());

  // Log error with context
  logHelpers.logError(error, {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.id || 'anonymous',
    responseTime: `${responseTime}ms`,
  });

  // Record error metrics
  try {
    metrics.recordError(error.name || 'UnknownError', error.message);
  } catch (metricError) {
    logger.error('Failed to record error metric', {
      error: metricError.message,
    });
  }

  next(error);
};

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  req.startTime = Date.now();

  // Monitor slow requests
  const slowRequestThreshold =
    parseInt(process.env.SLOW_REQUEST_THRESHOLD) || 2000; // 2 seconds

  res.on('finish', () => {
    const responseTime = Date.now() - req.startTime;

    if (responseTime > slowRequestThreshold) {
      logger.warn('Slow Request Detected', {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        responseTime: `${responseTime}ms`,
        threshold: `${slowRequestThreshold}ms`,
      });
    }
  });

  next();
};

// Security logging middleware
const securityLogger = (req, res, next) => {
  // Log potential security issues
  const suspiciousPatterns = [
    /\.\.\//, // Path traversal
    /<script/i, // XSS attempts
    /union\s+select/i, // SQL injection attempts
    /eval\s*\(/i, // Code injection attempts
  ];

  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers,
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      logHelpers.logSecurity('Suspicious Request Pattern', {
        requestId: req.requestId,
        pattern: pattern.source,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });
      break;
    }
  }

  next();
};

module.exports = {
  requestLogger,
  errorLogger,
  performanceMonitor,
  securityLogger,
};
