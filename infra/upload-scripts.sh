#!/bin/bash
set -e

# Upload Server Scripts to S3 and Deploy to EC2
# This script uploads the server management scripts to S3 and then deploys them to the EC2 instance

echo "🚀 Uploading server scripts to S3 and deploying to EC2..."

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

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

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

# Get the S3 bucket name from Terraform output or variables
print_status "Getting S3 bucket name from Terraform..."

# Check if Terraform is initialized
if [ ! -d ".terraform" ]; then
    print_status "Terraform not initialized. Running terraform init..."
    terraform init
fi

# Get the S3 bucket name
S3_BUCKET=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "")

if [ -z "$S3_BUCKET" ]; then
    print_warning "Could not get S3 bucket name from Terraform output."
    print_status "Please provide the S3 bucket name manually:"
    read -p "S3 Bucket Name: " S3_BUCKET
    
    if [ -z "$S3_BUCKET" ]; then
        print_error "S3 bucket name is required."
        exit 1
    fi
fi

print_status "Using S3 bucket: $S3_BUCKET"

# Check if the bucket exists
if ! aws s3 ls "s3://$S3_BUCKET" &> /dev/null; then
    print_error "S3 bucket $S3_BUCKET does not exist or is not accessible."
    print_status "Please deploy the infrastructure first with: ./deploy.sh"
    exit 1
fi

# Get EC2 public IP from Terraform output
print_status "Getting EC2 public IP from Terraform..."
EC2_PUBLIC_IP=$(terraform output -raw ec2_public_ip 2>/dev/null || echo "")

if [ -z "$EC2_PUBLIC_IP" ]; then
    print_warning "Could not get EC2 public IP from Terraform output."
    print_status "Please provide the EC2 public IP manually:"
    read -p "EC2 Public IP: " EC2_PUBLIC_IP
    
    if [ -z "$EC2_PUBLIC_IP" ]; then
        print_error "EC2 public IP is required."
        exit 1
    fi
fi

print_status "Using EC2 public IP: $EC2_PUBLIC_IP"

# Create a temporary directory for scripts
TEMP_DIR=$(mktemp -d)
print_status "Creating temporary directory: $TEMP_DIR"

# Copy server scripts to temp directory
print_status "Copying server scripts..."
cp server-scripts/*.sh "$TEMP_DIR/"

# Upload scripts to S3
print_status "Uploading scripts to S3..."
aws s3 cp "$TEMP_DIR/" "s3://$S3_BUCKET/server-scripts/" --recursive

# Clean up temp directory
rm -rf "$TEMP_DIR"

print_success "✅ Server scripts uploaded successfully to S3!"
print_status "Scripts are now available at: s3://$S3_BUCKET/server-scripts/"

# List uploaded files
echo ""
print_status "Uploaded files:"
aws s3 ls "s3://$S3_BUCKET/server-scripts/" --recursive

# SSH into EC2 instance and download scripts
echo ""
print_status "Connecting to EC2 instance and downloading scripts..."

# Test SSH connection first
print_status "Testing SSH connection..."
if ! ssh -i ssh_key -o ConnectTimeout=10 -o StrictHostKeyChecking=no ec2-user@$EC2_PUBLIC_IP "echo 'SSH connection successful'" 2>/dev/null; then
    print_warning "SSH connection failed. This might be normal if the instance is still starting up."
    print_status "You can manually download the scripts later with:"
    echo ""
    echo "ssh -i ssh_key ec2-user@$EC2_PUBLIC_IP"
    echo "aws s3 cp s3://$S3_BUCKET/server-scripts/ /opt/app/server-scripts/ --recursive --region us-east-1"
    echo "chmod +x /opt/app/server-scripts/*.sh"
    echo ""
    print_success "🎉 Script upload completed! You can now deploy your infrastructure."
    print_status "Run: ./deploy.sh"
    exit 0
fi

# Download scripts from S3 to EC2 instance
print_status "Downloading scripts from S3 to EC2 instance..."
ssh -i ssh_key -o StrictHostKeyChecking=no ec2-user@$EC2_PUBLIC_IP << EOF
    echo "Downloading server scripts from S3..."
    
    # Create server-scripts directory if it doesn't exist
    mkdir -p /opt/app/server-scripts
    
    # Download scripts from S3
    aws s3 cp s3://$S3_BUCKET/server-scripts/ /opt/app/server-scripts/ --recursive --region us-east-1
    
    # Make scripts executable
    chmod +x /opt/app/server-scripts/*.sh
    
    # List downloaded files
    echo "Downloaded scripts:"
    ls -la /opt/app/server-scripts/
    
    # Verify scripts are executable
    echo "Script permissions:"
    ls -la /opt/app/server-scripts/*.sh
    
    echo "Scripts downloaded and made executable successfully!"
EOF

if [ $? -eq 0 ]; then
    print_success "✅ Scripts successfully downloaded to EC2 instance!"
else
    print_warning "Script download had some issues. You can manually download them later."
fi

echo ""
print_success "🎉 Complete script deployment completed!"
print_status "Scripts are now available on both S3 and the EC2 instance."
print_status "You can now run: ./deploy.sh" 