# Certbot HTTPS/SSL Implementation Guide - Ubuntu/Debian

## 📋 **Overview**

This guide provides Ubuntu/Debian-specific instructions for implementing HTTPS/SSL using Certbot and Let's Encrypt. This is the companion guide to the main Certbot guide, optimized for systems using `apt` package manager.

## 🎯 **System Compatibility**

**Target Systems:**

- ✅ **Ubuntu** (18.04 LTS, 20.04 LTS, 22.04 LTS, 24.04 LTS)
- ✅ **Debian** (10, 11, 12)
- ✅ **Linux Mint** (19.x, 20.x, 21.x)
- ✅ **Elementary OS**
- ✅ **Pop!\_OS**
- ✅ **Other Ubuntu/Debian derivatives**

**Package Manager:** `apt` / `apt-get`

---

## 🚀 **Prerequisites**

### **System Requirements**

- ✅ **Ubuntu 18.04+** or **Debian 10+**
- ✅ **Root or sudo access**
- ✅ **Domain name** pointing to your server
- ✅ **Port 80 open** (for HTTP validation)
- ✅ **Port 443 open** (for HTTPS)
- ✅ **Internet connection** for package downloads

### **Current Setup**

- **Domain**: `s25cicd.xiaopotato.top`
- **Server**: Ubuntu/Debian system
- **Web Server**: Nginx
- **Application**: CanadaGoose (Vue.js + Node.js)

---

## 📦 **Installation Methods**

### **Method 1: APT Package Manager (Recommended)**

#### **Step 1: Update System Packages**

```bash
# Update package list
sudo apt update

# Upgrade existing packages
sudo apt upgrade -y

# Install required dependencies
sudo apt install -y software-properties-common
```

#### **Step 2: Add Certbot Repository**

```bash
# Add Certbot PPA (Personal Package Archive)
sudo add-apt-repository ppa:certbot/certbot -y

# Update package list again to include new repository
sudo apt update
```

#### **Step 3: Install Certbot**

```bash
# Install Certbot with Nginx plugin
sudo apt install -y certbot python3-certbot-nginx

# Verify installation
certbot --version
```

### **Method 2: Snap Installation (Alternative)**

#### **Step 1: Install Snapd**

```bash
# Install snapd if not available
sudo apt install -y snapd

# Enable and start snapd service
sudo systemctl enable --now snapd.socket

# Wait for snapd to be ready
sudo snap wait system seed.loaded
```

#### **Step 2: Install Certbot via Snap**

```bash
# Install Certbot classic snap
sudo snap install --classic certbot

# Create symlink for easy access
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Verify installation
certbot --version
```

### **Method 3: Manual Installation (Advanced)**

#### **Step 1: Install Python Dependencies**

```bash
# Install Python and pip
sudo apt install -y python3 python3-pip python3-venv

# Install required system packages
sudo apt install -y build-essential libssl-dev libffi-dev python3-dev
```

#### **Step 2: Download and Install Certbot**

```bash
# Download Certbot
wget https://dl.eff.org/certbot-auto

# Make executable
chmod a+x certbot-auto

# Move to system path
sudo mv certbot-auto /usr/local/bin/certbot-auto

# Verify installation
certbot-auto --version
```

---

## 🔧 **Certificate Generation**

### **Step 1: Stop Web Server (if using --standalone mode)**

```bash
# Stop Nginx temporarily
sudo systemctl stop nginx

# Verify it's stopped
sudo systemctl status nginx

# Check if port 80 is free
sudo netstat -tlnp | grep :80
```

### **Step 2: Generate Certificate**

#### **Option A: Standalone Mode (Recommended for initial setup)**

```bash
# Generate certificate using standalone mode
sudo certbot certonly --standalone \
  -d s25cicd.xiaopotato.top \
  --email ray.chenley.up@gmail.com \
  --agree-tos \
  --non-interactive

# This will:
# 1. Temporarily bind to port 80
# 2. Validate domain ownership
# 3. Generate SSL certificate
# 4. Store certificates in /etc/letsencrypt/
```

#### **Option B: Nginx Plugin Mode (Recommended for production)**

```bash
# Generate certificate using Nginx plugin
sudo certbot --nginx \
  -d s25cicd.xiaopotato.top \
  --email ray.chenley.up@gmail.com \
  --agree-tos \
  --non-interactive

# This will:
# 1. Automatically configure Nginx
# 2. Add SSL configuration
# 3. Set up HTTP to HTTPS redirects
# 4. Reload Nginx automatically
```

