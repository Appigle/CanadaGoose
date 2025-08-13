# Certbot HTTPS/SSL Implementation Guide

## 📋 **Overview**

This guide explains how to implement HTTPS/SSL using Certbot and Let's Encrypt for the CanadaGoose application. Certbot is a free, open-source tool that automates the process of obtaining and renewing SSL certificates.

## 🎯 **What is Certbot?**

**Certbot** is a command-line tool that:

- ✅ **Automatically obtains** SSL certificates from Let's Encrypt
- ✅ **Handles renewals** automatically (certificates expire every 90 days)
- ✅ **Integrates with web servers** (Nginx, Apache, etc.)
- ✅ **Provides free SSL certificates** for unlimited domains
- ✅ **Supports multiple validation methods**

## 🌐 **Let's Encrypt Overview**

**Let's Encrypt** is a free, automated, and open Certificate Authority that:

- Provides **free SSL certificates**
- Uses **ACME protocol** for automated validation
- Has **90-day certificate validity**
- Supports **unlimited certificate issuance**
- Offers **automatic renewal capabilities**

---

## 🚀 **Prerequisites**

### **System Requirements**

- ✅ **Linux/Unix server** (Ubuntu, CentOS, Amazon Linux, etc.)
- ✅ **Root or sudo access**
- ✅ **Domain name** pointing to your server
- ✅ **Port 80 open** (for HTTP validation)
- ✅ **Port 443 open** (for HTTPS)

### **Current Setup**

- **Domain**: `s25cicd.xiaopotato.top`
- **Server**: AWS EC2 (Amazon Linux 2)
- **Web Server**: Nginx
- **Application**: CanadaGoose (Vue.js + Node.js)

---

## 📦 **Installation Methods**

### **Method 1: Snap (Recommended for Ubuntu/Amazon Linux)**

```bash
# Install snapd if not available
sudo yum install -y snapd
sudo systemctl enable --now snapd.socket

# Install Certbot via snap
sudo snap install --classic certbot

# Create symlink for easy access
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### **Method 2: Package Manager**

#### **For Amazon Linux 2 (RHEL/CentOS)**

```bash
# Install EPEL repository
sudo yum install -y epel-release

# Install Certbot
sudo yum install -y certbot python3-certbot-nginx
```

#### **For Ubuntu/Debian**

```bash
# Update package list
sudo apt update

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### **Method 3: Manual Installation**

```bash
# Download Certbot
wget https://dl.eff.org/certbot-auto
chmod a+x certbot-auto

# Move to system path
sudo mv certbot-auto /usr/local/bin/certbot-auto
```

---

## 🔧 **Certificate Generation**

### **Step 1: Stop Web Server (if using --standalone mode)**

```bash
# Stop Nginx temporarily
sudo systemctl stop nginx

# Verify it's stopped
sudo systemctl status nginx
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

#### **Option B: Nginx Plugin Mode (if Nginx plugin is available)**

```bash
# Generate certificate using Nginx plugin
sudo certbot --nginx \
  -d s25cicd.xiaopotato.top \
  --email ray.chenley.up@gmail.com \
  --agree-tos \
  --non-interactive
```

#### **Option C: Webroot Mode (if you want to keep Nginx running)**

```bash
# Create webroot directory
sudo mkdir -p /var/www/.well-known

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
```

---

## ⚙️ **Nginx Configuration**

### **Step 1: Create HTTPS Nginx Configuration**

Create a new configuration file for HTTPS:

```bash
sudo nano /etc/nginx/conf.d/app-https.conf
```

### **Step 2: Add HTTPS Configuration**

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

### **Step 3: Test and Reload Nginx**

```bash
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
sudo systemctl status crond
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
open https://s25cicd.xiaopotato.top/app

# Check for:
# - HTTPS in address bar
# - Security lock icon
# - No mixed content warnings
```

---

## 🔍 **Troubleshooting Common Issues**

### **Issue 1: Certificate Generation Fails**

#### **Problem**: Domain validation fails

```bash
# Check domain DNS resolution
nslookup s25cicd.xiaopotato.top

# Verify port 80 is accessible
sudo netstat -tlnp | grep :80

# Check firewall rules
sudo iptables -L -n
```

#### **Solution**: Ensure domain points to server and port 80 is open

### **Issue 2: Nginx Configuration Errors**

#### **Problem**: SSL certificate not found

```bash
# Check certificate file paths
sudo ls -la /etc/letsencrypt/live/s25cicd.xiaopotato.top/

