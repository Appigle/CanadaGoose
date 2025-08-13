# CloudWatch Debug Guide - Log Upload Process

## Overview

This guide helps debug the CloudWatch upload process when the backend server receives frontend logs.

## Log Group Naming Convention

The CloudWatch log groups and metrics namespaces use a simplified naming scheme:

- **Production**: `NODE_ENV=production` → `/canadagoose/prod/app` and `canadagoose/prod`
- **Development**: `NODE_ENV=development` → `/canadagoose/dev/app` and `canadagoose/dev`

This makes the log group names shorter and more consistent across environments.

## Quick Debug Steps

### 1. Run the Debug Script

```bash
cd CanadaGoose/server
node debug-cloudwatch.js
```

This comprehensive script will test all aspects of your CloudWatch setup.

### 2. Check Environment Variables

CloudWatch logging requires specific environment variables:

```bash
# Required for CloudWatch to be enabled
export NODE_ENV=production
export ENABLE_CLOUDWATCH_LOGGING=true

# AWS Configuration (handled by EC2 IAM role in production)
export AWS_REGION=us-east-1

# Optional: for local testing with AWS credentials
export AWS_ACCESS_KEY_ID=your_key_id
export AWS_SECRET_ACCESS_KEY=your_secret_key
```

### 3. Verify Current Server Environment

Check what environment the server is running in:

```bash
curl https://s25cicd.xiaopotato.top/api/logs/health
```

Look for the logging environment information in server logs.

## Debugging Process Flow

### Step 1: Environment Check

The CloudWatch transport is only created when:

- `NODE_ENV=production`
- `ENABLE_CLOUDWATCH_LOGGING=true`

**Debug**: Check server startup logs for:

```
🔍 Logging Service Environment: {
  NODE_ENV: 'production',
  ENABLE_CLOUDWATCH_LOGGING: 'true'
}
✅ CloudWatch transport added
```

If you see:

```
📝 Development mode: CloudWatch transport disabled
```

Then environment variables need to be set.

### Step 2: AWS Credentials Check

CloudWatch requires valid AWS credentials with permissions:

