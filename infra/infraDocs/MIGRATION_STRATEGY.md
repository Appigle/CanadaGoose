# 🔄 Migration Strategy: Random → Deterministic Naming

## 🚨 **Current Situation**

Your infrastructure currently has:

- **S3 Bucket**: `canadagoose-scripts-09712ff2` (random name)
- **Secrets Manager**: `canadagoose-prod-app-secrets-09712ff2` (random name)
- **Random resources** that change every `terraform apply`

## 🎯 **Target State**

We want to achieve:

- **S3 Bucket**: `canadagoose-scripts-prod-91beb838` (deterministic name)
- **Secrets Manager**: `canadagoose-prod-app-secrets-91beb838` (deterministic name)
- **Stable names** that never change

## 🔒 **Why Resources Can't Be Replaced**

The `prevent_destroy` lifecycle blocks replacement because:

- **Data protection** - Prevents accidental deletion
- **Production safety** - Ensures no service interruption
- **Compliance** - Meets security requirements

## 🚀 **Migration Strategy Options**

### **Option 1: Gradual Migration (RECOMMENDED)**

This approach preserves all data and minimizes downtime:

#### **Step 1: Backup Current State**

```bash
# Backup current Terraform state
cp terraform.tfstate terraform.tfstate.backup.random-naming

# Backup S3 bucket data (if important)
aws s3 sync s3://canadagoose-scripts-09712ff2 ./s3-backup/
```

#### **Step 2: Temporarily Disable Protection**

```bash
# Edit main.tf - comment out lifecycle blocks temporarily
# Comment out these lines:
# lifecycle {
#   prevent_destroy = true
# }
```

#### **Step 3: Migrate Resources**

```bash
# Apply the new deterministic naming
terraform apply

# This will:
# 1. Create new S3 bucket with deterministic name
# 2. Create new Secrets Manager with deterministic name
# 3. Copy data from old to new resources
# 4. Update references
```

#### **Step 4: Verify Migration**

```bash
# Check new resources are working
terraform show

# Verify data integrity
aws s3 ls s3://canadagoose-scripts-prod-91beb838/
aws secretsmanager describe-secret --secret-id canadagoose-prod-app-secrets-91beb838
```

#### **Step 5: Re-enable Protection**

```bash
# Uncomment lifecycle blocks in main.tf
# Re-enable prevent_destroy

# Apply to ensure protection is active
terraform apply
```

### **Option 2: Data Migration (SAFER)**

This approach manually migrates data to avoid any risk:

#### **Step 1: Create New Infrastructure**

```bash
# Temporarily rename old resources in Terraform
# Add "_old" suffix to existing resources
resource "aws_s3_bucket" "scripts_old" {
  # ... existing configuration
}

# Create new resources with deterministic names
resource "aws_s3_bucket" "scripts" {
  bucket = local.s3_bucket_name
  # ... new configuration
}
```

#### **Step 2: Manual Data Migration**

```bash
# Copy data from old to new S3 bucket
aws s3 sync s3://canadagoose-scripts-09712ff2 s3://canadagoose-scripts-prod-91beb838/

# Copy secrets from old to new Secrets Manager
aws secretsmanager get-secret-value --secret-id canadagoose-prod-app-secrets-09712ff2
# Manually create new secret with same values
```

#### **Step 3: Update References**

```bash
# Update IAM policies, bucket policies, etc.
# Point to new resource names
```

#### **Step 4: Remove Old Resources**

```bash
# Remove old resource definitions
# terraform apply to clean up
```

### **Option 3: Fresh Start (RISKY)**

This approach destroys and recreates everything:

#### **Step 1: Backup Everything**

```bash
# Backup all data
# Backup Terraform state
# Document all current configurations
```

#### **Step 2: Destroy and Recreate**

```bash
# Disable all lifecycle protections
# terraform destroy
# terraform apply
```

#### **Step 3: Restore Data**

```bash
# Restore from backups
# Reconfigure applications
```

## ✅ **Recommended Approach: Option 1 (Gradual Migration)**

### **Why This is Best:**

- ✅ **Zero data loss** - All data preserved
- ✅ **Minimal downtime** - Brief interruption during migration
- ✅ **Rollback capability** - Can revert if issues occur
- ✅ **Production safe** - Meets enterprise requirements