#### **Option C: Webroot Mode (if you want to keep Nginx running)**

```bash
# Create webroot directory
sudo mkdir -p /var/www/.well-known

# Set proper permissions
sudo chown -R www-data:www-data /var/www/.well-known
sudo chmod -R 755 /var/www/.well-known

# Generate certificate using webroot mode
sudo certbot certonly --webroot \
  -w /var/www \
  -d s25cicd.xiaopotato.top \
  --email ray.chenley.up@gmail.com \
  --agree-tos \
  --non-interactive
```

### **Step 3: Verify Certificate Generation**

```bash
# Check certificate files
sudo ls -la /etc/letsencrypt/live/s25cicd.xiaopotato.top/

# Expected files:
# - fullchain.pem (certificate chain)
# - privkey.pem (private key)
# - cert.pem (certificate only)

# Test certificate validity
sudo certbot certificates

# Check certificate expiration
sudo openssl x509 -in /etc/letsencrypt/live/s25cicd.xiaopotato.top/cert.pem -text -noout | grep -A 2 "Validity"

# Test certificate with OpenSSL
sudo openssl s_client -connect s25cicd.xiaopotato.top:443 -servername s25cicd.xiaopotato.top
```

---

## ⚙️ **Nginx Configuration**

### **Step 1: Install Nginx (if not already installed)**

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check Nginx status
sudo systemctl status nginx
```

### **Step 2: Create HTTPS Nginx Configuration**

Create a new configuration file for HTTPS:

```bash
sudo nano /etc/nginx/sites-available/s25cicd.xiaopotato.top
```

### **Step 3: Add HTTPS Configuration**

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name s25cicd.xiaopotato.top;

    # Redirect all HTTP traffic to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name s25cicd.xiaopotato.top;

    # SSL Certificate paths (Certbot created these)
    ssl_certificate /etc/letsencrypt/live/s25cicd.xiaopotato.top/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/s25cicd.xiaopotato.top/privkey.pem;

    # SSL Security Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend Application
    location /app {
        root /var/www;
        try_files $uri $uri/ /app/index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health Check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain text/css text/xml text/javascript
        application/json application/javascript application/xml+rss
        application/atom+xml image/svg+xml;
}
```

### **Step 4: Enable Site and Test Configuration**

```bash
# Create symlink to enable the site
sudo ln -s /etc/nginx/sites-available/s25cicd.xiaopotato.top /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx
```

---

## 🔄 **Automatic Renewal Setup**

### **Step 1: Test Renewal Process**

```bash
# Test renewal process (dry run)
sudo certbot renew --dry-run

# This simulates the renewal process without actually renewing
# Check for any errors or issues
```

### **Step 2: Set Up Cron Job for Automatic Renewal**

```bash
# Open crontab for editing
sudo crontab -e

# Add the following line for daily renewal attempts
0 2 * * * /usr/bin/certbot renew --quiet --no-self-upgrade

# This runs daily at 2:00 AM
# --quiet: Suppresses output unless there's an error
# --no-self-upgrade: Prevents automatic Certbot updates
```

### **Step 3: Verify Cron Job**

```bash
# List current cron jobs
sudo crontab -l

# Check cron service status
sudo systemctl status cron
```

### **Step 4: Test Cron Job Execution**

```bash
# Manually run the cron job to test
sudo /usr/bin/certbot renew --quiet --no-self-upgrade

# Check renewal logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

---

## 🧪 **Testing and Verification**

### **Step 1: Test HTTP to HTTPS Redirect**

```bash
# Test HTTP redirect
curl -I http://s25cicd.xiaopotato.top

# Expected response: 301 Moved Permanently
# Location: https://s25cicd.xiaopotato.top/
```

### **Step 2: Test HTTPS Endpoints**

```bash
# Test frontend via HTTPS
curl -I https://s25cicd.xiaopotato.top/app

# Test API health check via HTTPS
curl -I https://s25cicd.xiaopotato.top/api/healthcheck

# Test API version via HTTPS
curl -I https://s25cicd.xiaopotato.top/api/version
```

### **Step 3: SSL Certificate Verification**

```bash
# Check certificate details
openssl s_client -connect s25cicd.xiaopotato.top:443 -servername s25cicd.xiaopotato.top

# Test SSL Labs (online tool)
# Visit: https://www.ssllabs.com/ssltest/
# Enter: s25cicd.xiaopotato.top
```

### **Step 4: Browser Testing**

```bash
# Open in browser
xdg-open https://s25cicd.xiaopotato.top/app

