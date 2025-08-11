#!/bin/bash
set -e

# Deploy App Script for CanadaGoose
# This script handles deploying the Vue.js SPA and restarting services

echo "🚀 Starting CanadaGoose app deployment..."

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Set variables
APP_DIR="/var/www/app"
BACKUP_DIR="/var/www/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

print_status "Setting up deployment environment..."

# Create backup directory if it doesn't exist
sudo mkdir -p "$BACKUP_DIR"

# Create app directory if it doesn't exist
sudo mkdir -p "$APP_DIR"

# Check if there's a new build to deploy
if [ ! -f "/tmp/canadagoose-build.tar.gz" ]; then
    print_warning "No build file found at /tmp/canadagoose-build.tar.gz"
    print_status "Please upload your built Vue.js app first"
    exit 1
fi

print_status "Creating backup of current app..."
if [ -d "$APP_DIR" ] && [ "$(ls -A $APP_DIR)" ]; then
    sudo tar -czf "$BACKUP_DIR/app-backup-$TIMESTAMP.tar.gz" -C /var/www app
    print_success "Backup created: app-backup-$TIMESTAMP.tar.gz"
fi

print_status "Deploying new app..."
# Remove old app content
sudo rm -rf "$APP_DIR"/*

# Extract new build
sudo tar -xzf "/tmp/canadagoose-build.tar.gz" -C /var/www/

# Set proper permissions
sudo chown -R nginx:nginx "$APP_DIR"
sudo chmod -R 755 "$APP_DIR"

print_success "App deployed successfully!"

print_status "Restarting services..."
# Restart Nginx
if sudo systemctl restart nginx; then
    print_success "Nginx restarted successfully"
else
    print_error "Failed to restart Nginx"
    exit 1
fi

# Restart PM2 processes
if pm2 restart all; then
    print_success "PM2 processes restarted successfully"
else
    print_warning "PM2 restart failed, trying to start processes..."
    pm2 start ecosystem.config.js
fi

# Clean up build file
sudo rm -f "/tmp/canadagoose-build.tar.gz"

print_success "🎉 Deployment completed successfully!"
print_status "Your app is now available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/app"

# Show PM2 status
echo ""
print_status "Current PM2 status:"
pm2 status

# Show Nginx status
echo ""
print_status "Nginx status:"
sudo systemctl status nginx --no-pager -l 