# Verify file permissions
sudo ls -la /etc/letsencrypt/live/s25cicd.xiaopotato.top/*.pem
```

#### **Solution**: Ensure certificate files exist and are readable

### **Issue 3: Renewal Fails**

#### **Problem**: Automatic renewal not working

```bash
# Check cron job
sudo crontab -l

# Check renewal logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Test manual renewal
sudo certbot renew --dry-run
```

#### **Solution**: Fix cron job or renewal configuration

### **Issue 4: Mixed Content Warnings**

#### **Problem**: HTTP resources loaded over HTTPS

```bash
# Check browser console for mixed content errors
# Look for HTTP URLs in your application code
# Update all internal URLs to use HTTPS
```

#### **Solution**: Ensure all resources use HTTPS URLs

---

## 📊 **Monitoring and Maintenance**

### **Certificate Expiration Monitoring**

```bash
# Check certificate expiration dates
sudo certbot certificates

# Monitor expiration in real-time
watch -n 3600 'sudo certbot certificates'

# Set up email notifications for expiration
# Add to crontab:
# 0 8 * * * /usr/bin/certbot certificates | grep -E "(VALID|EXPIRES)" | mail -s "SSL Certificate Status" ray.chenley.up@gmail.com
```

### **Performance Monitoring**

```bash
# Monitor SSL handshake times
sudo tcpdump -i any -s 0 -w /tmp/ssl.pcap port 443

# Check SSL connection statistics
sudo netstat -an | grep :443 | wc -l

# Monitor Nginx SSL performance
sudo tail -f /var/log/nginx/access.log | grep "443"
```

### **Security Monitoring**

```bash
# Check for SSL vulnerabilities
sudo nmap --script ssl-enum-ciphers -p 443 s25cicd.xiaopotato.top

# Monitor SSL/TLS protocol usage
sudo tcpdump -i any -s 0 -A 'tcp port 443 and (((ip[2:2] - ((ip[0]&0xf)<<2)) - ((tcp[12]&0xf0)>>2)) != 0)'
```

---

## 🚀 **Advanced Configuration**

### **HSTS (HTTP Strict Transport Security)**

```nginx
# Add to Nginx configuration
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

### **OCSP Stapling**

```nginx
# Add to Nginx configuration
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/letsencrypt/live/s25cicd.xiaopotato.top/chain.pem;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
```

### **Multiple Domains**

```bash
# Generate certificate for multiple domains
sudo certbot certonly --standalone \
  -d s25cicd.xiaopotato.top \
  -d www.s25cicd.xiaopotato.top \
  -d api.s25cicd.xiaopotato.top \
  --email ray.chenley.up@gmail.com \
  --agree-tos \
  --non-interactive
```

---

## 📚 **Useful Commands Reference**

### **Certificate Management**

```bash
# List all certificates
sudo certbot certificates

# Delete a certificate
sudo certbot delete --cert-name s25cicd.xiaopotato.top

# Revoke a certificate
sudo certbot revoke --cert-path /etc/letsencrypt/live/s25cicd.xiaopotato.top/cert.pem

# Force renewal
sudo certbot renew --force-renewal
```

### **Plugin Management**

```bash
# Install Nginx plugin
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Install Apache plugin
sudo apt install python3-certbot-apache

# Install standalone plugin
sudo apt install python3-certbot
```

### **Logs and Debugging**

```bash
# View Certbot logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Enable verbose logging
sudo certbot --verbose

# Debug mode
sudo certbot --debug-challenges
```

---

## 🔒 **Security Best Practices**

### **SSL/TLS Configuration**

- ✅ Use **TLS 1.2+** only (disable older protocols)
- ✅ Implement **strong cipher suites**
- ✅ Enable **HSTS** for security headers
- ✅ Use **OCSP stapling** for performance
- ✅ Implement **perfect forward secrecy**

### **Certificate Security**

- ✅ **Automate renewals** to prevent expiration
- ✅ **Monitor expiration dates** regularly
- ✅ **Backup private keys** securely
- ✅ **Use strong key sizes** (RSA 2048+ or ECDSA)
- ✅ **Implement certificate transparency**

### **Server Security**

- ✅ **Keep software updated** (Certbot, Nginx, OS)
- ✅ **Monitor access logs** for suspicious activity
- ✅ **Implement rate limiting** for certificate requests
- ✅ **Use firewall rules** to restrict access
- ✅ **Regular security audits** and penetration testing

---

## 📞 **Support and Resources**

### **Official Documentation**

- **Certbot**: https://certbot.eff.org/
- **Let's Encrypt**: https://letsencrypt.org/docs/
- **ACME Protocol**: https://tools.ietf.org/html/rfc8555

### **Community Resources**

- **Let's Encrypt Community**: https://community.letsencrypt.org/
- **GitHub Issues**: https://github.com/certbot/certbot/issues
- **Stack Overflow**: Tagged with `certbot` and `lets-encrypt`

### **Contact Information**

- **Maintainer**: Ray Chen
- **Email**: ray.chenley.up@gmail.com
- **Project**: CanadaGoose CI/CD Application

---

## ✅ **Implementation Checklist**

### **Pre-Implementation**

- [ ] Domain DNS configured correctly
- [ ] Ports 80 and 443 open in firewall
- [ ] Server has root/sudo access
- [ ] Web server (Nginx) installed and configured

### **Implementation**

- [ ] Certbot installed successfully
- [ ] SSL certificate generated
- [ ] Nginx configured for HTTPS
- [ ] HTTP to HTTPS redirect working
- [ ] All endpoints accessible via HTTPS

### **Post-Implementation**

- [ ] Automatic renewal configured
- [ ] Monitoring and alerting set up
- [ ] Security headers implemented
- [ ] Performance optimized
- [ ] Documentation updated

### **Testing and Verification**

- [ ] SSL certificate valid
- [ ] HTTPS endpoints responding
- [ ] HTTP redirects working
- [ ] No mixed content warnings
- [ ] Browser security indicators showing

---

## 🎉 **Success Indicators**

Your HTTPS implementation is successful when:

1. ✅ **Browser shows security lock icon**
2. ✅ **URL starts with `https://`**
3. ✅ **No mixed content warnings**
4. ✅ **SSL Labs gives A+ rating**
5. ✅ **Automatic renewal working**
6. ✅ **All endpoints accessible via HTTPS**
7. ✅ **HTTP requests redirect to HTTPS**

---

## 📝 **Notes**

- **Certificate Validity**: 90 days
- **Renewal Frequency**: Daily attempts (cron job)
- **Backup Location**: `/etc/letsencrypt/`
- **Log Location**: `/var/log/letsencrypt/`
- **Configuration**: `/etc/nginx/conf.d/app-https.conf`

---

**Last Updated**: August 12, 2025  
**Version**: 1.0  
**Status**: ✅ **READY FOR IMPLEMENTATION**
