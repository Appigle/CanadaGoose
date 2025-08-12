# HTTPS Upgrade Guide for CanadaGoose Application

## 📋 **Overview**

This document outlines the complete process of upgrading the CanadaGoose application from HTTP to HTTPS using Let's Encrypt SSL certificates and Certbot on AWS EC2.

## 🎯 **Implementation Details**

- **Domain**: `s25cicd.xiaopotato.top`
- **SSL Provider**: Let's Encrypt (Free)
- **Certificate Management**: Certbot
- **Web Server**: Nginx
- **Infrastructure**: AWS EC2
- **Auto-Renewal**: Enabled (90-day certificates)

---

## 🚀 **Phase 1: Prerequisites**

### **System Requirements**

- ✅ EC2 instance running Amazon Linux 2
- ✅ Nginx web server installed and configured
- ✅ Domain DNS pointing to EC2 instance
- ✅ Port 80 and 443 open in EC2 security groups
- ✅ Public internet access for Let's Encrypt validation

### **Current Configuration**

- **Frontend**: Served from `/var/www/app`
- **Backend API**: Proxied to `localhost:3000`
- **Domain**: `s25cicd.xiaopotato.top`

---

## 🔧 **Phase 2: Installation & Setup**

### **Step 1: Install Certbot**

```bash
# Connect to EC2 instance
ssh -i ../../infra/ssh_key ec2-user@44.195.110.182

# Update system packages
sudo yum update -y

# Install EPEL repository
sudo amazon-linux-extras install epel -y

# Install Certbot
sudo yum install -y certbot
```

### **Step 2: Generate SSL Certificate**

```bash
# Stop nginx (free up port 80 for validation)
sudo systemctl stop nginx

# Generate SSL certificate using standalone mode
sudo certbot certonly --standalone -d s25cicd.xiaopotato.top

# During the process, provide:
# - Email: ray.chenley.up@gmail.com
# - Agree to terms: Y
# - Share email with EFF: N (recommended)

# Start nginx again
sudo systemctl start nginx
```

### **Step 3: Verify Certificate Installation**

```bash
# Check certificate status
sudo certbot certificates

# Test certificate renewal (dry run)
sudo certbot renew --dry-run

# Certificate location: /etc/letsencrypt/live/s25cicd.xiaopotato.top/
```

---

## 📝 **Phase 3: Nginx Configuration**

### **HTTPS Configuration File**

**File**: `/etc/nginx/conf.d/app.conf`

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name s25cicd.xiaopotato.top;
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

### **Apply Configuration**

```bash
# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Check nginx status
sudo systemctl status nginx
```

---

## 🧪 **Phase 4: Testing & Validation**

### **Local Testing (from EC2)**

```bash
# Test HTTPS endpoint
curl -k https://localhost/app

# Test HTTP redirect
curl -I http://localhost/app
```

### **External Testing**

```bash
# Test HTTPS (should work)
curl -I https://s25cicd.xiaopotato.top/app

# Test HTTP (should redirect to HTTPS)
curl -I http://s25cicd.xiaopotato.top/app

# Test API endpoints
curl -I https://s25cicd.xiaopotato.top/api/healthcheck
curl -I https://s25cicd.xiaopotato.top/api/version
```

### **Certificate Validation**

```bash
# Check certificate validity
openssl s_client -connect s25cicd.xiaopotato.top:443 -servername s25cicd.xiaopotato.top < /dev/null 2>/dev/null | openssl x509 -noout -dates

# Verify certificate chain
openssl s_client -connect s25cicd.xiaopotato.top:443 -servername s25cicd.xiaopotato.top < /dev/null 2>/dev/null | openssl x509 -noout -text
```

---

## 🔄 **Phase 5: Auto-Renewal Setup**

### **Cron Job Configuration**

```bash
# Edit crontab
sudo crontab -e

# Add this line (runs daily at 2:30 AM)
30 2 * * * /usr/bin/certbot renew --quiet --pre-hook "systemctl stop nginx" --post-hook "systemctl start nginx"
```

### **Test Auto-Renewal**

```bash
# Test renewal process (dry run)
sudo certbot renew --dry-run

# Check renewal logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

---

## 🌐 **Phase 6: Application Updates**

### **Frontend Environment Variables**

**File**: `CanadaGoose/client/env.production`

```bash
VITE_API_BASE_URL=https://s25cicd.xiaopotato.top
VITE_API_URL=https://s25cicd.xiaopotato.top/api
VITE_FRONTEND_URL=https://s25cicd.xiaopotato.top
```

### **Backend Environment Variables**

**File**: `CanadaGoose/server/.env`

```bash
FRONTEND_URL=https://s25cicd.xiaopotato.top
CORS_ORIGIN=https://s25cicd.xiaopotato.top
API_BASE_URL=https://s25cicd.xiaopotato.top/api
```

### **Deploy Updated Application**

```bash
# Deploy backend with HTTPS configuration
cd CanadaGoose/server
./scripts/deploy-to-aws.sh

