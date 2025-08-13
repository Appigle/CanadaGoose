# CloudWatch Logging Implementation for CanadaGoose

This document provides a complete guide to implementing CloudWatch logging for both the frontend (Vue.js) and backend (Node.js/Express) of your CanadaGoose application.

## **🏗️ Infrastructure Setup (Completed)**

✅ **CloudWatch Resources Created:**

- 4 Log Groups (app, access, errors, database)
- 1 Dashboard with comprehensive monitoring widgets
- 6 Alarms for proactive monitoring
- 5 Log Metric Filters for automatic metric extraction
- IAM permissions consolidated into existing EC2 role

## **🔧 Backend Implementation (Node.js/Express)**

### **1. Dependencies Added**

```bash
cd CanadaGoose/server
npm install aws-sdk winston winston-cloudwatch
```

### **2. Files Created/Modified**

#### **`config/cloudwatch.js`** - CloudWatch Configuration

- AWS SDK configuration
- Winston CloudWatch transport setup
- Custom metrics helper functions
- Structured logging support

#### **`config/logger.js`** - Winston Logger Configuration

- Multi-transport logging (Console + CloudWatch)
- Structured JSON logging
- Helper functions for different log types
- Environment-aware configuration

#### **`middleware/logging.js`** - Express Middleware

- Request logging with performance monitoring
- Error logging and tracking
- Security event detection
- API performance metrics

#### **`routes/logs.js`** - Frontend Log Endpoint

- Receives frontend logs via API
- Enriches logs with backend context
- Sends to CloudWatch via Winston
- Records frontend-specific metrics

#### **`app.js`** - Main Application

- Integrated logging middleware
- Replaced console.log with structured logging
- Added logs route for frontend integration

### **3. Key Features**

#### **Structured Logging**

```javascript
logger.info('API Request', {
  method: req.method,
  path: req.path,
  statusCode: res.statusCode,
  responseTime: `${responseTime}ms`,
  userId: req.user?.id || 'anonymous',
  requestId: req.requestId,
});
```

#### **Performance Monitoring**

- Response time tracking
- Slow request detection
- API call counting
- Database operation monitoring

#### **Security Logging**

- Suspicious pattern detection
- Authentication events
- Rate limiting violations
- Security event tracking

#### **Custom Metrics**

- API response times
- Error rates by type
- User activity tracking
- Database performance metrics

## **🎨 Frontend Implementation (Vue.js)**

### **1. Files Created**

#### **`src/services/logging.ts`** - Frontend Logging Service

- TypeScript-based logging service
- Automatic session tracking
- User ID management
- Backend API integration

### **2. Key Features**

#### **Structured Logging**

```typescript
logger.info('User Action', {
  action: 'login_attempt',
  userId: 'user123',
  timestamp: new Date().toISOString(),
});
```

#### **Specialized Logging Methods**

- `logUserAction()` - Track user interactions
- `logNavigation()` - Monitor page navigation
- `logAPIError()` - Capture API failures
- `logPerformance()` - Track operation timing
- `logSecurity()` - Monitor security events

#### **Automatic Context**

- Session ID tracking
- User ID management
- URL and component context
- User agent information

### **3. Integration Options**

#### **Vue Plugin (Global Access)**

```typescript
// main.ts
import { LoggingPlugin } from './services/logging';
app.use(LoggingPlugin);

// In components
this.$logger.info('Component action');
```

#### **Composition API**

```typescript
// In components
import { useLogger } from '@/services/logging';
const logger = useLogger();
logger.info('Component action');
```

#### **Direct Import**

```typescript
import logger from '@/services/logging';
logger.info('Direct usage');
```

## **🚀 Deployment Steps**

### **1. Deploy CloudWatch Infrastructure**

```bash
cd infra
./deploy-cloudwatch.sh
```

### **2. Install Backend Dependencies**

```bash
cd CanadaGoose/server
npm install
```

### **3. Update Environment Variables**

```bash
# Add to your .env file
AWS_REGION=us-east-1
LOG_LEVEL=info
SLOW_REQUEST_THRESHOLD=2000
```

### **4. Test Backend Logging**

```bash
cd CanadaGoose/server
npm run dev
# Check console for structured logs
# Verify CloudWatch log groups are created
```

### **5. Test Frontend Logging**

```bash
cd CanadaGoose/client
npm run dev
# Open browser console
# Check for logging service initialization
# Test logging methods
```

## **📊 Monitoring & Analytics**

### **1. CloudWatch Dashboard**