**Required IAM permissions:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:*:*:log-group:/canadagoose/*"
    },
    {
      "Effect": "Allow",
      "Action": ["cloudwatch:PutMetricData", "cloudwatch:ListMetrics"],
      "Resource": "*"
    }
  ]
}
```

**Debug**: Look for AWS credential errors in logs:

```
❌ AWS Credentials Error: {
  error: 'CredentialsProviderError',
  message: 'Could not load credentials from any providers'
}
```

### Step 3: CloudWatch Transport Creation

When a valid transport is created, you'll see:

```
🔧 Creating CloudWatch transport with config: {
  logGroupName: '/canadagoose/prod/app',
  logStreamName: 'prod-1736628600000',
  region: 'us-east-1'
}
✅ CloudWatch transport created successfully
```

**Debug**: Check for transport creation errors:

```
❌ Failed to create CloudWatch transport: {
  error: 'Error message',
  stack: '...',
  config: {...}
}
```

### Step 4: Log Upload Process

When frontend logs are received and uploaded to CloudWatch:

**Successful upload:**

```
[info]: Frontend Info {
  "level": "info",
  "message": "Manual Navigation",
  "source": "frontend",
  "backendTimestamp": "2025-01-11T20:30:00.000Z",
  ...
}
✅ Log successfully sent to CloudWatch: {
  level: 'info',
  message: 'Frontend Info',
  timestamp: '2025-01-11T20:30:00.000Z'
}
```

**Failed upload:**

```
❌ CloudWatch transport error: Error: Failed to upload log
```

### Step 5: Metrics Upload

Metrics are sent alongside logs:

```
📊 Sending metric to CloudWatch: {
  metricName: 'FrontendError',
  value: 1,
  unit: 'Count',
  namespace: 'canadagoose/production',
  dimensions: [...]
}
✅ Metric FrontendError sent successfully to CloudWatch
```

## Common Issues & Solutions

### Issue 1: Environment Not Set

**Symptoms**: Logs show "Development mode: CloudWatch transport disabled"
**Solution**:

```bash
export NODE_ENV=production
export ENABLE_CLOUDWATCH_LOGGING=true
# Restart the server
```

### Issue 2: AWS Credentials Missing

**Symptoms**: "CredentialsProviderError" or "Access Denied"
**Solutions**:

1. **EC2 Instance**: Attach IAM role with CloudWatch permissions
2. **Local Testing**: Set AWS credentials in environment
3. **Check AWS CLI**: `aws sts get-caller-identity`

### Issue 3: Log Group Permissions

**Symptoms**: "AccessDeniedException" when creating log streams
**Solution**: Ensure IAM role has `logs:CreateLogGroup` and `logs:CreateLogStream` permissions

### Issue 4: Network Connectivity

**Symptoms**: Timeout errors or connection refused
**Solution**:

1. Check security groups allow outbound HTTPS (443) to AWS
2. Verify VPC has internet gateway or NAT gateway
3. Test: `curl -I https://logs.us-east-1.amazonaws.com`

### Issue 5: Log Upload Timeout

**Symptoms**: "Test log upload timeout (30s)"
**Solutions**:

1. Check CloudWatch service health
2. Verify network connectivity to AWS
3. Check for rate limiting

### Issue 6: Missing Dependencies

**Symptoms**: Module not found errors
**Solution**: Ensure all AWS SDK dependencies are installed:

```bash
npm install @aws-sdk/client-cloudwatch @aws-sdk/client-cloudwatch-logs winston-cloudwatch
```

### Issue 7: Log Group Does Not Exist

**Symptoms**: `ResourceNotFoundException: The specified log group does not exist`
**Solution**: The log group will be created automatically when the first log is sent, but you can also create it manually:

```bash
# For production
aws logs create-log-group --log-group-name "/canadagoose/prod/app" --region us-east-1

# For development
aws logs create-log-group --log-group-name "/canadagoose/dev/app" --region us-east-1
```

**Note**: The log group naming convention is:

- Production: `/canadagoose/prod/app`
- Development: `/canadagoose/dev/app`

## Manual Testing

### Test Frontend Log Upload

Send a test log from your browser's console:

```javascript
fetch('/api/logs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    level: 'info',
    message: 'Manual test log',
    timestamp: new Date().toISOString(),
    component: 'ManualTest',
    metadata: { test: true },
  }),
});
```

### Check CloudWatch Console

1. **Logs**: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups
2. **Metrics**: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#metricsV2:

Look for:

- Log Group: `/canadagoose/prod/app` (production) or `/canadagoose/dev/app` (development)
- Namespace: `canadagoose/prod` (production) or `canadagoose/dev` (development)

### Test with curl

```bash
# Test the logging endpoint
curl -X POST https://s25cicd.xiaopotato.top/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "level": "info",
    "message": "CloudWatch test log",
    "timestamp": "'$(date -Iseconds)'",
    "component": "CurlTest",
    "metadata": {"test": true}
  }'
```

## Monitoring Setup

### CloudWatch Alarms

Set up alarms for:

1. High error rates: `FrontendError > 10/minute`
2. Log ingestion failures
3. Missing log streams

### Log Insights Queries

Useful queries for debugging:

```sql
-- Find all frontend errors
fields @timestamp, message, error
| filter source = "frontend" and level = "error"
| sort @timestamp desc

-- Find logs from specific component
fields @timestamp, message, metadata
| filter component = "NavigationMonitor"
| sort @timestamp desc

-- Performance issues
fields @timestamp, message, metadata.duration
| filter type = "performance" and metadata.duration > 1000
| sort @timestamp desc
```

### Log Group and Namespace Mapping

When setting up CloudWatch alarms and dashboards, use these naming conventions:

- **Production Environment**:

  - Log Group: `/canadagoose/prod/app`
  - Metrics Namespace: `canadagoose/prod`
  - Log Streams: `prod-{timestamp}`

- **Development Environment**:
  - Log Group: `/canadagoose/dev/app`
  - Metrics Namespace: `canadagoose/dev`
  - Log Streams: `dev-{timestamp}`

## Debug Commands

### Check Current Configuration

```bash
# On the server
echo "NODE_ENV: $NODE_ENV"
echo "ENABLE_CLOUDWATCH_LOGGING: $ENABLE_CLOUDWATCH_LOGGING"
echo "AWS_REGION: $AWS_REGION"

# Test AWS credentials
aws sts get-caller-identity
```

### Real-time Log Monitoring

```bash
# Watch server logs
tail -f /var/log/canadagoose/server.log

# Or with PM2
pm2 logs canadagoose-backend
```

### Network Debugging

```bash
# Test CloudWatch connectivity
curl -I https://logs.us-east-1.amazonaws.com
curl -I https://monitoring.us-east-1.amazonaws.com

# Check DNS resolution
nslookup logs.us-east-1.amazonaws.com
```

## Files Modified for Debugging

- `config/cloudwatch.js` - Added comprehensive debug logging
- `config/logger.js` - Enhanced transport creation logging
- `debug-cloudwatch.js` - Comprehensive test script
- `routes/logs.js` - Better error handling and context

## Production Monitoring

Once CloudWatch is working, monitor:

1. **Log ingestion rate** - Should match your application activity
2. **Error rates** - Set up alerts for spikes
3. **Performance metrics** - Track response times and user interactions
4. **Cost** - CloudWatch charges per log ingestion and storage

The enhanced debugging should help you identify exactly where the CloudWatch upload process is failing.
