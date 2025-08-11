# Migration Configuration

## Migration Details
- **Started**: Mon Aug 11 16:41:48 EDT 2025
- **Backup Location**: ./migration-backup-20250811_164147
- **Current State**: ./migration-backup-20250811_164147/terraform.tfstate.backup

## Current Resources
- **S3 Bucket**: canadagoose-scripts-09712ff2
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
```bash
cp "./migration-backup-20250811_164147/terraform.tfstate.backup" terraform.tfstate
terraform apply
```
