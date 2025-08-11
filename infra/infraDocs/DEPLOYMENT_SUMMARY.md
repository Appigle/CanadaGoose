# 🚀 CanadaGoose Infrastructure Deployment Summary

## 📋 **Overview**

This document provides a comprehensive guide for deploying the CanadaGoose infrastructure using Terraform, with a focus on the new S3-based script management approach.

## 🎯 **What's New: S3-Based Script Management**

Instead of embedding large scripts in `user_data.sh` (which has a 16KB limit), we now:

1. **Store scripts in S3** - Server management scripts are uploaded to S3
2. **Download during setup** - `user_data.sh` downloads scripts from S3 during EC2 initialization
3. **Keep scripts maintainable** - Edit scripts locally, not in user_data.sh
4. **Version control friendly** - Scripts can be managed in Git separately

## 🏗️ **Infrastructure Components**

### **Compute & Networking**

- **EC2 Instance**: t3.micro with Amazon Linux 2
- **VPC**: Custom VPC with public subnets across 2 AZs
- **Security Groups**: HTTP/HTTPS/SSH access, RDS access
- **Internet Gateway**: Public internet access
- **Route Tables**: Public routing configuration

### **Database**

- **RDS MySQL**: db.t3.micro instance
- **Storage**: 20GB encrypted GP2 storage
- **Backup**: 7-day retention with automated backups
- **Security**: Private subnet, encrypted at rest

### **Storage & Scripts**

- **S3 Bucket**: Stores server management scripts
- **Scripts**: deploy-app.sh, restart-services.sh, check-status.sh
- **Access**: EC2 instance downloads scripts via IAM role

### **Security & Configuration**

- **Secrets Manager**: Stores database credentials and JWT secrets
- **IAM Role**: EC2 instance role with minimal permissions
- **SSH Key**: Generated key pair for secure access
- **Encryption**: All storage encrypted at rest

## 🔄 **Deployment Workflow**

### **Step 1: Initial Setup**

```bash
cd infra
./validate.sh          # Validate configuration
```

### **Step 2: Deploy Infrastructure**

```bash
./deploy.sh            # Deploy infrastructure (creates S3 bucket)
```

### **Step 3: Upload Scripts to S3**

```bash
./upload-scripts.sh    # Upload server scripts to S3
```

### **Step 4: Verify Deployment**

```bash
# Check outputs
terraform output

# SSH into instance
ssh -i ssh_key ec2-user@$(terraform output -raw ec2_public_ip)

# Verify scripts are available
ls -la /opt/app/server-scripts/
```

## 📁 **File Structure**

```
infra/
├── main.tf                 # Main Terraform configuration
├── variables.tf            # Variable definitions
├── outputs.tf              # Output values
├── versions.tf             # Provider versions
├── user_data.sh            # EC2 initialization script (now much smaller!)
├── server-scripts/         # Server management scripts
│   ├── deploy-app.sh       # App deployment script
│   ├── restart-services.sh # Service restart script
│   └── check-status.sh     # Status checking script
├── upload-scripts.sh       # Script upload utility
├── deploy.sh               # Infrastructure deployment
├── destroy.sh              # Infrastructure cleanup
└── validate.sh             # Configuration validation
```

## 🛠️ **Using Shell Scripts**

### **Direct Script Usage**

```bash
# SSH into your EC2 instance
ssh -i ssh_key ec2-user@$(terraform output -raw ec2_public_ip)

# Navigate to scripts directory
cd /opt/app/server-scripts

# Check server status
./check-status.sh

# Restart services
./restart-services.sh

# Deploy new app
./deploy-app.sh
```

### **Alternative Commands (No Scripts)**

```bash
# Restart services manually
sudo systemctl restart nginx
pm2 restart all

# Check status manually
sudo systemctl status nginx
pm2 status
pm2 logs canadagoose-api

# PM2 ecosystem management
pm2 start ecosystem.config.js --env production
pm2 reload ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 🔧 **Key Benefits of New Approach**

### **Before (Embedded Scripts)**

- ❌ `user_data.sh` was over 16KB (AWS limit exceeded)
- ❌ Scripts embedded in user_data, hard to maintain
- ❌ No version control for individual scripts
- ❌ Difficult to test scripts locally

### **After (S3-Based)**

- ✅ `user_data.sh` is only 7KB (well under limit)
- ✅ Scripts stored separately, easy to maintain
- ✅ Version control friendly
- ✅ Can test scripts locally before upload
- ✅ Scripts can be updated without redeploying infrastructure

## 🚨 **Important Notes**

### **Script Upload Order**

1. **Deploy infrastructure first** - Creates S3 bucket
2. **Upload scripts second** - Populates S3 bucket
3. **EC2 instance downloads** - During initialization

### **IAM Permissions**

- EC2 instance has minimal S3 permissions (read-only)
- S3 bucket is private and encrypted
- Access controlled via IAM role

### **Script Updates**

- Update scripts locally in `server-scripts/` directory
- Run `./upload-scripts.sh` to upload changes
- New EC2 instances will get updated scripts automatically

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Scripts not found**: Ensure `./upload-scripts.sh` was run after deployment
2. **Permission denied**: Check IAM role and S3 bucket policy
3. **S3 access errors**: Verify EC2 instance has correct IAM role

### **Debug Commands**

```bash
# Check S3 bucket contents
aws s3 ls s3://$(terraform output -raw s3_bucket_name)/server-scripts/

# Check EC2 IAM role
aws sts get-caller-identity

# Verify script permissions on EC2
ls -la /opt/app/server-scripts/
```

## 📚 **Next Steps**

1. **Deploy infrastructure**: `./deploy.sh`
2. **Upload scripts**: `./upload-scripts.sh`
3. **Deploy your Vue.js app**: Use the deployment scripts
4. **Monitor and maintain**: Use the management scripts

## 🎉 **Success Indicators**

- ✅ Terraform validation passes
- ✅ Infrastructure deploys successfully
- ✅ S3 bucket contains server scripts
- ✅ EC2 instance initializes without errors
- ✅ Server scripts are executable and functional
- ✅ Application responds to health checks

---

**Ready to deploy?** Start with `./validate.sh` to ensure everything is configured correctly!
