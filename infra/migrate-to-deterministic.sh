#!/bin/bash

# 🚀 Migration Script: Random → Deterministic Naming
# This script helps safely migrate your infrastructure from random naming to deterministic naming

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./migration-backup-$(date +%Y%m%d_%H%M%S)"
CURRENT_STATE_BACKUP="${BACKUP_DIR}/terraform.tfstate.backup"

echo -e "${BLUE}🚀 Starting migration from random to deterministic naming...${NC}"
echo -e "${BLUE}📅 Migration started at: $(date)${NC}"
echo ""

# Step 1: Create backup directory
echo -e "${YELLOW}📦 Step 1: Creating backup directory...${NC}"
mkdir -p "${BACKUP_DIR}"
echo -e "${GREEN}✅ Backup directory created: ${BACKUP_DIR}${NC}"

# Step 2: Backup current Terraform state
echo -e "${YELLOW}📦 Step 2: Backing up current Terraform state...${NC}"
if [ -f "terraform.tfstate" ]; then
    cp terraform.tfstate "${CURRENT_STATE_BACKUP}"
    echo -e "${GREEN}✅ Terraform state backed up to: ${CURRENT_STATE_BACKUP}${NC}"
else
    echo -e "${RED}❌ No terraform.tfstate found!${NC}"
    exit 1
fi

# Step 3: Backup S3 data if bucket exists
echo -e "${YELLOW}📦 Step 3: Checking for S3 data to backup...${NC}"
if command -v aws &> /dev/null; then
    # Try to get current S3 bucket name from state
    CURRENT_BUCKET=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "")
    
    if [ ! -z "$CURRENT_BUCKET" ]; then
        echo -e "${BLUE}📁 Found S3 bucket: ${CURRENT_BUCKET}${NC}"
        echo -e "${YELLOW}📁 Backing up S3 data...${NC}"
        
        S3_BACKUP_DIR="${BACKUP_DIR}/s3-backup"
        mkdir -p "${S3_BACKUP_DIR}"
        
        if aws s3 sync "s3://${CURRENT_BUCKET}/" "${S3_BACKUP_DIR}/" --quiet; then
            echo -e "${GREEN}✅ S3 data backed up to: ${S3_BACKUP_DIR}${NC}"
        else
            echo -e "${YELLOW}⚠️  S3 backup failed (bucket might be empty or inaccessible)${NC}"
        fi
    else
        echo -e "${BLUE}📁 No S3 bucket found in current state${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  AWS CLI not found, skipping S3 backup${NC}"
fi

# Step 4: Create migration configuration
echo -e "${YELLOW}📝 Step 4: Creating migration configuration...${NC}"
cat > "${BACKUP_DIR}/migration-config.md" << EOF
# Migration Configuration

## Migration Details
- **Started**: $(date)
- **Backup Location**: ${BACKUP_DIR}
- **Current State**: ${CURRENT_STATE_BACKUP}

## Current Resources
- **S3 Bucket**: ${CURRENT_BUCKET:-"Unknown"}
- **Secrets Manager**: Check terraform.tfstate for current names

## Migration Steps
1. ✅ Backup completed
2. ⏳ Temporarily disable lifecycle protection
3. ⏳ Apply deterministic naming
4. ⏳ Verify migration
5. ⏳ Re-enable protection
6. ⏳ Clean up old resources

## Rollback Instructions
If migration fails, restore from backup:
\`\`\`bash
cp "${CURRENT_STATE_BACKUP}" terraform.tfstate
terraform apply
\`\`\`
EOF

echo -e "${GREEN}✅ Migration configuration saved to: ${BACKUP_DIR}/migration-config.md${NC}"

# Step 5: Show current state summary
echo -e "${YELLOW}📊 Step 5: Current infrastructure summary...${NC}"
echo -e "${BLUE}Current resources in state:${NC}"
terraform state list | head -20

echo ""
echo -e "${YELLOW}📋 Step 6: Next steps for migration...${NC}"
echo -e "${BLUE}To complete the migration:${NC}"
echo ""
echo -e "1. ${YELLOW}Review the backup:${NC}"
echo -e "   ${BLUE}   Backup location: ${BACKUP_DIR}${NC}"
echo -e "   ${BLUE}   Configuration: ${BACKUP_DIR}/migration-config.md${NC}"
echo ""
echo -e "2. ${YELLOW}Temporarily disable lifecycle protection:${NC}"
echo -e "   ${BLUE}   Edit main.tf and comment out lifecycle blocks${NC}"
echo -e "   ${BLUE}   Comment out: prevent_destroy = true${NC}"
echo ""
echo -e "3. ${YELLOW}Apply deterministic naming:${NC}"
echo -e "   ${BLUE}   terraform plan${NC}"
echo -e "   ${BLUE}   terraform apply${NC}"
echo ""
echo -e "4. ${YELLOW}Verify migration:${NC}"
echo -e "   ${BLUE}   Check new resources are working${NC}"
echo -e "   ${BLUE}   Verify data integrity${NC}"
echo ""
echo -e "5. ${YELLOW}Re-enable protection:${NC}"
echo -e "   ${BLUE}   Uncomment lifecycle blocks${NC}"
echo -e "   ${BLUE}   terraform apply${NC}"
echo ""
echo -e "6. ${YELLOW}Clean up old resources:${NC}"
echo -e "   ${BLUE}   Remove old resource definitions${NC}"
echo -e "   ${BLUE}   terraform apply${NC}"
echo ""

# Step 7: Show migration readiness
echo -e "${YELLOW}🔍 Step 7: Migration readiness check...${NC}"

# Check if Terraform is initialized
if [ -d ".terraform" ]; then
    echo -e "${GREEN}✅ Terraform initialized${NC}"
else
    echo -e "${RED}❌ Terraform not initialized. Run 'terraform init' first.${NC}"
fi

# Check if variables are configured
if [ -f "terraform.tfvars" ]; then
    echo -e "${GREEN}✅ terraform.tfvars configured${NC}"
else
    echo -e "${YELLOW}⚠️  No terraform.tfvars found. Copy from terraform.tfvars.example${NC}"
fi

# Check AWS credentials
if aws sts get-caller-identity &> /dev/null; then
    echo -e "${GREEN}✅ AWS credentials configured${NC}"
else
    echo -e "${RED}❌ AWS credentials not configured or invalid${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Migration preparation complete!${NC}"
echo ""
echo -e "${BLUE}📁 Backup location: ${BACKUP_DIR}${NC}"
echo -e "${BLUE}📋 Next steps: Review migration-config.md${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Always test migration in non-production first!${NC}"
echo -e "${YELLOW}⚠️  IMPORTANT: Have a rollback plan ready!${NC}"
echo ""
echo -e "${BLUE}🚀 Ready to migrate to deterministic naming!${NC}" 