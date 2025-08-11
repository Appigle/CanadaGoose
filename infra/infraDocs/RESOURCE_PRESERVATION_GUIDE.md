# 🔒 Resource Preservation Guide

## Overview

This guide explains how to prevent Terraform from unnecessarily replacing your existing infrastructure resources when you run `terraform apply` again.

## 🚨 **What Was Causing Resource Replacement**

The original configuration had these issues:

1. **Random resources** (`random_id`, `random_password`) generated new values each time
2. **No lifecycle protections** to prevent resource replacement
3. **Dynamic resource names** that changed between runs

## ✅ **What We Fixed**

### 1. **Added Resource Preservation Controls**

```hcl
variable "preserve_existing_resources" {
  type        = bool
  description = "If true, will try to preserve existing resources and prevent replacement"
  default     = true  # Default to preserving resources
}

variable "force_resource_recreation" {
  type        = bool
  description = "WARNING: If true, will force recreation of all resources. This will cause data loss!"
  default     = false
}
```

### 2. **Added Lifecycle Protections**

```hcl
# Prevent accidental deletion
lifecycle {
  prevent_destroy = true
}

# Ignore changes to prevent replacement
lifecycle {
  ignore_changes = [
    password,
    ami,
    user_data
  ]
}
```

### 3. **Conditional Resource Creation**

```hcl
# Only create random resources when NOT preserving
resource "random_password" "db_password" {
  count = var.preserve_existing_resources ? 0 : 1
  # ... configuration
}
```

## 🛡️ **How to Use Resource Preservation**

### **Default Behavior (Safe)**

```bash
# This will preserve existing resources
terraform plan
terraform apply
```

**What happens:**

- ✅ Existing resources are preserved
- ✅ No random values change
- ✅ No data loss
- ✅ Only configuration drift is corrected

### **When You Need to Change Something**

```bash
# 1. First, set preserve_existing_resources = false
# Edit terraform.tfvars:
preserve_existing_resources = false

# 2. Plan and apply
terraform plan
terraform apply

# 3. Set back to true to prevent future changes
preserve_existing_resources = true
terraform apply
```

### **Emergency Resource Recreation (DANGEROUS)**

```bash
# WARNING: This will destroy and recreate ALL resources
# Edit terraform.tfvars:
preserve_existing_resources = false
force_resource_recreation = true

# Apply (will show destruction warnings)
terraform plan
terraform apply
```

## 📋 **Current Resource Protection Status**

| Resource            | Protection Level  | What's Protected                 |
| ------------------- | ----------------- | -------------------------------- |
| **S3 Bucket**       | `prevent_destroy` | Bucket name, data, configuration |
| **Secrets Manager** | `prevent_destroy` | Secret name, values              |
| **RDS Instance**    | `ignore_changes`  | Password, snapshot settings      |
| **EC2 Instance**    | `ignore_changes`  | AMI, user_data                   |
| **Random Values**   | Conditional       | Only created when needed         |

## 🔧 **Troubleshooting**

### **"Resource Already Exists" Error**

```bash
# Import existing resource into Terraform state
terraform import aws_s3_bucket.scripts your-bucket-name
terraform import aws_secretsmanager_secret.app_secrets your-secret-name
```

### **"Cannot Update" Error**

```bash
# Some resources can't be updated in-place
# Use preserve_existing_resources = false temporarily
# Then set back to true
```

### **State File Corruption**

```bash
# Backup your state file
cp terraform.tfstate terraform.tfstate.backup

# If needed, restore from backup
cp terraform.tfstate.backup terraform.tfstate
```

## 📝 **Best Practices**

1. **Always run `terraform plan` first** to see what will change
2. **Use `preserve_existing_resources = true`** for production
3. **Only set to `false`** when you specifically need changes
4. **Backup your state file** before major changes
5. **Test changes in dev/staging** before production

## 🚀 **Quick Commands**

```bash
# Safe check - see what would change
terraform plan

# Safe apply - preserve existing resources
terraform apply

# Check current state
terraform show

# List all resources
terraform state list

# Get specific resource info
terraform state show aws_instance.app
```

## ⚠️ **Warnings**

- **Never run `terraform destroy`** without understanding the impact
- **Always backup data** before forcing resource recreation
- **Test in non-production** environments first
- **Monitor costs** - recreating resources may incur charges

## 📞 **Need Help?**

If you encounter issues:

1. Check the `terraform plan` output
2. Review the error messages
3. Check the resource protection settings
4. Consider importing existing resources
5. Use `terraform state` commands to investigate
