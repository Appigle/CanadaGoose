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

# Check if Terraform is initialized
check_terraform() {
    if [ ! -d ".terraform" ]; then
        print_error "Terraform not initialized. Run 'terraform init' first."
        exit 1
    fi
}

# Destroy infrastructure
destroy_infrastructure() {
    print_warning "⚠️  WARNING: This will destroy ALL infrastructure resources!"
    print_warning "This includes:"
    echo "   - EC2 instance"
    echo "   - RDS database (ALL DATA WILL BE LOST)"
    echo "   - VPC and networking"
    echo "   - Security groups"
    echo "   - Secrets Manager secrets"
    echo "   - IAM roles and policies"
    echo
    
    print_warning "Press Enter to continue or Ctrl+C to abort..."
    read
    
    print_status "Destroying infrastructure..."
    terraform destroy -auto-approve
    
    print_success "Infrastructure destroyed successfully!"
}

# Clean up local files
cleanup_local() {
    print_status "Cleaning up local files..."
    
    # Remove Terraform files
    rm -rf .terraform
    rm -f .terraform.lock.hcl
    
    # Remove SSH keys (optional)
    if [ -f "ssh_key" ]; then
        print_warning "Remove SSH private key? (y/N)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            rm -f ssh_key
            print_success "SSH private key removed"
        fi
    fi
    
    print_success "Cleanup completed"
}

# Main destroy flow
main() {
    echo "🗑️  CanadaGoose Infrastructure Destruction"
    echo "=========================================="
    echo
    
    check_terraform
    destroy_infrastructure
    cleanup_local
    
    echo
    print_success "All done! Infrastructure has been completely removed."
}

# Run main function
main "$@" 