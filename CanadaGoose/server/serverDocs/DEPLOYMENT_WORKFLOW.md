# 🚀 CanadaGoose Deployment Workflow

## 📋 **Overview**

CanadaGoose uses a **two-stage deployment process**:

1. **Local Development & Testing** (on your development machine)
2. **Production Deployment** (on EC2 server)

## 🔧 **Stage 1: Local Development & Testing**

### **Purpose**

- Validate environment configuration locally
- Create production deployment packages
- Run the server locally for development
- Test API endpoints before deployment

### **Scripts to Use**

```bash
cd CanadaGoose/server/

# Option 1: Local build and package only
./scripts/build-production.sh

# Option 2: Local development server
./deploy-production.sh
```

### **What They Do**

**`build-production.sh`:**

1. ✅ Creates `.env` file from `env.example` if missing
2. ✅ Validates environment variables
3. ✅ Creates production deployment package (`.tar.gz`)
4. ✅ Skips database connection test (expected to fail locally)
5. ✅ Prepares files for AWS deployment

**`deploy-production.sh`:**

1. ✅ Creates `.env` file from `env.example` if missing
2. ✅ Validates environment variables
3. ✅ Installs Node.js dependencies
4. ✅ Starts server locally on `localhost:3000`

### **When to Use**

- ✅ **Before deploying to EC2** - Test your changes locally
- ✅ **Creating deployment packages** - Prepare for AWS deployment
- ✅ **Environment validation** - Check configuration
- ✅ **Local development** - Run server for testing

### **Expected Output**

**`build-production.sh`:**

```
ℹ️  Database connection test skipped locally
   Reason: RDS security groups block external connections
   Database connectivity will be tested on EC2 during deployment
✅ Production package created successfully!
```

**`deploy-production.sh`:**

```
🚀 Starting production server...
📊 Server Configuration:
   🔌 Internal Server: http://localhost:3000
```

## 🚀 **Stage 2: Production Deployment**

### **Purpose**

- Deploy the application to EC2 production server
- Manage server services (PM2, Nginx)
- Handle production environment setup
- Test database connectivity in production environment

### **Scripts to Use**

```bash
# Option 1: Automated deployment from local machine
cd CanadaGoose/server/
./scripts/deploy-to-aws.sh

# Option 2: Manual deployment on EC2
ssh -i ../../infra/ssh_key ec2-user@44.195.110.182
cd /opt/app/server-scripts/
./deploy-app.sh
```

### **What They Do**

**`deploy-to-aws.sh` (Recommended):**

1. ✅ Builds production package locally
2. ✅ Uploads to EC2 automatically
3. ✅ Deploys to `/opt/app/server/`
4. ✅ Installs dependencies and starts PM2
5. ✅ Tests database connectivity on EC2
6. ✅ Verifies API endpoints

**`deploy-app.sh` (EC2 only):**

1. ✅ Creates backups of current deployment
2. ✅ Extracts new application build
3. ✅ Sets proper permissions
4. ✅ Restarts PM2 services
5. ✅ Provides deployment status

### **When to Use**

- ✅ **Automated deployment** - Use `deploy-to-aws.sh` from local machine
- ✅ **Server management** - Use `deploy-app.sh` on EC2
- ✅ **Production updates** - Deploy new versions
- ✅ **Database testing** - Verify connectivity in production environment

## 🔄 **Complete Deployment Workflow**

### **Step 1: Local Development & Testing**

```bash
# On your development machine
cd CanadaGoose/server/

# Option A: Create production package
./scripts/build-production.sh

# Option B: Run local development server
./deploy-production.sh

# Test API endpoints locally
curl http://localhost:3000/api/healthcheck
```

### **Step 2: Automated Deployment (Recommended)**

```bash
# Deploy server to AWS automatically
./scripts/deploy-to-aws.sh

# This script:
# - Builds production package
# - Uploads to EC2
# - Deploys and starts services
# - Tests database connectivity on EC2
# - Verifies API endpoints
```

### **Step 3: Manual Deployment (Alternative)**

```bash
# Build and package locally
./scripts/build-production.sh

# Upload to EC2
scp -i ../../infra/ssh_key canadagoose-server-prod.tar.gz ec2-user@44.195.110.182:/tmp/

# Deploy on EC2
ssh -i ../../infra/ssh_key ec2-user@44.195.110.182
cd /opt/app/server-scripts/
./deploy-app.sh
```

### **Step 4: Frontend Deployment (If needed)**

