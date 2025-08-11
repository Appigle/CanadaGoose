# Server-Side Scripts for CanadaGoose

This directory contains server-side management scripts for the CanadaGoose application running on AWS EC2.

## 📁 Scripts Overview

### 🚀 **deploy-app.sh**

**Purpose**: Deploy new Vue.js SPA builds and restart services
**Usage**: `./deploy-app.sh`
**What it does**:

- Creates backup of current app
- Extracts new build from `/tmp/canadagoose-build.tar.gz`
- Sets proper permissions
- Restarts Nginx and PM2 processes
- Shows deployment status

**Prerequisites**:

- Upload your built Vue.js app to `/tmp/canadagoose-build.tar.gz`
- Run as non-root user (ec2-user)

### 🔄 **restart-services.sh**

**Purpose**: Restart all services (Nginx, PM2 processes)
**Usage**: `./restart-services.sh`
**What it does**:

- Restarts Nginx service
- Restarts all PM2 processes
- Shows service status
- Useful for applying configuration changes

### 📊 **check-status.sh**

**Purpose**: Comprehensive system and service status check
**Usage**: `./check-status.sh`
**What it does**:

- System resources (CPU, Memory, Disk)
- Network status and public IP
- Service status (Nginx, PM2)
- Application directory contents
- Log file inspection
- Security service status

## ⚙️ PM2 Ecosystem Configuration

### **ecosystem.config.js**

**Purpose**: PM2 process management configuration
**Features**:

- **Process Management**: Single instance, auto-restart, memory limits
- **Logging**: Structured JSON logs with timestamps
- **Monitoring**: PM2 monitoring and metrics
- **Environment**: Production-ready configuration
- **Security**: Non-root user execution
- **Performance**: Memory optimization settings

## 🚀 **Quick Start Guide**

### 1. **Make Scripts Executable**

```bash
chmod +x *.sh
```

### 2. **Deploy Your App**

```bash
# Upload your built Vue.js app
scp -i your-key.pem your-app.tar.gz ec2-user@your-ec2-ip:/tmp/canadagoose-build.tar.gz

# SSH into the server and deploy
ssh -i your-key.pem ec2-user@your-ec2-ip
cd /opt/app/server-scripts
./deploy-app.sh
```

### 3. **Check Status**

```bash
./check-status.sh
```

### 4. **Restart Services**

```bash
./restart-services.sh
```

## 📋 **Alternative Commands (Option 2)**

Instead of using scripts, you can run commands directly:

### **Deploy App**

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

### **Check Services**

```bash
# Nginx status
sudo systemctl status nginx

# PM2 status
pm2 status

# System resources
htop
df -h
free -h
```

### **Restart Services**

```bash
sudo systemctl restart nginx
pm2 restart all
```

## 🔧 **PM2 Management (Option 3)**

### **Start Application**

```bash
pm2 start ecosystem.config.js --env production
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
pm2 logs canadagoose-api
pm2 logs canadagoose-api --lines 100
```

### **Monitor Processes**

```bash
pm2 monit
```

### **Save PM2 Configuration**

```bash
pm2 save
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

### **Common Issues**

1. **Permission Denied**

   ```bash
   sudo chown -R ec2-user:ec2-user /opt/app/server-scripts
   chmod +x *.sh
   ```

2. **PM2 Process Not Found**

   ```bash
   pm2 start ecosystem.config.js --env production
   ```

3. **Nginx Won't Start**

   ```bash
   sudo nginx -t  # Test configuration
   sudo systemctl status nginx  # Check status
   ```

4. **App Not Accessible**
   ```bash
   ./check-status.sh  # Comprehensive check
   curl http://localhost:3000/health  # Test API
   ```

## 🔒 **Security Notes**

- Scripts run as `ec2-user` (non-root)
- Use `sudo` only when necessary
- Scripts include proper error handling
- All operations are logged
- Backup creation before deployments

## 📈 **Performance Tips**

- Use PM2 clustering for multiple CPU cores
- Monitor memory usage with `pm2 monit`
- Set appropriate memory limits in ecosystem config
- Regular log rotation and cleanup
- Monitor disk space usage

---

**Note**: These scripts are designed for the CanadaGoose infrastructure and assume the standard directory structure created by the Terraform deployment.
