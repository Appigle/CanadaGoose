# 🚀 Server-Side Management for CanadaGoose

This document outlines the **Option 2** (alternative commands) and **Option 3** (PM2 ecosystem) approaches for managing your CanadaGoose application on AWS EC2, using shell scripts instead of Makefiles.

## 🎯 **Why This Approach?**

- **No Makefile dependency** on EC2 (Amazon Linux 2)
- **Production-ready** process management
- **Easy to remember** commands
- **Comprehensive monitoring** and logging
- **Automated deployment** workflows

## 📁 **Server Scripts Overview**

### **🚀 deploy-app.sh**

**Purpose**: Automated deployment of Vue.js SPA builds
**Features**:

- Creates automatic backups before deployment
- Extracts new builds from `/tmp/canadagoose-build.tar.gz`
- Sets proper permissions and ownership
- Restarts all services automatically
- Provides colored output and status updates

**Usage**:

```bash
cd /opt/app/server-scripts
./deploy-app.sh
```

### **🔄 restart-services.sh**

**Purpose**: Restart all services (Nginx, PM2 processes)
**Features**:

- Restarts Nginx service
- Restarts all PM2 processes
- Shows service status after restart
- Error handling and validation

**Usage**:

```bash
cd /opt/app/server-scripts
./restart-services.sh
```

### **📊 check-status.sh**

**Purpose**: Comprehensive system and service monitoring
**Features**:

- System resources (CPU, Memory, Disk)
- Network status and public IP
- Service status (Nginx, PM2)
- Application directory contents
- Log file inspection
- Security service status

**Usage**:

```bash
cd /opt/app/server-scripts
./check-status.sh
```

## ⚙️ **PM2 Ecosystem Configuration**

### **ecosystem.config.js**

**Purpose**: Production-ready PM2 process management
**Key Features**:

- **Process Management**: Single instance, auto-restart, memory limits
- **Logging**: Structured JSON logs with timestamps
- **Monitoring**: PM2 monitoring and metrics
- **Environment**: Production configuration
- **Security**: Non-root user execution
- **Performance**: Memory optimization (512MB limit)

## 🚀 **Quick Start Guide**

### **1. Initial Setup**

```bash
# SSH into your EC2 instance
ssh -i ssh_key ec2-user@your-ec2-ip

# Navigate to server scripts
cd /opt/app/server-scripts

# Make scripts executable (if needed)
chmod +x *.sh
```

### **2. Check Current Status**

```bash
./check-status.sh
```

### **3. Deploy Your App**

```bash
# From your local machine, upload your built Vue.js app
scp -i ssh_key your-app.tar.gz ec2-user@your-ec2-ip:/tmp/canadagoose-build.tar.gz

# SSH into the server and deploy
ssh -i ssh_key ec2-user@your-ec2-ip
cd /opt/app/server-scripts
./deploy-app.sh
```

### **4. Monitor and Manage**

```bash
# Check status
./check-status.sh

# Restart services
./restart-services.sh

# View PM2 logs
pm2 logs canadagoose-api

# PM2 monitoring dashboard
pm2 monit
```

## 📋 **Alternative Commands (Option 2)**

If you prefer not to use scripts, here are the direct commands:

### **Deploy App Manually**

```bash
# Create backup
sudo tar -czf /var/www/backups/app-backup-$(date +%Y%m%d_%H%M%S).tar.gz -C /var/www app

# Extract new app
sudo rm -rf /var/www/app/*
sudo tar -xzf /tmp/canadagoose-build.tar.gz -C /var/www/

# Set permissions
sudo chown -R nginx:nginx /var/www/app
sudo chmod -R 755 /var/www/app

# Restart services
sudo systemctl restart nginx
pm2 restart all
```

### **Check Services Manually**

```bash
# Nginx status
sudo systemctl status nginx

# PM2 status
pm2 status

# System resources
htop
df -h
free -h

# Network info
curl -s http://169.254.169.254/latest/meta-data/public-ipv4
```

### **Restart Services Manually**

```bash
sudo systemctl restart nginx
pm2 restart all
```

## 🔧 **PM2 Management (Option 3)**

### **Start Application**

```bash
# Start with ecosystem configuration
pm2 start ecosystem.config.js --env production

# Or start manually
pm2 start /opt/app/server/app.js --name canadagoose-api
```