```bash
# Build Vue.js frontend
cd ../client/
npm run build:prod

# Create and upload frontend package
tar -czf canadagoose-client-prod.tar.gz dist/
scp -i ../../infra/ssh_key canadagoose-client-prod.tar.gz ec2-user@44.195.110.182:/tmp/

# Deploy frontend on EC2
ssh -i ../../infra/ssh_key ec2-user@44.195.110.182
cd /opt/app && tar -xzf /tmp/canadagoose-client-prod.tar.gz
sudo systemctl restart nginx
```

## 🚨 **Common Mistakes to Avoid**

### **❌ Don't Do This**

- Running `deploy-production.sh` on EC2 (causes module errors)
- Running `deploy-app.sh` locally (won't work)
- Expecting database connection to work locally (blocked by security groups)
- Skipping local testing before deployment
- Not checking environment variables

### **✅ Do This Instead**

- Use `deploy-production.sh` for local development server only
- Use `build-production.sh` for creating deployment packages
- Use `deploy-to-aws.sh` for automated deployment from local machine
- Use `deploy-app.sh` for EC2 deployment only
- Always test locally before deploying
- Verify environment configuration
- Understand that local DB connection failures are expected and normal

## 🔍 **Troubleshooting**

### **Local Testing Issues**

```bash
# Check if .env file exists
ls -la .env

# Create .env from example
cp env.example .env

# Verify environment variables
cat .env | grep DB_HOST

# Database connection failures locally are EXPECTED and normal
# This is a security feature, not a bug
```

### **Script Issues**

```bash
# Check script permissions
chmod +x scripts/*.sh

# Verify you're in the correct directory
pwd  # Should be CanadaGoose/server/

# Check script locations
ls -la scripts/
ls -la deploy-production.sh
```

### **EC2 Deployment Issues**

```bash
# Check server scripts permissions
ls -la /opt/app/server-scripts/

# Make scripts executable
chmod +x /opt/app/server-scripts/*.sh

# Check service status
./check-status.sh

# Check PM2 status
pm2 status
pm2 logs canadagoose-server
```

### **Database Connection Issues**

1. **Local Connection Failures**: Expected and normal (security feature)
2. **EC2 Connection Issues**:
   - Check RDS Status: Ensure instance is running
   - Security Groups: Verify EC2 can connect to RDS
   - Credentials: Confirm username/password in `.env`
   - Network: Test connectivity from EC2 to RDS
3. **Testing**: Database connectivity is automatically tested during deployment

## 🔒 **Database Connectivity Behavior**

### **Local Development Machine**

- ❌ **Database connection will fail** (ETIMEDOUT error)
- ✅ **This is expected and normal behavior**
- 🔒 **Security feature**: RDS security groups block external connections
- 💡 **Purpose**: Prevents unauthorized access to your database

### **EC2 Production Server**

- ✅ **Database connection works perfectly**
- 🌐 **Network path**: EC2 → VPC → RDS (internal, secure)
- 🧪 **Testing**: Automatically verified during deployment
- 📊 **Status**: Verified working in production environment

### **Why This Happens**

```
Your Local Machine ←→ Internet ←→ AWS VPC ←→ EC2 Instance ←→ RDS Database
     ❌ BLOCKED           ✅ ALLOWED        ✅ ALLOWED        ✅ ALLOWED
```

**Security Benefits:**

- Database only accessible from within AWS VPC
- No external network exposure
- EC2 instances can connect securely
- Follows AWS security best practices

## 📚 **Additional Resources**

- **Server Management**: `infra/SERVER_MANAGEMENT.md`
- **Database Fixes**: `DATABASE_FIX_SUMMARY.md`
- **Infrastructure**: `infra/README.md`
- **Client Deployment**: `../client/deploy-vue.sh`

## 🎯 **Quick Reference**

| Action                 | Location            | Script                          | Purpose                      |
| ---------------------- | ------------------- | ------------------------------- | ---------------------------- |
| **Local Build**        | Development Machine | `./scripts/build-production.sh` | Create deployment package    |
| **Local Development**  | Development Machine | `./deploy-production.sh`        | Run local development server |
| **Automated Deploy**   | Development Machine | `./scripts/deploy-to-aws.sh`    | Full deployment to AWS       |
| **Manual Deploy**      | EC2 Server          | `./deploy-app.sh`               | Deploy on EC2 only           |
| **Service Management** | EC2 Server          | `./restart-services.sh`         | Restart services             |
| **Status Check**       | EC2 Server          | `./check-status.sh`             | Check deployment status      |