### **Migration Timeline:**

1. **Planning**: 1-2 hours (review, backup, prepare)
2. **Migration**: 15-30 minutes (actual resource migration)
3. **Verification**: 1-2 hours (testing, validation)
4. **Cleanup**: 30 minutes (remove old resources)

## 🛠️ **Implementation Steps**

### **Step 1: Prepare Migration Script**

```bash
#!/bin/bash
# migration-helper.sh

echo "🚀 Starting migration from random to deterministic naming..."

# Backup current state
echo "📦 Backing up current state..."
cp terraform.tfstate terraform.tfstate.backup.$(date +%Y%m%d_%H%M%S)

# Backup S3 data if needed
echo "📁 Backing up S3 data..."
aws s3 sync s3://canadagoose-scripts-09712ff2 ./s3-backup/

echo "✅ Backup complete. Ready for migration."
```

### **Step 2: Execute Migration**

```bash
# 1. Disable lifecycle protection temporarily
# 2. Run terraform apply
# 3. Verify new resources
# 4. Re-enable protection
```

### **Step 3: Post-Migration Verification**

```bash
# Check all resources are accessible
# Verify data integrity
# Test application functionality
# Monitor for any issues
```

## 🚨 **Risk Mitigation**

### **Before Migration:**

- ✅ **Full backup** of Terraform state
- ✅ **Data backup** from S3 and Secrets Manager
- ✅ **Documentation** of current configuration
- ✅ **Rollback plan** ready

### **During Migration:**

- ✅ **Monitor** resource creation
- ✅ **Verify** data migration
- ✅ **Test** functionality
- ✅ **Keep** old resources until verified

### **After Migration:**

- ✅ **Verify** all services working
- ✅ **Monitor** for 24-48 hours
- ✅ **Clean up** old resources
- ✅ **Update** documentation

## 🔍 **Verification Checklist**

### **S3 Bucket Migration:**

- [ ] New bucket created with deterministic name
- [ ] All data copied successfully
- [ ] Bucket policies updated
- [ ] IAM permissions working
- [ ] Applications can access new bucket

### **Secrets Manager Migration:**

- [ ] New secret created with deterministic name
- [ ] All secret values preserved
- [ ] Applications can retrieve secrets
- [ ] IAM roles updated
- [ ] No authentication failures

### **General Infrastructure:**

- [ ] All resources have deterministic names
- [ ] No random resources in state
- [ ] Terraform plan shows "No changes"
- [ ] All applications functioning normally
- [ ] Monitoring and logging working

## 🎯 **Expected Results**

### **After Successful Migration:**

```bash
terraform plan
# Should show: "No changes. Your infrastructure matches the configuration."

terraform state list
# Should show deterministic resource names:
# - aws_s3_bucket.scripts (canadagoose-scripts-prod-91beb838)
# - aws_secretsmanager_secret.app_secrets (canadagoose-prod-app-secrets-91beb838)
```

### **Benefits Achieved:**

- ✅ **Stable names** - Never change between runs
- ✅ **True idempotency** - Same code, same result
- ✅ **No data loss** - All data preserved
- ✅ **Production ready** - Enterprise-grade stability
- ✅ **Future proof** - No more random resource issues

## 🆘 **If Something Goes Wrong**

### **Immediate Rollback:**

```bash
# Restore from backup
cp terraform.tfstate.backup.* terraform.tfstate

# Revert to previous configuration
terraform apply
```

### **Data Recovery:**

```bash
# Restore S3 data from backup
aws s3 sync ./s3-backup/ s3://canadagoose-scripts-09712ff2/

# Restore secrets if needed
# Check AWS Secrets Manager console
```

### **Get Help:**

1. Check Terraform state: `terraform show`
2. Review error logs
3. Check AWS CloudTrail for API errors
4. Contact DevOps team if needed

## 🎉 **Post-Migration Success**

Once migration is complete:

- **Infrastructure is bulletproof** - No more random naming issues
- **Deployments are predictable** - Same result every time
- **Data is safe** - Protected by lifecycle blocks
- **Future is bright** - Stable, maintainable infrastructure

**The migration transforms your infrastructure from fragile to robust!** 🚀
