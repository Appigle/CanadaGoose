#!/bin/bash
set -e

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

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed. Please install Terraform >= 1.6.0"
        exit 1
    fi
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install and configure AWS CLI"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure'"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Generate SSH key if it doesn't exist
generate_ssh_key() {
    if [ ! -f "ssh_key.pub" ]; then
        print_status "Generating SSH key pair..."
        ssh-keygen -t rsa -b 4096 -f ssh_key -N "" -C "canadagoose-terraform"
        print_success "SSH key pair generated"
    else
        print_status "SSH key pair already exists"
    fi
}

# Check if terraform.tfvars exists
check_config() {
    if [ ! -f "terraform.tfvars" ]; then
        print_warning "terraform.tfvars not found. Creating from example..."
        if [ -f "terraform.tfvars.example" ]; then
            cp terraform.tfvars.example terraform.tfvars
            print_warning "Please edit terraform.tfvars with your actual values before continuing"
            print_warning "Press Enter when ready to continue..."
            read
        else
            print_error "terraform.tfvars.example not found. Please create terraform.tfvars manually"
            exit 1
        fi
    fi
}

# Initialize Terraform
init_terraform() {
    print_status "Initializing Terraform..."
    terraform init
    print_success "Terraform initialized"
}

# Plan deployment
plan_deployment() {
    print_status "Planning deployment..."
    terraform plan
    print_success "Deployment plan completed"
}

# Apply deployment
apply_deployment() {
    print_status "Applying infrastructure deployment..."
    print_warning "This will create AWS resources and may incur costs"
    print_warning "Press Enter to continue or Ctrl+C to abort..."
    read
    
    terraform apply -auto-approve
    print_success "Infrastructure deployment completed!"
}

# Show outputs
show_outputs() {
    print_status "Infrastructure outputs:"
    terraform output
    
    print_status "Deployment completed successfully!"
    print_status "Next steps:"
    echo "1. SSH into your EC2 instance using the provided command"
    echo "2. Deploy your Vue.js SPA to /var/www/app/"
    echo "3. Configure Cloudflare DNS to point to the EC2 public IP"
    echo "4. Access your application at the provided URLs"
}

# Main deployment flow
main() {
    echo "🦢 CanadaGoose Infrastructure Deployment"
    echo "========================================"
    echo
    
    check_prerequisites
    generate_ssh_key
    check_config
    init_terraform
    plan_deployment
    apply_deployment
    show_outputs
}

# Run main function
main "$@" 