# Check for:
# - HTTPS in address bar
# - Security lock icon
# - No mixed content warnings
```

---

## 🔍 **Ubuntu/Debian Specific Troubleshooting**

### **Issue 1: Package Installation Fails**

#### **Problem**: Repository issues or package conflicts

```bash
# Update package lists
sudo apt update

# Fix broken packages
sudo apt --fix-broken install

# Clean package cache
sudo apt clean
sudo apt autoclean

# Try installation again
sudo apt install -y certbot python3-certbot-nginx
```

#### **Solution**: Clear package cache and retry installation

### **Issue 2: Snap Installation Issues**

#### **Problem**: Snap service not working

```bash
# Check snapd status
sudo systemctl status snapd

# Restart snapd service
sudo systemctl restart snapd

# Wait for service to be ready
sudo snap wait system seed.loaded

# Try snap installation again
sudo snap install --classic certbot
```

#### **Solution**: Restart snapd service and wait for initialization

### **Issue 3: Nginx Configuration Errors**

#### **Problem**: Site configuration not loading

```bash
# Check Nginx configuration syntax
sudo nginx -t

# Check for configuration errors
sudo nginx -T | grep -i error

# Verify site is enabled
ls -la /etc/nginx/sites-enabled/

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

#### **Solution**: Fix configuration syntax and ensure site is enabled

### **Issue 4: Permission Issues**

#### **Problem**: Certificate file permissions

```bash
# Check certificate file permissions
sudo ls -la /etc/letsencrypt/live/s25cicd.xiaopotato.top/

# Fix permissions if needed
sudo chmod 644 /etc/letsencrypt/live/s25cicd.xiaopotato.top/fullchain.pem
sudo chmod 600 /etc/letsencrypt/live/s25cicd.xiaopotato.top/privkey.pem

# Ensure Nginx can read certificates
sudo chown -R root:root /etc/letsencrypt/live/
sudo chmod -R 755 /etc/letsencrypt/live/
```

#### **Solution**: Set proper file permissions for Nginx access

---

## 📊 **Ubuntu/Debian Specific Monitoring**

### **System Monitoring**

```bash
# Check system resources
htop
iotop
nethogs

# Monitor disk usage
df -h
du -sh /etc/letsencrypt/

# Check system logs
sudo journalctl -u nginx -f
sudo journalctl -u snapd -f
```

### **Package Management Monitoring**

```bash
# Check for package updates
sudo apt list --upgradable

# Check package status
dpkg -l | grep certbot
dpkg -l | grep nginx

# Check package configuration
sudo dpkg-reconfigure certbot
```

### **Service Monitoring**

```bash
# Check service status
sudo systemctl status nginx
sudo systemctl status cron
sudo systemctl status snapd

# Enable service logging
sudo systemctl enable nginx
sudo journalctl -u nginx -f
```

---

## 🚀 **Advanced Ubuntu/Debian Configuration**

### **UFW Firewall Configuration**

```bash
# Install UFW if not available
sudo apt install -y ufw

# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check firewall status
sudo ufw status
```

### **Fail2ban Installation**

```bash
# Install Fail2ban
sudo apt install -y fail2ban

# Configure Fail2ban for Nginx
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edit configuration
sudo nano /etc/fail2ban/jail.local

# Restart Fail2ban
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban
```

### **Logrotate Configuration**

```bash
# Install logrotate if not available
sudo apt install -y logrotate

# Configure Nginx log rotation
sudo nano /etc/logrotate.d/nginx

# Test logrotate
sudo logrotate -d /etc/logrotate.d/nginx
```

---

## 📚 **Ubuntu/Debian Specific Commands**

### **Package Management**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install packages
sudo apt install -y package-name

# Remove packages
sudo apt remove package-name

# Purge packages (remove config files)
sudo apt purge package-name

# Search packages
apt search certbot

# Show package info
apt show certbot
```

### **Service Management**

```bash
# Start service
sudo systemctl start service-name

# Stop service
sudo systemctl stop service-name

# Restart service
sudo systemctl restart service-name

# Enable service
sudo systemctl enable service-name

# Check service status
sudo systemctl status service-name
```

### **Log Management**

```bash
# View system logs
sudo journalctl -u service-name -f

# View specific log files
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Clear logs
sudo journalctl --vacuum-time=7d
```

---

## 🔒 **Security Best Practices for Ubuntu/Debian**

### **System Security**

```bash
# Install security updates automatically
sudo apt install -y unattended-upgrades