### **Stop Application**

```bash
pm2 stop canadagoose-api
```

### **Restart Application**

```bash
pm2 restart canadagoose-api
```

### **View Logs**

```bash
# All logs
pm2 logs canadagoose-api

# Last 100 lines
pm2 logs canadagoose-api --lines 100

# Follow logs in real-time
pm2 logs canadagoose-api --follow
```

### **Monitor Processes**

```bash
# PM2 monitoring dashboard
pm2 monit

# Process list
pm2 list

# Process info
pm2 show canadagoose-api
```

### **Save and Startup**

```bash
# Save current PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

## 📊 **Monitoring & Logs**

### **PM2 Logs Location**

- **Error logs**: `/var/log/pm2/canadagoose-api-error.log`
- **Output logs**: `/var/log/pm2/canadagoose-api-out.log`
- **Combined logs**: `/var/log/pm2/canadagoose-api-combined.log`

### **Nginx Logs**

- **Access logs**: `/var/log/nginx/access.log`
- **Error logs**: `/var/log/nginx/error.log`

### **Application Logs**

- **App logs**: `/opt/app/server/logs/` (if configured)

## 🛠️ **Troubleshooting**

### **Common Issues & Solutions**

#### **1. Permission Denied**

```bash
# Fix script permissions
sudo chown -R ec2-user:ec2-user /opt/app/server-scripts
chmod +x /opt/app/server-scripts/*.sh
```

#### **2. PM2 Process Not Found**

```bash
# Check PM2 status
pm2 list

# Start with ecosystem
pm2 start ecosystem.config.js --env production

# Or start manually
pm2 start /opt/app/server/app.js --name canadagoose-api
```

#### **3. Nginx Won't Start**

```bash
# Test configuration
sudo nginx -t

# Check status
sudo systemctl status nginx

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

#### **4. App Not Accessible**

```bash
# Check all services
./check-status.sh

# Test API locally
curl http://localhost:3000/health

# Check Nginx configuration
sudo nginx -t
```

#### **5. High Memory Usage**

```bash
# Check memory usage
free -h
pm2 monit

# Restart PM2 processes
pm2 restart all

# Check for memory leaks
pm2 logs canadagoose-api --lines 100
```

## 🔒 **Security Best Practices**

- **Run scripts as `ec2-user`** (non-root)
- **Use `sudo` only when necessary**
- **Regular security updates**: `sudo yum update -y`
- **Monitor log files** for suspicious activity
- **Backup regularly** before deployments
- **Use IAM roles** instead of hardcoded credentials

## 📈 **Performance Optimization**

### **PM2 Settings**

- **Memory limit**: 200MB per process
- **Auto-restart**: On memory limit exceeded
- **Process monitoring**: Enabled
- **Log rotation**: Automatic

### **System Optimization**

- **Regular cleanup**: Remove old backups and logs
- **Monitor disk space**: `df -h`
- **CPU monitoring**: `htop` or `top`
- **Network monitoring**: Check bandwidth usage

## 🚀 **Deployment Workflow**

### **Typical Deployment Process**

1. **Build your Vue.js app** locally
2. **Create tar.gz archive** of the build
3. **Upload to server** via SCP
4. **Run deployment script** on server
5. **Verify deployment** with status check
6. **Monitor logs** for any issues

### **Automated Deployment (Future)**

- **GitHub Actions** integration
- **Docker containerization**
- **Blue-green deployment**
- **Rollback capabilities**

## 📚 **Additional Resources**

- **PM2 Documentation**: https://pm2.keymetrics.io/docs/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **AWS EC2 User Guide**: https://docs.aws.amazon.com/ec2/
- **Terraform Documentation**: https://www.terraform.io/docs

---

## 🎯 **Summary**

This approach provides you with:

✅ **No Makefile dependency** on EC2  
✅ **Easy-to-remember commands**  
✅ **Automated deployment scripts**  
✅ **Comprehensive monitoring**  
✅ **Production-ready PM2 configuration**  
✅ **Alternative manual commands**  
✅ **Built-in troubleshooting tools**

Your CanadaGoose application is now ready for production deployment with professional-grade process management and monitoring! 🚀
