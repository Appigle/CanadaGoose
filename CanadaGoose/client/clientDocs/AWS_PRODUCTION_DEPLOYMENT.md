# 🚀 AWS Production Deployment Guide

## 📋 **Overview**

This guide shows you how to deploy your CanadaGoose Vue.js application to AWS production. Your app is already running on:

- **Frontend**: `http://s25cicd.xiaopotato.top/app`
- **API**: `http://s25cicd.xiaopotato.top/api`

## 🏗️ **Infrastructure Status**

✅ **AWS Services Running**:

- **EC2 Instance**: `44.195.110.182` (t3.micro)
- **RDS Database**: `canadagoose-prod-db.cozaqoges4eb.us-east-1.rds.amazonaws.com`
- **Nginx**: Reverse proxy and static file serving
- **PM2**: Node.js process management
- **Security Groups**: Configured for production access

## 🚀 **Production Deployment Process**

### **Step 1: Build for Production**

```bash
cd CanadaGoose/client/
npm run build:prod
```

**What this does**:

- Creates optimized production bundle in `dist/` folder
- Minifies JavaScript, CSS, and HTML
- Generates hashed filenames for cache busting
- Optimizes assets for production

### **Step 2: Deploy to AWS**

```bash
./deploy-to-aws.sh
```

**What this does**:

- Creates deployment package (`canadagoose-client-prod.tar.gz`)
- Uploads to EC2 instance via SCP
- Extracts files to `/opt/app/client/`
- Sets proper permissions (nginx:nginx)
- Creates automatic backups
- Tests deployment accessibility

## 🔧 **Deployment Script Details**

### **`deploy-to-aws.sh` - What It Does**

1. **Environment Setup**

   ```bash
   export NODE_ENV=production
   export VITE_API_BASE_URL=http://s25cicd.xiaopotato.top
   export VITE_API_URL=http://s25cicd.xiaopotato.top/api
   ```

2. **Build Process**

   ```bash
   npm run build:prod  # Creates dist/ folder
   ```

3. **Package Creation**

   ```bash
   tar -czf canadagoose-client-prod.tar.gz dist/
   ```

4. **Upload to EC2**

   ```bash
   scp -i ../../infra/ssh_key canadagoose-client-prod.tar.gz ec2-user@44.195.110.182:/tmp/
   ```

5. **Deployment on EC2**

   ```bash
   # Extract files
   tar -xzf canadagoose-client-prod.tar.gz

   # Backup current version
   sudo cp -r /opt/app/client /opt/app/client.backup.$(date +%Y%m%d_%H%M%S)

   # Deploy new version
   sudo cp -r dist/* /opt/app/client/

   # Set permissions
   sudo chown -R nginx:nginx /opt/app/client
   sudo chmod -R 755 /opt/app/client
   ```

## 🌐 **Production URLs**

| Service        | URL                                             | Status  |
| -------------- | ----------------------------------------------- | ------- |
| **Frontend**   | `http://s25cicd.xiaopotato.top/app`             | ✅ Live |
| **API Health** | `http://s25cicd.xiaopotato.top/api/healthcheck` | ✅ Live |
| **API Base**   | `http://s25cicd.xiaopotato.top/api`             | ✅ Live |

## 📁 **File Structure on EC2**

```
/opt/app/
├── client/                    # Vue.js frontend files
│   ├── index.html            # Main HTML file
│   ├── assets/               # JavaScript, CSS, images
│   └── favicon.ico           # App icon
├── server/                    # Node.js backend
│   ├── app.js                # Express server
│   ├── config/               # Database config
│   └── routes/               # API routes
└── server-scripts/            # Deployment scripts
    ├── deploy-app.sh         # App deployment
    ├── restart-services.sh    # Service management
    └── check-status.sh       # System monitoring
```

## 🔄 **Update Deployment Workflow**

### **When You Make Code Changes**

1. **Update your code** in the `src/` folder
2. **Test locally** with `npm run dev`
3. **Build for production**:
   ```bash
   npm run build:prod
   ```
4. **Deploy to AWS**:
   ```bash
   ./deploy-vue.sh
   ```

### **Deployment Time**

- **Build**: ~1-2 seconds
- **Upload**: ~5-10 seconds (depending on file size)
- **Deployment**: ~10-15 seconds
- **Total**: ~20-30 seconds

## 🛠️ **Troubleshooting**

### **Common Issues & Solutions**

#### **1. Build Failures**

```bash
# Clear dependencies and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build:prod
```

#### **2. Deployment Failures**

```bash
# Check SSH connection
ssh -i ../../infra/ssh_key ec2-user@44.195.110.182

# Check server status
cd /opt/app/server-scripts/
./check-status.sh
```

#### **3. App Not Accessible**

```bash
# Check Nginx status
sudo systemctl status nginx

# Check app files
ls -la /opt/app/client/

# Check permissions
sudo chown -R nginx:nginx /opt/app/client
```

#### **4. API Issues**

```bash
# Check server logs
pm2 logs canadagoose-api

# Restart services
./restart-services.sh
```

## 📊 **Monitoring & Maintenance**

### **Check Application Status**

```bash
# Frontend accessibility
curl -I http://s25cicd.xiaopotato.top/app

# API health
curl http://s25cicd.xiaopotato.top/api/healthcheck

# Server status
ssh -i ../../infra/ssh_key ec2-user@44.195.110.182
cd /opt/app/server-scripts/
./check-status.sh
```

### **Performance Monitoring**

- **Frontend**: Check browser dev tools for load times
- **API**: Monitor response times and error rates
- **Server**: Check CPU, memory, and disk usage

## 🔒 **Security Considerations**

✅ **Already Configured**:

- HTTPS via Cloudflare
- CORS restrictions
- Rate limiting
- Security headers (Helmet)
- Database connection encryption

⚠️ **Best Practices**:

- Keep dependencies updated
- Monitor for security vulnerabilities
- Regular backups
- Access logging

## 🚀 **Quick Deploy Commands**

### **Full Production Deployment**

```bash
cd CanadaGoose/client/
npm run build:prod && ./deploy-to-aws.sh
```

### **Check Status Only**

```bash
curl -I http://s25cicd.xiaopotato.top/app
curl http://s25cicd.xiaopotato.top/api/healthcheck
```

### **SSH to Server**

```bash
ssh -i ../../infra/ssh_key ec2-user@44.195.110.182
```

## 📚 **Additional Resources**

- **Infrastructure**: `../infra/README.md`
- **Server Management**: `../infra/SERVER_MANAGEMENT.md`
- **Database Setup**: `../server/DATABASE_FIX_SUMMARY.md`
- **Deployment Workflow**: `DEPLOYMENT_WORKFLOW.md`

## 🎯 **Success Metrics**

✅ **Deployment Successful When**:

- Build completes without errors
- Files upload to EC2 successfully
- App is accessible at production URL
- API health check returns 200 OK
- No console errors in browser

---

**Your CanadaGoose app is now running in production on AWS! 🎉**

**Production URL**: http://s25cicd.xiaopotato.top/app
**Last Deployed**: $(date)
**Status**: ✅ Live and Operational
