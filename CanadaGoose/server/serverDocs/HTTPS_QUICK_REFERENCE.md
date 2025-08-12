# HTTPS Quick Reference Card

## 🚀 **Quick Commands**

### **Certificate Management**

```bash
# Generate new certificate
sudo certbot certonly --standalone -d s25cicd.xiaopotato.top

# Check certificate status
sudo certbot certificates

# Test renewal (dry run)
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal
```

### **Nginx Management**

```bash
# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Restart nginx
sudo systemctl restart nginx

# Check nginx status
sudo systemctl status nginx
```

### **Testing HTTPS**

```bash
# Test HTTPS endpoint
curl -I https://s25cicd.xiaopotato.top/app

# Test HTTP redirect
curl -I http://s25cicd.xiaopotato.top/app

# Test API
curl -I https://s25cicd.xiaopotato.top/api/healthcheck
```

## 🔧 **Key Files**

### **Nginx Configuration**

- **File**: `/etc/nginx/conf.d/app.conf`
- **SSL Cert**: `/etc/letsencrypt/live/s25cicd.xiaopotato.top/fullchain.pem`
- **SSL Key**: `/etc/letsencrypt/live/s25cicd.xiaopotato.top/privkey.pem`

### **Environment Files**

- **Frontend**: `CanadaGoose/client/env.production`
- **Backend**: `CanadaGoose/server/.env`

## 📅 **Auto-Renewal**

### **Cron Job**

```bash
# Edit crontab
sudo crontab -e

# Add this line (daily at 2:30 AM)
30 2 * * * /usr/bin/certbot renew --quiet --pre-hook "systemctl stop nginx" --post-hook "systemctl start nginx"
```

### **Manual Renewal**

```bash
# Stop nginx
sudo systemctl stop nginx

# Renew certificate
sudo certbot renew

# Start nginx
sudo systemctl start nginx
```

## 🚨 **Troubleshooting**

### **Common Issues**

```bash
# Port 80 in use
sudo netstat -tlnp | grep :80

# SSL configuration errors
sudo nginx -t

# Certificate validation
sudo certbot certificates

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### **Quick Fixes**

```bash
# Restart nginx
sudo systemctl restart nginx

# Check SSL paths
sudo ls -la /etc/letsencrypt/live/s25cicd.xiaopotato.top/

# Verify ports
sudo netstat -tlnp | grep -E ':(80|443)'
```

## 📊 **Monitoring**

### **Certificate Status**

```bash
# Check expiration
sudo certbot certificates

# Monitor logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# SSL handshake test
openssl s_client -connect s25cicd.xiaopotato.top:443
```

### **Performance**

```bash
# SSL configuration
sudo nginx -T | grep ssl_

# Connection status
sudo systemctl status nginx

# Error monitoring
sudo tail -f /var/log/nginx/error.log
```

## 🌐 **URLs**

- **Frontend**: `https://s25cicd.xiaopotato.top/app`
- **API**: `https://s25cicd.xiaopotato.top/api`
- **Health**: `https://s25cicd.xiaopotato.top/health`
- **HTTP**: Automatically redirects to HTTPS

## ⚠️ **Important Notes**

- **Certificates expire** every 90 days
- **Auto-renewal** runs daily at 2:30 AM
- **Port 443** must be open in EC2 security groups
- **Domain must be publicly accessible** for validation
- **Nginx stops briefly** during certificate renewal

## 📞 **Emergency Contacts**

- **Maintenance**: Ray Chen
- **Email**: ray.chenley.up@gmail.com
- **Next Review**: November 10, 2025
- **Full Documentation**: `HTTPS_UPGRADE_GUIDE.md`

---

**Last Updated**: August 12, 2025  
**Version**: 1.0.0
