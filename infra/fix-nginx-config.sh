#!/bin/bash
set -e

# Fix Nginx Configuration Script
# This script fixes the Nginx configuration to resolve routing issues

echo "🔧 Fixing Nginx configuration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "main.tf" ]; then
    print_error "Please run this script from the infra directory (where main.tf is located)"
    exit 1
fi

# Check if SSH key exists
if [ ! -f "ssh_key" ]; then
    print_error "SSH key 'ssh_key' not found. Please ensure you have the private key for EC2 access."
    exit 1
fi

# Set proper permissions for SSH key
chmod 600 ssh_key

# Get EC2 public IP from Terraform output
print_status "Getting EC2 public IP from Terraform..."
EC2_PUBLIC_IP=$(terraform output -raw ec2_public_ip 2>/dev/null || echo "")

if [ -z "$EC2_PUBLIC_IP" ]; then
    print_error "Could not get EC2 public IP from Terraform output. Please run terraform apply first."
    exit 1
fi

print_status "Using EC2 public IP: $EC2_PUBLIC_IP"

# Test SSH connection
print_status "Testing SSH connection to EC2 instance..."
if ! ssh -i ssh_key -o ConnectTimeout=10 -o StrictHostKeyChecking=no ec2-user@$EC2_PUBLIC_IP "echo 'SSH connection successful'" 2>/dev/null; then
    print_error "SSH connection failed. Please check:"
    print_error "1. EC2 instance is running"
    print_error "2. Security group allows SSH (port 22)"
    print_error "3. SSH key is correct"
    print_error "4. Instance is fully booted"
    exit 1
fi

print_success "✅ SSH connection successful!"

# Fix Nginx configuration
print_status "Fixing Nginx configuration..."
ssh -i ssh_key -o StrictHostKeyChecking=no ec2-user@$EC2_PUBLIC_IP << 'EOF'
    echo "Creating corrected Nginx configuration..."
    
    # Backup current config
    sudo cp /etc/nginx/conf.d/app.conf /etc/nginx/conf.d/app.conf.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo "No existing config to backup"
    
    # Create new configuration
    sudo tee /etc/nginx/conf.d/app.conf > /dev/null << 'NGINX_CONFIG'
server {
    listen 80;
    server_name s25cicd.xiaopotato.top;

    # Cloudflare proxies HTTPS; we serve plain HTTP to CF
    root /var/www/app;
    index index.html;

    # SPA router - serve index.html for all frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API reverse proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }

    # Health check endpoint - proxy to backend
    location /health {
        proxy_pass http://127.0.0.1:3000/api/healthcheck;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Upstream connection for WebSocket support
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}
NGINX_CONFIG
    
    # Test Nginx configuration
    echo "Testing Nginx configuration..."
    if sudo nginx -t; then
        echo "✅ Nginx configuration is valid"
        
        # Reload Nginx
        echo "Reloading Nginx..."
        sudo systemctl reload nginx
        
        # Check Nginx status
        echo "Nginx status:"
        sudo systemctl status nginx --no-pager -l
    else
        echo "❌ Nginx configuration is invalid"
        exit 1
    fi
    
    echo "✅ Nginx configuration fixed successfully!"
EOF

if [ $? -eq 0 ]; then
    print_success "✅ Nginx configuration fixed successfully!"
    
    # Test the health endpoint
    print_status "Testing health endpoint..."
    sleep 2  # Wait for Nginx to reload
    
    HEALTH_RESPONSE=$(curl -s "http://$EC2_PUBLIC_IP/health" 2>/dev/null || echo "Connection failed")
    echo "Health endpoint response: $HEALTH_RESPONSE"
    
    if [[ "$HEALTH_RESPONSE" == *"Connection refused"* ]]; then
        print_warning "Health endpoint still has issues. Checking backend status..."
        
        # Check if backend is running
        ssh -i ssh_key -o StrictHostKeyChecking=no ec2-user@$EC2_PUBLIC_IP << 'EOF'
            echo "Checking backend status..."
            pm2 status
            echo ""
            echo "Checking backend logs..."
            pm2 logs --lines 5
EOF
    else
        print_success "✅ Health endpoint is working!"
    fi
    
else
    print_error "Failed to fix Nginx configuration. Please check the error messages above."
    exit 1
fi

echo ""
print_success "🎉 Nginx configuration fix completed!"
print_status "Your server should now handle routing correctly." 