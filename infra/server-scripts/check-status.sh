#!/bin/bash
set -e

# Check Status Script for CanadaGoose
# This script checks the status of all services and system resources

echo "📊 Checking CanadaGoose server status..."

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

echo ""
print_status "=== SYSTEM RESOURCES ==="
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1

echo ""
echo "Memory Usage:"
free -h

echo ""
echo "Disk Usage:"
df -h

echo ""
print_status "=== NETWORK STATUS ==="
echo "Public IP:"
curl -s http://169.254.169.254/latest/meta-data/public-ipv4

echo ""
echo "Network Interfaces:"
ifconfig 2>/dev/null | grep -E "inet.*eth0|inet.*ens5" || echo "Network interface information not available"

echo ""
print_status "=== SERVICE STATUS ==="
echo "Nginx Status:"
sudo systemctl status nginx --no-pager -l

echo ""
print_status "=== PM2 PROCESSES ==="
pm2 status

echo ""
print_status "=== APPLICATION STATUS ==="
echo "App Directory:"
ls -la /var/www/app/

echo ""
echo "Backup Directory:"
ls -la /var/www/backups/ 2>/dev/null || echo "Backup directory not found"

echo ""
print_status "=== LOG FILES ==="
echo "Nginx Error Log (last 10 lines):"
sudo tail -n 10 /var/log/nginx/error.log

echo ""
echo "PM2 Logs:"
pm2 logs --lines 5

echo ""
print_status "=== SECURITY STATUS ==="
echo "Firewall Status:"
sudo systemctl status firewalld --no-pager -l 2>/dev/null || echo "Firewalld not installed"

echo ""
echo "SSH Service Status:"
sudo systemctl status sshd --no-pager -l

print_success "🎉 Status check completed!" 