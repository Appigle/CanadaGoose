#!/bin/bash

# CloudWatch Deployment Script for CanadaGoose
# This script deploys CloudWatch monitoring resources

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

# Check if we're in the right directory
if [ ! -f "main.tf" ] || [ ! -f "cloudwatch.tf" ]; then
    print_error "Please run this script from the infra directory containing main.tf and cloudwatch.tf"
    exit 1
fi

print_status "Starting CloudWatch deployment..."

# Validate Terraform configuration
print_status "Validating Terraform configuration..."
if ! terraform validate; then
    print_error "Terraform validation failed"
    exit 1
fi
print_success "Terraform validation passed"

# Plan the CloudWatch deployment
print_status "Planning CloudWatch deployment..."
if ! terraform plan -target=aws_cloudwatch_log_group.app_logs -target=aws_cloudwatch_log_group.access_logs -target=aws_cloudwatch_log_group.error_logs -target=aws_cloudwatch_log_group.database_logs -target=aws_cloudwatch_dashboard.main -target=aws_cloudwatch_metric_alarm.ec2_cpu_high -target=aws_cloudwatch_metric_alarm.ec2_memory_high -target=aws_cloudwatch_metric_alarm.rds_cpu_high -target=aws_cloudwatch_metric_alarm.rds_storage_low -target=aws_cloudwatch_metric_alarm.app_error_rate_high -target=aws_cloudwatch_metric_alarm.api_response_time_slow -target=aws_cloudwatch_log_metric_filter.error_count -target=aws_cloudwatch_log_metric_filter.auth_failures -target=aws_cloudwatch_log_metric_filter.database_errors -target=aws_cloudwatch_log_metric_filter.api_requests -target=aws_cloudwatch_log_metric_filter.api_response_time -target=aws_iam_role_policy.ec2_secrets_policy; then
    print_error "Terraform plan failed"
    exit 1
fi

# Ask for confirmation
echo
read -p "Do you want to proceed with the CloudWatch deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Deployment cancelled by user"
    exit 0
fi

# Apply CloudWatch resources
print_status "Applying CloudWatch resources..."
if ! terraform apply -auto-approve -target=aws_cloudwatch_log_group.app_logs -target=aws_cloudwatch_log_group.access_logs -target=aws_cloudwatch_log_group.error_logs -target=aws_cloudwatch_log_group.database_logs -target=aws_cloudwatch_dashboard.main -target=aws_cloudwatch_metric_alarm.ec2_cpu_high -target=aws_cloudwatch_metric_alarm.ec2_memory_high -target=aws_cloudwatch_metric_alarm.rds_cpu_high -target=aws_cloudwatch_log_metric_filter.error_count -target=aws_cloudwatch_log_metric_filter.auth_failures -target=aws_cloudwatch_log_metric_filter.database_errors -target=aws_cloudwatch_log_metric_filter.api_requests -target=aws_cloudwatch_log_metric_filter.api_response_time -target=aws_iam_role_policy.ec2_secrets_policy; then
    print_error "CloudWatch deployment failed"
    exit 1
fi

print_success "CloudWatch resources deployed successfully!"

# Get outputs
print_status "Retrieving CloudWatch outputs..."
DASHBOARD_URL=$(terraform output -raw cloudwatch_dashboard_url 2>/dev/null || echo "Dashboard URL not available")

# Display summary
echo
print_success "CloudWatch Deployment Complete!"
echo "======================================"
echo "Log Groups Created:"
echo "  - Application Logs: /canadagoose/${TF_VAR_environment:-dev}/app"
echo "  - Access Logs: /canadagoose/${TF_VAR_environment:-dev}/access"
echo "  - Error Logs: /canadagoose/${TF_VAR_environment:-dev}/errors"
echo "  - Database Logs: /canadagoose/${TF_VAR_environment:-dev}/database"
echo
echo "Alarms Created:"
echo "  - EC2 CPU High (>80%)"
echo "  - EC2 Memory High (>85%)"
echo "  - RDS CPU High (>80%)"
echo "  - RDS Storage Low (<1GB)"
echo "  - App Error Rate High (>10)"
echo "  - API Response Time Slow (>2s)"
echo
echo "Dashboard: $DASHBOARD_URL"
echo
print_status "Next steps:"
echo "1. Update your application to send logs to CloudWatch"
echo "2. Configure custom metrics in your Node.js backend"
echo "3. Set up SNS notifications for alarms (optional)"
echo "4. Test the monitoring by generating some load"
echo
print_success "CloudWatch monitoring is now active!" 