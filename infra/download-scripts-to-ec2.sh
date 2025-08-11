#!/bin/bash
set -e

# Download Server Scripts from S3 to EC2
# This script downloads the server management scripts from S3 to the EC2 instance

echo "📥 Downloading server scripts from S3 to EC2 instance..."

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

# Get the S3 bucket name from Terraform output
print_status "Getting S3 bucket name from Terraform..."
S3_BUCKET=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "")

if [ -z "$S3_BUCKET" ]; then
    print_error "Could not get S3 bucket name from Terraform output. Please run terraform apply first."
    exit 1
fi

print_status "Using S3 bucket: $S3_BUCKET"

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

# Download scripts from S3 to EC2 instance
print_status "Downloading scripts from S3 to EC2 instance..."
ssh -i ssh_key -o StrictHostKeyChecking=no ec2-user@$EC2_PUBLIC_IP << EOF
    echo "Starting script download process..."
    
    # Create server-scripts directory if it doesn't exist
    mkdir -p /opt/app/server-scripts
    
    # Check if AWS CLI is available
    if ! command -v aws &> /dev/null; then
        echo "AWS CLI not found. Installing..."
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
        unzip awscliv2.zip
        sudo ./aws/install
        rm -rf aws awscliv2.zip
    fi
    
    # Download scripts from S3
    echo "Downloading scripts from S3..."
    aws s3 cp s3://$S3_BUCKET/server-scripts/ /opt/app/server-scripts/ --recursive --region us-east-1
    
    # Make scripts executable
    echo "Making scripts executable..."
    chmod +x /opt/app/server-scripts/*.sh
    
    # List downloaded files
    echo ""
    echo "📁 Downloaded scripts:"
    ls -la /opt/app/server-scripts/
    
    # Verify scripts are executable
    echo ""
    echo "🔐 Script permissions:"
    ls -la /opt/app/server-scripts/*.sh
    
    # Test a few key scripts
    echo ""
    echo "🧪 Testing script functionality..."
    
    if [ -f "/opt/app/server-scripts/check-status.sh" ]; then
        echo "✅ check-status.sh is available and executable"
    else
        echo "❌ check-status.sh not found"
    fi
    
    if [ -f "/opt/app/server-scripts/deploy-app.sh" ]; then
        echo "✅ deploy-app.sh is available and executable"
    else
        echo "❌ deploy-app.sh not found"
    fi
    
    if [ -f "/opt/app/server-scripts/restart-services.sh" ]; then
        echo "✅ restart-services.sh is available and executable"
    else
        echo "❌ restart-services.sh not found"
    fi
    
    echo ""
    echo "🎉 Script download and setup completed successfully!"
EOF

if [ $? -eq 0 ]; then
    print_success "✅ Scripts successfully downloaded to EC2 instance!"
    
    # Show next steps
    echo ""
    print_status "🚀 Next steps:"
    echo "1. SSH into your instance: ssh -i ssh_key ec2-user@$EC2_PUBLIC_IP"
    echo "2. Check server status: cd /opt/app/server-scripts && ./check-status.sh"
    echo "3. Deploy your application: ./deploy-app.sh"
    echo "4. Restart services if needed: ./restart-services.sh"
    
else
    print_error "Script download failed. Please check the error messages above."
    exit 1
fi

echo ""
print_success "🎉 Script deployment to EC2 completed successfully!" 