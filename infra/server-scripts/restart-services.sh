#!/bin/bash
set -e

# Restart Services Script for CanadaGoose
# This script restarts Nginx and PM2 processes

echo "🔄 Restarting CanadaGoose services..."

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

print_status "Restarting Nginx..."
if sudo systemctl restart nginx; then
    print_success "Nginx restarted successfully"
else
    print_error "Failed to restart Nginx"
    exit 1
fi

print_status "Restarting PM2 processes..."
if pm2 restart all; then
    print_success "PM2 processes restarted successfully"
else
    print_warning "PM2 restart failed, trying to start processes..."
    pm2 start ecosystem.config.js
fi

print_status "Checking service status..."

# Check Nginx status
echo ""
print_status "Nginx status:"
sudo systemctl status nginx --no-pager -l

# Check PM2 status
echo ""
print_status "PM2 status:"
pm2 status

print_success "🎉 All services restarted successfully!" 