# Configure automatic security updates
sudo dpkg-reconfigure -plow unattended-upgrades

# Install security tools
sudo apt install -y rkhunter chkrootkit

# Run security scans
sudo rkhunter --check
```

### **Nginx Security**

```bash
# Hide Nginx version
echo "server_tokens off;" | sudo tee -a /etc/nginx/nginx.conf

# Set secure file permissions
sudo chmod 644 /etc/nginx/nginx.conf
sudo chmod 644 /etc/nginx/sites-available/*
sudo chmod 755 /etc/nginx/sites-enabled/

# Restart Nginx
sudo systemctl restart nginx
```

### **SSL Security**

```bash
# Generate strong Diffie-Hellman parameters
sudo openssl dhparam -out /etc/nginx/dhparam.pem 2048

# Add to Nginx configuration
echo "ssl_dhparam /etc/nginx/dhparam.pem;" | sudo tee -a /etc/nginx/sites-available/s25cicd.xiaopotato.top
```

---

## 📞 **Ubuntu/Debian Support Resources**

### **Official Documentation**

- **Ubuntu**: https://ubuntu.com/server/docs
- **Debian**: https://www.debian.org/doc/
- **Certbot**: https://certbot.eff.org/instructions?os=ubuntufocal

### **Community Resources**

- **Ubuntu Forums**: https://ubuntuforums.org/
- **Debian Forums**: https://forums.debian.net/
- **Ask Ubuntu**: https://askubuntu.com/
- **Stack Overflow**: Tagged with `ubuntu`, `debian`, `certbot`

### **Package Information**

- **Ubuntu Packages**: https://packages.ubuntu.com/
- **Debian Packages**: https://packages.debian.org/
- **PPA Information**: https://launchpad.net/~certbot/+archive/ubuntu/certbot

---

## ✅ **Ubuntu/Debian Implementation Checklist**

### **Pre-Implementation**

- [ ] System updated (`sudo apt update && sudo apt upgrade`)
- [ ] Domain DNS configured correctly
- [ ] Ports 80 and 443 open in firewall
- [ ] Server has root/sudo access
- [ ] Nginx installed and configured

### **Implementation**

- [ ] Certbot installed via apt or snap
- [ ] SSL certificate generated successfully
- [ ] Nginx configured for HTTPS
- [ ] Site enabled in sites-enabled directory
- [ ] HTTP to HTTPS redirect working
- [ ] All endpoints accessible via HTTPS

### **Post-Implementation**

- [ ] Automatic renewal configured via cron
- [ ] UFW firewall configured
- [ ] Fail2ban installed and configured
- [ ] Security headers implemented
- [ ] Performance optimized
- [ ] Documentation updated

### **Testing and Verification**

- [ ] SSL certificate valid
- [ ] HTTPS endpoints responding
- [ ] HTTP redirects working
- [ ] No mixed content warnings
- [ ] Browser security indicators showing
- [ ] SSL Labs A+ rating achieved

---

## 🎉 **Success Indicators for Ubuntu/Debian**

Your HTTPS implementation is successful when:

1. ✅ **Browser shows security lock icon**
2. ✅ **URL starts with `https://`**
3. ✅ **No mixed content warnings**
4. ✅ **SSL Labs gives A+ rating**
5. ✅ **Automatic renewal working via cron**
6. ✅ **All endpoints accessible via HTTPS**
7. ✅ **HTTP requests redirect to HTTPS**
8. ✅ **UFW firewall protecting ports**
9. ✅ **Fail2ban monitoring for attacks**
10. ✅ **System logs properly rotated**

---

## 📝 **Ubuntu/Debian Specific Notes**

- **Package Manager**: `apt` / `apt-get`
- **Service Manager**: `systemctl` (systemd)
- **Configuration Location**: `/etc/nginx/sites-available/` and `/etc/nginx/sites-enabled/`
- **Log Location**: `/var/log/nginx/` and `/var/log/letsencrypt/`
- **Certificate Location**: `/etc/letsencrypt/live/s25cicd.xiaopotato.top/`
- **Firewall**: UFW (Uncomplicated Firewall)
- **Cron Service**: `cron` (not `crond`)

---

**Last Updated**: August 12, 2025  
**Version**: 1.0  
**Target Systems**: Ubuntu 18.04+ / Debian 10+  
**Status**: ✅ **READY FOR UBUNTU/DEBIAN IMPLEMENTATION**
