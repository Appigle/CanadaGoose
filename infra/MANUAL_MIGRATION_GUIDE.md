# Manual Migration Guide for Financial Transactions

This guide will help you manually migrate the financial transactions table on your EC2 instance.

## Option 1: Automated Migration (Recommended)

Run the automated migration script from the infra directory:

```bash
cd infra
./migrate-financial-on-ec2.sh
```

This script will:

- Create the migration SQL file
- Upload it to your EC2 instance
- Execute the migration automatically
- Verify the results

## Option 2: Manual Migration

If you prefer to do it manually, follow these steps:

### Step 1: SSH to EC2 Instance

```bash
cd infra
ssh -i ./ssh_key ec2-user@44.195.110.182
```

### Step 2: Create Migration SQL File

On the EC2 instance, create the migration file:

```bash
cat > /tmp/financial_migration.sql << 'EOF'
-- Financial Transactions Table Migration
USE webapp_db;

-- Check if table already exists
SET @table_exists = (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = 'webapp_db'
    AND table_name = 'financial_transactions'
);

-- Create table if it doesn't exist
SET @create_table = IF(@table_exists = 0,
    'CREATE TABLE financial_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM("income", "expenditure") NOT NULL,
        subtype VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency ENUM("USD", "CAD") NOT NULL DEFAULT "USD",
        transaction_date DATE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

        INDEX idx_user_id (user_id),
        INDEX idx_type (type),
        INDEX idx_subtype (subtype),
        INDEX idx_transaction_date (transaction_date),
        INDEX idx_currency (currency),
        INDEX idx_user_date (user_id, transaction_date)
    )',
    'SELECT "Table financial_transactions already exists" as message'
);

PREPARE stmt FROM @create_table;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Show table structure
DESCRIBE financial_transactions;

-- Insert sample data if table is empty
SET @row_count = (SELECT COUNT(*) FROM financial_transactions);

SET @insert_sample = IF(@row_count = 0,
    'INSERT INTO financial_transactions (user_id, type, subtype, amount, currency, transaction_date, description) VALUES
    (1, "income", "salary", 5000.00, "USD", "2024-01-15", "Monthly salary payment"),
    (1, "expenditure", "grocery", 150.75, "USD", "2024-01-16", "Weekly grocery shopping"),
    (1, "expenditure", "transportation", 45.50, "USD", "2024-01-17", "Gas and parking"),
    (1, "income", "bonus", 1000.00, "CAD", "2024-01-18", "Performance bonus"),
    (1, "expenditure", "gift", 89.99, "USD", "2024-01-19", "Birthday gift for friend")',
    'SELECT "Sample data already exists" as message'
);

PREPARE stmt2 FROM @insert_sample;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Show final count
SELECT COUNT(*) as total_transactions FROM financial_transactions;
EOF
```

### Step 3: Run the Migration

```bash
# Get RDS endpoint from Terraform (run this from the infra directory)
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
RDS_PORT=$(terraform output -raw rds_port)

# Test database connection to RDS
mysql -h"$RDS_ENDPOINT" -P"$RDS_PORT" -u"webapp_user" -p"webapp_pass" -e "SELECT 1;"

# Run the migration on RDS
mysql -h"$RDS_ENDPOINT" -P"$RDS_PORT" -u"webapp_user" -p"webapp_pass" webapp_db < /tmp/financial_migration.sql
```

### Step 4: Verify the Migration

```bash
# Check table structure
mysql -h"$RDS_ENDPOINT" -P"$RDS_PORT" -u"webapp_user" -p"webapp_pass" webapp_db -e "DESCRIBE financial_transactions;"

# Check indexes
mysql -h"$RDS_ENDPOINT" -P"$RDS_PORT" -u"webapp_user" -p"webapp_pass" webapp_db -e "SHOW INDEX FROM financial_transactions;"

# Check sample data
mysql -h"$RDS_ENDPOINT" -P"$RDS_PORT" -u"webapp_user" -p"webapp_pass" webapp_db -e "SELECT * FROM financial_transactions LIMIT 5;"

# Check total count
mysql -h"$RDS_ENDPOINT" -P"$RDS_PORT" -u"webapp_user" -p"webapp_pass" webapp_db -e "SELECT COUNT(*) as total FROM financial_transactions;"
```

### Step 5: Clean Up

```bash
rm -f /tmp/financial_migration.sql
```

## Troubleshooting

### Database Connection Issues

If you can't connect to RDS:

```bash
# Check if RDS is accessible from EC2
# The security group should allow EC2 to connect to RDS on port 3306

# Verify RDS endpoint and credentials
terraform output rds_endpoint
terraform output rds_port

# Test connection with different credentials if needed
# Note: RDS user management is different from local MySQL
# Users are typically created during RDS setup or via Terraform
```

### RDS Connection Issues

```bash
# Check if RDS instance is running
aws rds describe-db-instances --db-instance-identifier canadagoose-dev-db

# Check security group rules
# EC2 should be able to connect to RDS on port 3306

# Verify VPC and subnet configuration
# Both EC2 and RDS should be in the same VPC
```

### Permission Issues

```bash
# Check file permissions
ls -la /tmp/financial_migration.sql

# Fix permissions if needed
chmod 644 /tmp/financial_migration.sql
```

## After Migration

Once the migration is complete:

1. **Restart your Node.js application** to load the new routes
2. **Test the new endpoints**:

   - `POST /api/financial/submit`
   - `GET /api/financial/transactions`
   - `GET /api/financial/summary`

3. **Verify the database** has the new table and sample data

## Quick Test Commands

After migration, test the endpoints:

```bash
# Test with curl (replace YOUR_JWT_TOKEN with actual token)
curl -X POST http://localhost:3000/api/financial/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "subtype": "salary",
    "amount": 5000.00,
    "currency": "USD",
    "transaction_date": "2024-01-15",
    "description": "Test transaction"
  }'
```

## Support

If you encounter issues:

1. Check RDS logs in AWS Console: RDS > Databases > your-db > Logs
2. Verify the database exists: `SHOW DATABASES;`
3. Check user privileges: `SHOW GRANTS FOR 'webapp_user'@'%';`
4. Verify security group rules allow EC2 to connect to RDS
5. Check VPC and subnet configuration
