#!/usr/bin/env node

/**
 * CloudWatch Debug Script
 * Tests CloudWatch connectivity, log uploads, and metrics
 */

require('dotenv').config();
const {
  createCloudWatchTransport,
  metrics,
  cloudwatchClient,
  cloudwatchLogsClient,
} = require('./config/cloudwatch');
const { logger } = require('./config/logger');

// Test configuration
const TEST_CONFIG = {
  testLogGroup: `/canadagoose/${
    process.env.NODE_ENV === 'production' ? 'prod' : 'dev'
  }/app`,
  testMetricNamespace: `canadagoose/${
    process.env.NODE_ENV === 'production' ? 'prod' : 'dev'
  }`,
  region: process.env.AWS_REGION || 'us-east-1',
};

async function checkEnvironment() {
  console.log('🔍 Environment Check');
  console.log('==================');

  const env = {
    NODE_ENV: process.env.NODE_ENV,
    ENABLE_CLOUDWATCH_LOGGING: process.env.ENABLE_CLOUDWATCH_LOGGING,
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? '***SET***' : 'NOT SET',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY
      ? '***SET***'
      : 'NOT SET',
  };

  console.table(env);

  // Check if CloudWatch is enabled
  const isEnabled =
    process.env.NODE_ENV === 'production' &&
    process.env.ENABLE_CLOUDWATCH_LOGGING === 'true';
  console.log(`CloudWatch Logging Enabled: ${isEnabled ? '✅ YES' : '❌ NO'}`);

  if (!isEnabled) {
    console.log('\n💡 To enable CloudWatch logging:');
    console.log('   export NODE_ENV=production');
    console.log('   export ENABLE_CLOUDWATCH_LOGGING=true');
  }

  return isEnabled;
}

async function testAWSCredentials() {
  console.log('\n🔐 AWS Credentials Test');
  console.log('=======================');

  try {
    // Test CloudWatch access
    const { ListMetricsCommand } = require('@aws-sdk/client-cloudwatch');
    const listCommand = new ListMetricsCommand({
      Namespace: TEST_CONFIG.testMetricNamespace,
      MaxRecords: 1,
    });

    await cloudwatchClient.send(listCommand);
    console.log('✅ CloudWatch credentials valid');

    // Test CloudWatch Logs access
    const {
      DescribeLogGroupsCommand,
    } = require('@aws-sdk/client-cloudwatch-logs');
    const describeCommand = new DescribeLogGroupsCommand({
      logGroupNamePrefix: TEST_CONFIG.testLogGroup,
      limit: 1,
    });

    await cloudwatchLogsClient.send(describeCommand);
    console.log('✅ CloudWatch Logs credentials valid');

    return true;
  } catch (error) {
    console.error('❌ AWS Credentials Error:', {
      error: error.name,
      message: error.message,
      code: error.$metadata?.httpStatusCode,
    });

    if (error.name === 'CredentialsProviderError') {
      console.log('\n💡 Credential troubleshooting:');
      console.log('   1. Check EC2 instance IAM role permissions');
      console.log('   2. Verify AWS_REGION environment variable');
      console.log('   3. Test AWS CLI: aws sts get-caller-identity');
    }

    return false;
  }
}

async function testLogGroupExists() {
  console.log('\n📋 Log Group Check');
  console.log('==================');

  try {
    const {
      DescribeLogGroupsCommand,
    } = require('@aws-sdk/client-cloudwatch-logs');
    const command = new DescribeLogGroupsCommand({
      logGroupNamePrefix: TEST_CONFIG.testLogGroup,
    });

    const response = await cloudwatchLogsClient.send(command);
    const logGroup = response.logGroups?.find(
      (lg) => lg.logGroupName === TEST_CONFIG.testLogGroup
    );

    if (logGroup) {
      console.log('✅ Log group exists:', TEST_CONFIG.testLogGroup);
      console.log('   Retention:', logGroup.retentionInDays || 'Never expire');
      console.log('   Created:', new Date(logGroup.creationTime));
      return true;
    } else {
      console.log('⚠️  Log group does not exist:', TEST_CONFIG.testLogGroup);
      console.log('   Will be created automatically when first log is sent');
      return false;
    }
  } catch (error) {
    console.error('❌ Log group check failed:', error.message);
    return false;
  }
}