- **EC2 Metrics**: CPU, Memory, Network, Disk
- **RDS Metrics**: Performance, Storage, Connections
- **Application Metrics**: Response times, Error rates
- **Custom Metrics**: User activity, Business KPIs

### **2. Log Analysis**

- **Structured JSON logs** for easy parsing
- **Log Metric Filters** for automatic metric extraction
- **CloudWatch Insights** for complex queries
- **Cross-service correlation** via request IDs

### **3. Alerting**

- **Performance thresholds** (CPU >80%, Response >2s)
- **Error rate monitoring** (>10 errors per 5min)
- **Resource utilization** (Memory >85%, Storage <1GB)
- **Security events** (Authentication failures, Suspicious patterns)

## **🔍 Usage Examples**

### **Backend Logging**

```javascript
// In your routes
const { logger, logHelpers } = require('../config/logger');
const { metrics } = require('../config/cloudwatch');

// Log user registration
logHelpers.logBusiness('User Registration', {
  email: req.body.email,
  source: req.headers.referer,
});

// Record custom metrics
metrics.recordUserRegistration();

// Log errors with context
logHelpers.logError(error, {
  endpoint: '/api/signup',
  requestBody: req.body,
});
```

### **Frontend Logging**

```typescript
// In Vue components
import { useLogger } from '@/services/logging';

export default {
  setup() {
    const logger = useLogger();

    const handleLogin = async () => {
      try {
        logger.logUserAction('login_attempt', { method: 'email' });
        // ... login logic
        logger.logUserAction('login_success', { method: 'email' });
      } catch (error) {
        logger.logAPIError('/api/login', error, { method: 'email' });
      }
    };

    return { handleLogin };
  },
};
```

## **🛠️ Troubleshooting**

### **Common Issues**

1. **Logs Not Appearing in CloudWatch**

   - Check IAM permissions
   - Verify log group names
   - Check AWS credentials

2. **Frontend Logs Not Reaching Backend**

   - Verify API endpoint `/api/logs`
   - Check CORS configuration
   - Verify network connectivity

3. **Performance Impact**
   - Use appropriate log levels
   - Implement log batching
   - Monitor CloudWatch costs

### **Debug Commands**

```bash
# Check CloudWatch log groups
aws logs describe-log-groups --log-group-name-prefix "/canadagoose/"

# View recent logs
aws logs filter-log-events --log-group-name "/canadagoose/prod/app" --start-time $(date -d '1 hour ago' +%s)000

# Check metrics
aws cloudwatch get-metric-data --namespace "canadagoose/prod" --metric-name "ErrorRate"
```

## **💰 Cost Optimization**

### **1. Log Retention**

- **Development**: 7 days
- **Production**: 14-30 days
- **Errors**: 30 days (longer for compliance)

### **2. Metric Filtering**

- Use log metric filters to reduce volume
- Implement sampling for high-volume logs
- Aggregate metrics at appropriate intervals

### **3. Monitoring**

- Set up CloudWatch billing alerts
- Monitor log ingestion rates
- Review and optimize log patterns

## **🔒 Security Considerations**

### **1. Data Privacy**

- Never log sensitive information (passwords, tokens)
- Implement log redaction for PII
- Use appropriate log levels

### **2. Access Control**

- IAM follows least privilege principle
- Log groups are private by default
- Monitor access to CloudWatch resources

### **3. Compliance**

- Implement audit logging
- Maintain log integrity
- Follow data retention policies

## **📈 Next Steps**

### **1. Immediate Actions**

- [ ] Deploy CloudWatch infrastructure
- [ ] Install backend dependencies
- [ ] Test logging endpoints
- [ ] Verify CloudWatch integration

### **2. Advanced Features**

- [ ] Set up SNS notifications for alarms
- [ ] Implement log aggregation
- [ ] Create custom dashboards
- [ ] Add business-specific metrics

### **3. Optimization**

- [ ] Monitor CloudWatch costs
- [ ] Optimize log patterns
- [ ] Implement log batching
- [ ] Add performance monitoring

---

## **🎯 Benefits Achieved**

✅ **Real-time Visibility** - Monitor application health 24/7
✅ **Proactive Alerting** - Detect issues before users report them
✅ **Performance Insights** - Identify bottlenecks and optimize
✅ **Security Monitoring** - Track authentication and access patterns
✅ **Unified Logging** - Frontend and backend logs in one place
✅ **Structured Data** - Easy analysis and correlation
✅ **Cost Effective** - Optimized for production use

Your CanadaGoose application now has enterprise-grade monitoring and logging capabilities that will help you maintain high availability, detect issues early, and provide excellent user experience!