# Deploy frontend with HTTPS configuration
cd ../client
./scripts/deploy-to-aws.sh
```

---

## 📊 **Phase 7: Monitoring & Maintenance**

### **Certificate Status Monitoring**

```bash
# Check certificate expiration
sudo certbot certificates

# Monitor renewal logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### **Performance Monitoring**

```bash
# Check SSL configuration
sudo nginx -T | grep -A 20 "ssl_"

# Monitor nginx status
sudo systemctl status nginx

# Check SSL handshake performance
curl -w "@curl-format.txt" -o /dev/null -s "https://s25cicd.xiaopotato.top/app"
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. Certificate Generation Failed**

```bash
# Check if port 80 is available
sudo netstat -tlnp | grep :80

# Verify domain resolution
nslookup s25cicd.xiaopotato.top

# Check firewall settings
sudo iptables -L
```

#### **2. Nginx Configuration Errors**

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Verify certificate paths
sudo ls -la /etc/letsencrypt/live/s25cicd.xiaopotato.top/
```

#### **3. SSL Handshake Failures**

```bash
# Test SSL connection
openssl s_client -connect s25cicd.xiaopotato.top:443

# Check certificate validity
sudo certbot certificates

# Verify nginx is listening on port 443
sudo netstat -tlnp | grep :443
```

### **Recovery Procedures**

#### **Certificate Renewal Failure**

```bash
# Manual renewal
sudo certbot renew --force-renewal

# If still failing, regenerate certificate
sudo certbot certonly --standalone -d s25cicd.xiaopotato.top --force-renewal
```

#### **Nginx SSL Issues**

```bash
# Restart nginx
sudo systemctl restart nginx

# Check SSL configuration
sudo nginx -T | grep ssl_certificate

# Verify certificate permissions
sudo ls -la /etc/letsencrypt/live/s25cicd.xiaopotato.top/
```

---

## 📈 **Performance & Security**

### **SSL Configuration Optimization**

- **TLS 1.2 and 1.3** enabled
- **Modern cipher suites** for security
- **Session caching** for performance
- **OCSP stapling** (if supported)

### **Security Headers**

- **HSTS** with preload and subdomains
- **X-Frame-Options** to prevent clickjacking
- **X-Content-Type-Options** to prevent MIME sniffing
- **X-XSS-Protection** for XSS protection

### **Performance Features**

- **HTTP/2** support enabled
- **Gzip compression** for static assets
- **Static asset caching** with long expiration
- **Connection keep-alive** optimization

---

## 🔍 **Verification Checklist**

### **Pre-Implementation**

- [ ] EC2 security groups allow ports 80 and 443
- [ ] Domain DNS points to EC2 instance
- [ ] Nginx is running and accessible
- [ ] Port 80 is available for validation

### **Post-Implementation**

- [ ] SSL certificate generated successfully
- [ ] Nginx configuration updated for HTTPS
- [ ] HTTP to HTTPS redirects working
- [ ] All endpoints accessible via HTTPS
- [ ] Auto-renewal configured and tested
- [ ] Application environment variables updated
- [ ] Frontend and backend deployed with HTTPS

### **Ongoing Monitoring**

- [ ] Certificate expiration monitoring
- [ ] Auto-renewal success tracking
- [ ] SSL handshake performance
- [ ] Security header validation
- [ ] Error log monitoring

---

## 📚 **Additional Resources**

### **Documentation**

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot User Guide](https://certbot.eff.org/docs/)
- [Nginx SSL Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)

### **Tools**

- [SSL Labs Server Test](https://www.ssllabs.com/ssltest/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [SSL Checker](https://www.sslshopper.com/ssl-checker.html)

### **Support**

- [Let's Encrypt Community](https://community.letsencrypt.org/)
- [Certbot GitHub Issues](https://github.com/certbot/certbot/issues)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## 📝 **Change Log**

| Date       | Version | Changes                          | Author   |
| ---------- | ------- | -------------------------------- | -------- |
| 2025-08-12 | 1.0.0   | Initial HTTPS implementation     | Ray Chen |
| 2025-08-12 | 1.0.1   | Added auto-renewal configuration | Ray Chen |
| 2025-08-12 | 1.0.2   | Added troubleshooting section    | Ray Chen |

---

## ✅ **Conclusion**

This HTTPS upgrade provides:

- **Secure communication** between users and your application
- **Professional appearance** with browser security indicators
- **SEO benefits** from HTTPS preference
- **Compliance** with modern web security standards
- **Zero ongoing costs** for SSL certificates

The implementation is production-ready with automatic certificate renewal and comprehensive monitoring capabilities.

---

**Last Updated**: August 12, 2025  
**Next Review**: November 10, 2025 (Certificate expiration)  
**Maintained By**: Ray Chen  
**Contact**: ray.chenley.up@gmail.com
