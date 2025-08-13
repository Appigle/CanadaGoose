const {
  CloudWatchClient,
  PutMetricDataCommand,
} = require('@aws-sdk/client-cloudwatch');
const {
  CloudWatchLogsClient,
  CreateLogGroupCommand,
  CreateLogStreamCommand,
  PutLogEventsCommand,
} = require('@aws-sdk/client-cloudwatch-logs');
const WinstonCloudWatch = require('winston-cloudwatch');

// Configure AWS SDK v3 clients
const cloudwatchClient = new CloudWatchClient({
  region: process.env.AWS_REGION || 'us-east-1',
  // AWS credentials will be automatically loaded from EC2 instance profile
});

const cloudwatchLogsClient = new CloudWatchLogsClient({
  region: process.env.AWS_REGION || 'us-east-1',
  // AWS credentials will be automatically loaded from EC2 instance profile
});

// CloudWatch Logs configuration
const cloudwatchConfig = {
  logGroupName: `/canadagoose/${
    process.env.NODE_ENV === 'production' ? 'prod' : 'dev'
  }/app`,
  logStreamName: `${
    process.env.NODE_ENV === 'production' ? 'prod' : 'dev'
  }-${Date.now()}`,
  region: process.env.AWS_REGION || 'us-east-1',
  messageFormatter: (item) => {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level: item.level,
      message: item.message,
      environment: process.env.NODE_ENV || 'dev',
      service: 'backend',
      ...item.meta,
    });
  },
};

// Create CloudWatch transport
const createCloudWatchTransport = () => {
  console.log('🔍 CloudWatch Transport Creation Check:', {
    NODE_ENV: process.env.NODE_ENV,
    ENABLE_CLOUDWATCH_LOGGING: process.env.ENABLE_CLOUDWATCH_LOGGING,
    AWS_REGION: process.env.AWS_REGION,
    logGroupName: cloudwatchConfig.logGroupName,
    logStreamName: cloudwatchConfig.logStreamName,
  });

  // Only create transport if we're in production and CloudWatch is enabled
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_CLOUDWATCH_LOGGING !== 'true'
  ) {
    console.log('📝 CloudWatch transport disabled:', {
      reason:
        process.env.NODE_ENV !== 'production'
          ? 'Not in production'
          : 'CloudWatch logging not enabled',
      NODE_ENV: process.env.NODE_ENV,
      ENABLE_CLOUDWATCH_LOGGING: process.env.ENABLE_CLOUDWATCH_LOGGING,
    });
    return null;
  }

  try {
    console.log(
      '🔧 Creating CloudWatch transport with config:',
      cloudwatchConfig
    );
    const transport = new WinstonCloudWatch(cloudwatchConfig);

    // Add event listeners for debugging
    transport.on('error', (error) => {
      console.error('❌ CloudWatch transport error:', error);
    });

    transport.on('logged', (info) => {
      console.log('✅ Log successfully sent to CloudWatch:', {
        level: info.level,
        message: info.message,
        timestamp: info.timestamp,
      });
    });

    console.log('✅ CloudWatch transport created successfully');
    return transport;
  } catch (error) {
    console.error('❌ Failed to create CloudWatch transport:', {
      error: error.message,
      stack: error.stack,
      config: cloudwatchConfig,
    });
    return null;
  }
};

// CloudWatch Metrics configuration
const putMetric = async (
  metricName,
  value,
  unit = 'Count',
  dimensions = []
) => {
  // Only send metrics in production and when CloudWatch is enabled
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_CLOUDWATCH_LOGGING !== 'true'
  ) {
    console.log(
      `📊 Metric ${metricName} skipped (not in production or CloudWatch disabled)`,
      {
        NODE_ENV: process.env.NODE_ENV,
        ENABLE_CLOUDWATCH_LOGGING: process.env.ENABLE_CLOUDWATCH_LOGGING,
      }
    );
    return;
  }

  try {
    const params = {
      Namespace: `canadagoose/${
        process.env.NODE_ENV === 'production' ? 'prod' : 'dev'
      }`,
      MetricData: [
        {
          MetricName: metricName,
          Value: value,
          Unit: unit,
          Dimensions: [
            {
              Name: 'Environment',
              Value: process.env.NODE_ENV || 'dev',
            },
            ...dimensions,
          ],
          Timestamp: new Date(),
        },
      ],
    };

    console.log(`📊 Sending metric to CloudWatch:`, {
      metricName,
      value,
      unit,
      namespace: params.Namespace,
      dimensions,
    });

    const command = new PutMetricDataCommand(params);
    await cloudwatchClient.send(command);

    console.log(`✅ Metric ${metricName} sent successfully to CloudWatch`);
  } catch (error) {
    console.error(`❌ Failed to put metric ${metricName}:`, {
      error: error.message,
      stack: error.stack,
      metricName,
      value,
      unit,
      dimensions,
    });
  }
};

// Helper functions for common metrics
const metrics = {
  // API Performance
  recordResponseTime: (path, method, responseTime) => {
    putMetric('APIResponseTime', responseTime, 'Milliseconds', [
      { Name: 'Path', Value: path },
      { Name: 'Method', Value: method },
    ]);
  },

  recordRequestCount: (path, method, statusCode) => {
    putMetric('RequestCount', 1, 'Count', [
      { Name: 'Path', Value: path },
      { Name: 'Method', Value: method },
      { Name: 'StatusCode', Value: statusCode.toString() },
    ]);
  },

  // Error Tracking
  recordError: (errorType, errorMessage) => {
    putMetric('ErrorCount', 1, 'Count', [
      { Name: 'ErrorType', Value: errorType },
    ]);
  },

  recordAuthFailure: (reason) => {
    putMetric('AuthenticationFailures', 1, 'Count', [
      { Name: 'Reason', Value: reason },
    ]);
  },

  recordDatabaseError: (operation, errorCode) => {
    putMetric('DatabaseErrors', 1, 'Count', [
      { Name: 'Operation', Value: operation },
      { Name: 'ErrorCode', Value: errorCode },
    ]);
  },

  // Business Metrics
  recordUserRegistration: () => {
    putMetric('UserRegistrations', 1, 'Count');
  },

  recordUserLogin: (success) => {
    putMetric('UserLogins', 1, 'Count', [
      { Name: 'Success', Value: success ? 'true' : 'false' },
    ]);
  },

  recordAPICall: (endpoint) => {
    putMetric('APICalls', 1, 'Count', [{ Name: 'Endpoint', Value: endpoint }]);
  },
};

module.exports = {
  createCloudWatchTransport,
  metrics,
  cloudwatchClient,
  cloudwatchLogsClient,
  putMetric,
};
