# CanadaGoose Infrastructure

This Terraform configuration deploys a minimal but solid infrastructure for the CanadaGoose project on AWS.

## 🚀 **Current Status: WORKING & PROTECTED**

✅ **Resource preservation enabled** - Running `terraform apply` again will NOT destroy your existing infrastructure  
✅ **Lifecycle protections active** - Critical resources are protected from accidental deletion  
✅ **Random values stable** - No unnecessary resource replacement

## Architecture

- **VPC** with 2 public subnets (no NAT/ALB)
- **Security Groups** for API and RDS
- **RDS MySQL** instance (db.t3.micro, 20GB)
- **Secrets Manager** for database and JWT secrets
- **EC2 t3.micro** with IAM instance profile
- **Nginx** reverse proxy + **Node.js 16** + **PM2**

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Terraform** >= 1.6.0
3. **SSH key pair** for EC2 access
4. **Domain** configured for Cloudflare (optional but recommended)

## Quick Start

### 1. Generate SSH Key Pair

```bash
# Generate a new SSH key pair
ssh-keygen -t rsa -b 4096 -f ssh_key -N ""

# The public key will be used by Terraform
# The private key (ssh_key) should be kept secure
```

### 2. Configure Variables

```bash
# Copy the example file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
# Update domain_host to your actual domain
```

### 3. Initialize and Deploy

```bash
# Initialize Terraform
terraform init

# Plan the deployment
terraform plan

# Apply the infrastructure
terraform apply

# Confirm with 'yes' when prompted
```

### 4. Access Your Infrastructure

After deployment, you'll see outputs including:

- EC2 public IP address
- SSH connection command
- Application URLs
- Deployment instructions

## 🔒 **Resource Protection Features**

### **Lifecycle Protections**

- **S3 Bucket**: `prevent_destroy = true` - Cannot be accidentally deleted
- **Secrets Manager**: `prevent_destroy = true` - Credentials protected
- **RDS Instance**: `ignore_changes = [password]` - Database password preserved
- **EC2 Instance**: `ignore_changes = [ami, user_data]` - Instance preserved

### **Safe Operations**

```bash
# This will NOT destroy or replace existing resources
terraform plan    # Shows no changes needed
terraform apply   # No destructive actions
```

### **When You Need Changes**

```bash
# 1. Temporarily disable protection (if needed)
# Edit terraform.tfvars:
preserve_existing_resources = false

# 2. Make your changes
terraform plan
terraform apply

# 3. Re-enable protection
preserve_existing_resources = true
terraform apply
```

## Configuration

### Key Variables

| Variable                      | Description                | Default                  |
| ----------------------------- | -------------------------- | ------------------------ |
| `project_name`                | Project name               | `canadagoose`            |
| `aws_region`                  | AWS region                 | `us-east-1`              |
| `domain_host`                 | Domain for the application | `s25cicd.xiaopotato.top` |
| `db_name`                     | Database name              | `webapp_db`              |
| `db_user`                     | Database username          | `webapp_user`            |
| `instance_type`               | EC2 instance type          | `t3.micro`               |
| `db_instance_class`           | RDS instance class         | `db.t3.micro`            |
| `preserve_existing_resources` | Protect existing resources | `true`                   |

### Security Groups

- **api-sg**: Allows inbound HTTP (80), HTTPS (443), and SSH (22) from internet
- **rds-sg**: Allows inbound MySQL (3306) only from api-sg

## What Gets Deployed

### Networking

- VPC with CIDR `10.0.0.0/16`
- 2 public subnets across different AZs
- Internet Gateway for public internet access
- Route tables for public subnets

### Compute

- EC2 t3.micro instance with Amazon Linux 2
- IAM role with Secrets Manager access
- Elastic IP for consistent public IP

### Database

- RDS MySQL 8.0 instance
- 20GB encrypted storage
- Automated backups with 7-day retention
- Private subnet access only

### Storage

- S3 bucket for server scripts
- Server-side encryption enabled
- Versioning enabled
- Private access only

## 🔧 **Maintenance & Updates**

### **Safe Updates**

```bash
# Check what would change
terraform plan

# Apply updates (will preserve existing resources)
terraform apply
```

### **Emergency Changes**

```bash
# Only use when absolutely necessary
# This will destroy and recreate resources
preserve_existing_resources = false
terraform apply
```

### **Monitoring**

```bash
# Check resource status
terraform show

# List all resources
terraform state list

# Get specific resource info
terraform state show aws_instance.app
```

## 📚 **Documentation**

- **`RESOURCE_PRESERVATION_GUIDE.md`** - Detailed guide on resource protection
- **`DEPLOYMENT_SUMMARY.md`** - Deployment workflow and scripts
- **`SERVER_MANAGEMENT.md`** - Server management and maintenance

## 🚀 **Script Management**

### **Upload Scripts to S3 and Deploy to EC2**

```bash
# Complete workflow: Upload to S3 + Deploy to EC2
./upload-scripts.sh

# Or do it step by step:
./upload-scripts.sh          # Upload to S3 only
./download-scripts-to-ec2.sh # Download to EC2 only
```

### **What These Scripts Do**

1. **`upload-scripts.sh`**:

   - Uploads server management scripts to S3
   - Automatically downloads them to EC2 instance
   - Sets proper permissions
   - Provides fallback instructions if SSH fails

2. **`download-scripts-to-ec2.sh`**:
   - Downloads scripts from S3 to EC2 instance
   - Installs AWS CLI if needed
   - Sets executable permissions
   - Tests script functionality
   - Shows next steps for deployment

### **Script Workflow**

```bash
# 1. Upload scripts to S3
./upload-scripts.sh

# 2. Scripts are automatically downloaded to EC2
# 3. SSH into your instance to use them:
ssh -i ssh_key ec2-user@$(terraform output -raw ec2_public_ip)

# 4. Use the management scripts:
cd /opt/app/server-scripts
./check-status.sh      # Check server status
./deploy-app.sh        # Deploy your application
./restart-services.sh  # Restart services if needed
```

## ⚠️ **Important Notes**

1. **Resources are protected by default** - No accidental deletion
2. **Random values are stable** - No unnecessary replacement
3. **Database passwords are preserved** - No connection breaks
4. **S3 bucket data is protected** - No data loss

## 🆘 **Troubleshooting**

### **Common Issues**

1. **"No changes" message**: This is GOOD - your infrastructure is protected
2. **"Cannot destroy" error**: Resource protection is working - use `preserve_existing_resources = false` if needed
3. **State file issues**: Backup and restore from `terraform.tfstate.backup`

### **Getting Help**

1. Check `terraform plan` output
2. Review error messages
3. Check resource protection settings
4. Use `terraform state` commands to investigate

## 🎯 **Next Steps**

Your infrastructure is now **fully protected** and **production-ready**. You can:

1. **Deploy applications** using the provided scripts
2. **Monitor resources** using AWS Console or CLI
3. **Scale up** by modifying instance types
4. **Add services** by extending the configuration

**Remember**: Always run `terraform plan` first to see what would change!
