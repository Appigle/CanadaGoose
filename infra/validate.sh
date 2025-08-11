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

# Check if Terraform is installed
check_terraform() {
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed. Please install Terraform >= 1.6.0"
        exit 1
    fi
    
    # Check Terraform version
    TERRAFORM_VERSION=$(terraform version -json | jq -r '.terraform_version' 2>/dev/null || echo "unknown")
    print_status "Terraform version: $TERRAFORM_VERSION"
}

# Format Terraform files
format_terraform() {
    print_status "Formatting Terraform files..."
    terraform fmt -recursive
    print_success "Terraform files formatted"
}

# Validate Terraform configuration
validate_terraform() {
    print_status "Validating Terraform configuration..."
    
    # Initialize Terraform (download providers)
    terraform init -backend=false
    
    # Validate the configuration
    if terraform validate; then
        print_success "Terraform configuration is valid"
    else
        print_error "Terraform configuration validation failed"
        exit 1
    fi
}

# Check for common issues
check_common_issues() {
    print_status "Checking for common configuration issues..."
    
    # Check if required files exist
    REQUIRED_FILES=("main.tf" "variables.tf" "outputs.tf" "versions.tf" "providers.tf")
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "$file" ]; then
            print_success "✓ $file exists"
        else
            print_error "✗ $file missing"
            exit 1
        fi
    done
    
    # Check if SSH key exists
    if [ -f "ssh_key.pub" ]; then
        print_success "✓ SSH public key exists"
    else
        print_warning "⚠ SSH public key not found (will be generated during deployment)"
    fi
    
    # Check if terraform.tfvars exists
    if [ -f "terraform.tfvars" ]; then
        print_success "✓ terraform.tfvars exists"
    else
        print_warning "⚠ terraform.tfvars not found (use terraform.tfvars.example as template)"
    fi
    
    print_success "Common issues check completed"
}

# Show configuration summary
show_summary() {
    print_status "Configuration Summary:"
    echo
    
    # Count resources
    RESOURCE_COUNT=$(grep -c "^resource" main.tf 2>/dev/null || echo "0")
    echo "📊 Resources to be created: $RESOURCE_COUNT"
    
    # Show key variables
    echo "🔧 Key Configuration:"
    echo "   - Project: canadagoose"
    echo "   - Environment: dev"
    echo "   - AWS Region: us-east-1"
    echo "   - Instance Type: t3.micro"
    echo "   - Database: MySQL db.t3.micro"
    echo "   - Storage: 20GB encrypted"
    
    echo
    print_success "Validation completed successfully!"
    print_status "Run './deploy.sh' to deploy your infrastructure"
}

# Main validation flow
main() {
    echo "🔍 CanadaGoose Infrastructure Validation"
    echo "======================================="
    echo
    
    check_terraform
    format_terraform
    validate_terraform
    check_common_issues
    show_summary
}

# Run main function
main "$@" 