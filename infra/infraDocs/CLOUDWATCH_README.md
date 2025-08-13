# CloudWatch Monitoring Implementation for CanadaGoose

This document describes the AWS CloudWatch monitoring setup for the CanadaGoose application, including logging, metrics, alarms, and dashboards.

## Overview

The CloudWatch implementation provides comprehensive monitoring for:

- **EC2 Instance**: CPU, Memory, Disk, Network metrics
- **RDS Database**: Performance and storage metrics
- **Application Logs**: Structured logging with metric extraction
- **Custom Metrics**: API response times, error rates, user activity
- **Automated Alerts**: Proactive monitoring with configurable thresholds

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Application   │───▶│  CloudWatch      │───▶│   Alarms &      │
│   (EC2 + RDS)  │    │  Logs & Metrics  │    │   Dashboards    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Resources Created

### 1. CloudWatch Log Groups

- **`/canadagoose/{environment}/app`** - Application logs (14 days retention)
- **`/canadagoose/{environment}/access`** - API access logs (14 days retention)
- **`/canadagoose/{environment}/errors`** - Error logs (30 days retention)
- **`/canadagoose/{environment}/database`** - Database logs (14 days retention)

### 2. CloudWatch Dashboard

- **EC2 Instance Metrics**: CPU, Network, Disk I/O
- **RDS Database Metrics**: CPU, Memory, Storage, Connections
- **Application Performance**: Response times, Request counts, Error rates
- **Error Monitoring**: Authentication failures, Database errors

### 3. CloudWatch Alarms

- **EC2 CPU High**: >80% for 2 evaluation periods
- **EC2 Memory High**: >85% for 2 evaluation periods
- **RDS CPU High**: >80% for 2 evaluation periods
- **RDS Storage Low**: <1GB free space
- **App Error Rate**: >10 errors per 5 minutes
- **API Response Time**: >2 seconds average

### 4. Log Metric Filters

- **Error Count**: Extracts error occurrences from logs
- **Authentication Failures**: Tracks failed login attempts
- **Database Errors**: Monitors database connection issues
- **API Requests**: Counts API calls
- **Response Times**: Measures API performance

## Deployment

### Quick Deployment

```bash
cd infra
./deploy-cloudwatch.sh
```

### Manual Deployment

```bash
cd infra

# Validate configuration
terraform validate

# Plan deployment
terraform plan

# Apply changes
terraform apply
```

### Targeted Deployment (CloudWatch only)

```bash
terraform apply -target=aws_cloudwatch_log_group.app_logs \
                -target=aws_cloudwatch_dashboard.main \
                -target=aws_cloudwatch_metric_alarm.ec2_cpu_high
```

## Configuration

### Environment Variables

The CloudWatch resources automatically use your Terraform variables:

- `var.environment` - Determines log group names and resource tagging
- `var.project_name` - Used for resource naming
- `var.aws_region` - Sets the AWS region for all resources

### Customization

You can modify the configuration by editing `cloudwatch.tf`:

1. **Alarm Thresholds**: Adjust threshold values in alarm resources
2. **Retention Periods**: Modify log group retention settings
3. **Dashboard Layout**: Customize dashboard widgets and metrics
4. **Metric Filters**: Update log parsing patterns

## Usage

### Viewing Logs

1. Go to AWS CloudWatch Console
2. Navigate to Logs → Log groups
3. Select the appropriate log group
4. View real-time logs or search historical data

### Monitoring Dashboard

1. Access the dashboard URL from Terraform outputs
2. View real-time metrics and trends
3. Customize widget layout as needed
4. Set up additional metrics

### Managing Alarms

1. Go to CloudWatch → Alarms
2. View alarm status and history
3. Modify thresholds or actions
4. Set up SNS notifications (optional)

## Integration with Application

### Backend (Node.js)

To send logs to CloudWatch, update your Express.js application:

```javascript
const AWS = require('aws-sdk');
const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');

// Configure CloudWatch transport
const cloudwatchTransport = new WinstonCloudWatch({
  logGroupName: `/canadagoose/${process.env.NODE_ENV}/app`,
  logStreamName: `${process.env.NODE_ENV}-${Date.now()}`,
  region: process.env.AWS_REGION,
});

// Create logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console(), cloudwatchTransport],
});

// Use logger instead of console.log
logger.info('Application started', {
  environment: process.env.NODE_ENV,
  timestamp: new Date().toISOString(),
});
```

### Frontend (Vue.js)

For client-side error tracking:

```javascript
// Error boundary component
export default {
  name: 'ErrorBoundary',
  errorCaptured(err, vm, info) {
    // Send error to CloudWatch via backend API
    this.$http.post('/api/logs/error', {
      error: err.message,
      component: vm.$options.name,
      info: info,
      timestamp: new Date().toISOString(),
    });
  },
};
```

## Monitoring Best Practices

### 1. Log Structure

Use structured JSON logging for better metric extraction:

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "ERROR",
  "message": "Database connection failed",
  "error_code": "DB_CONN_001",
  "user_id": "12345",
  "request_id": "req-abc-123",
  "environment": "production"
}
```

### 2. Metric Naming

Follow consistent naming conventions:

- Use PascalCase for metric names
- Include environment in namespace
- Group related metrics together

### 3. Alarm Management

- Set appropriate thresholds based on baseline performance
- Use multiple evaluation periods to avoid false positives
- Implement escalation procedures for critical alarms

### 4. Cost Optimization

- Set appropriate log retention periods
- Use metric filters to reduce log volume
- Monitor CloudWatch costs regularly

## Troubleshooting

### Common Issues

1. **Logs Not Appearing**

   - Check IAM permissions for CloudWatch Logs
   - Verify log group names match application configuration
   - Ensure AWS credentials are properly configured

2. **Metrics Not Updating**

   - Verify metric namespace matches alarm configuration
   - Check that custom metrics are being sent
   - Ensure proper dimensions are set

3. **Alarms Not Triggering**
   - Verify alarm thresholds are appropriate
   - Check metric data availability
   - Review alarm evaluation periods

### Debug Commands

```bash
# Check CloudWatch log groups
aws logs describe-log-groups --log-group-name-prefix "/canadagoose/"

# View recent log events
aws logs filter-log-events --log-group-name "/canadagoose/dev/app" --start-time $(date -d '1 hour ago' +%s)000

# Check metric data
aws cloudwatch get-metric-data --namespace "canadagoose/dev" --metric-name "ErrorRate"
```

## Security Considerations

- IAM policies follow least privilege principle
- Log groups are private by default
- Sensitive data should not be logged
- Consider encryption for sensitive logs

## Cost Estimation

Typical monthly costs for this setup:

- **Log Storage**: $0.50 per GB ingested + $0.03 per GB stored
- **Metrics**: $0.30 per metric per month
- **Alarms**: $0.10 per alarm metric per month
- **Dashboard**: Free

## Next Steps

1. **Deploy CloudWatch resources** using the provided script
2. **Update application code** to send logs to CloudWatch
3. **Test monitoring** by generating load and errors
4. **Set up SNS notifications** for critical alarms
5. **Customize dashboards** based on your needs
6. **Implement additional metrics** for business KPIs

## Support

For issues or questions:

1. Check CloudWatch console for error messages
2. Review IAM permissions and policies
3. Verify application configuration
4. Check Terraform state and outputs

---

**Note**: This implementation provides essential monitoring capabilities. Consider adding SNS notifications, custom dashboards, and additional metrics based on your specific requirements.