async function testCloudWatchTransport() {
  console.log('\n🚀 CloudWatch Transport Test');
  console.log('============================');

  try {
    const transport = createCloudWatchTransport();

    if (!transport) {
      console.log(
        '❌ CloudWatch transport not created (likely due to environment)'
      );
      return false;
    }

    console.log('✅ CloudWatch transport created successfully');

    // Test sending a log
    console.log('📤 Testing log upload...');

    return new Promise((resolve) => {
      let resolved = false;

      // Set up event listeners
      const onLogged = (info) => {
        if (!resolved) {
          console.log('✅ Test log successfully uploaded to CloudWatch');
          resolved = true;
          resolve(true);
        }
      };

      const onError = (error) => {
        if (!resolved) {
          console.error('❌ Test log upload failed:', error);
          resolved = true;
          resolve(false);
        }
      };

      transport.once('logged', onLogged);
      transport.once('error', onError);

      // Send test log
      transport.log(
        {
          level: 'info',
          message: 'CloudWatch debug test log',
          timestamp: new Date().toISOString(),
          service: 'cloudwatch-debug',
          test: true,
        },
        () => {
          console.log('📤 Test log sent to transport');
        }
      );

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!resolved) {
          console.log('⏰ Test log upload timeout (30s)');
          resolved = true;
          resolve(false);
        }
      }, 30000);
    });
  } catch (error) {
    console.error('❌ CloudWatch transport test failed:', error);
    return false;
  }
}

async function testMetricsUpload() {
  console.log('\n📊 Metrics Upload Test');
  console.log('======================');

  try {
    console.log('📤 Sending test metric...');

    await metrics.recordError(
      'CloudWatchDebugTest',
      'Test error from debug script'
    );
    console.log('✅ Test metric sent successfully');

    // Test custom metric
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('📤 Sending custom test metric...');
    const { putMetric } = require('./config/cloudwatch');
    await putMetric('DebugTestMetric', 1, 'Count', [
      { Name: 'TestType', Value: 'Debug' },
    ]);

    console.log('✅ Custom test metric sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Metrics upload test failed:', error);
    return false;
  }
}

async function testLoggerIntegration() {
  console.log('\n🔧 Logger Integration Test');
  console.log('==========================');

  try {
    console.log('📤 Testing logger with CloudWatch...');

    // Test different log levels
    logger.info('CloudWatch debug test - INFO level', {
      test: true,
      level: 'info',
      timestamp: new Date().toISOString(),
    });

    logger.warn('CloudWatch debug test - WARN level', {
      test: true,
      level: 'warn',
      warning: 'This is a test warning',
    });

    logger.error('CloudWatch debug test - ERROR level', {
      test: true,
      level: 'error',
      error: 'This is a test error',
      stack: 'Test stack trace',
    });

    console.log('✅ Test logs sent through logger');
    console.log('⏳ Check CloudWatch Logs console for these test logs');

    return true;
  } catch (error) {
    console.error('❌ Logger integration test failed:', error);
    return false;
  }
}

async function main() {
  console.log('🧪 CloudWatch Debug Script');
  console.log('===========================\n');

  const results = {
    environment: false,
    credentials: false,
    logGroup: false,
    transport: false,
    metrics: false,
    logger: false,
  };

  // Run all tests
  results.environment = await checkEnvironment();

  if (results.environment) {
    results.credentials = await testAWSCredentials();

    if (results.credentials) {
      results.logGroup = await testLogGroupExists();
      results.transport = await testCloudWatchTransport();
      results.metrics = await testMetricsUpload();
      results.logger = await testLoggerIntegration();
    }
  }

  // Summary
  console.log('\n📋 Test Summary');
  console.log('================');
  console.table(results);

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  console.log(`\n🎯 ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log(
      '✅ All CloudWatch tests passed! Your setup is working correctly.'
    );
  } else {
    console.log(
      '❌ Some tests failed. Check the output above for troubleshooting steps.'
    );
  }

  console.log('\n💡 Next steps:');
  console.log(
    '   1. Check CloudWatch Logs console: https://console.aws.amazon.com/cloudwatch/home?region=' +
      TEST_CONFIG.region +
      '#logsV2:log-groups'
  );
  console.log(
    '   2. Check CloudWatch Metrics console: https://console.aws.amazon.com/cloudwatch/home?region=' +
      TEST_CONFIG.region +
      '#metricsV2:'
  );
  console.log('   3. Monitor your application logs in production');
}

// Run the debug script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  checkEnvironment,
  testAWSCredentials,
  testLogGroupExists,
  testCloudWatchTransport,
  testMetricsUpload,
  testLoggerIntegration,
};
