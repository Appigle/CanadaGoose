#!/bin/bash

# Financial Transactions Migration Script for EC2 Instance
# This script helps migrate the financial transactions table on the production EC2 instance
# Uses AWS Secrets Manager for database credentials (following infrastructure design)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Financial Transactions Migration for EC2 Instance${NC}"
echo "========================================================"

# Check if we're in the infra directory
if [ ! -f "main.tf" ]; then
    echo -e "${RED}❌ Please run this script from the infra directory${NC}"
    exit 1
fi

# Check if SSH key exists
if [ ! -f "ssh_key" ]; then
    echo -e "${RED}❌ SSH key not found. Please ensure ssh_key exists in the infra directory.${NC}"
    exit 1
fi

# Get EC2 instance IP and RDS endpoint from terraform output
echo -e "${YELLOW}🔍 Getting infrastructure details from Terraform...${NC}"
EC2_IP=$(terraform output -raw ec2_public_ip 2>/dev/null || echo "")
RDS_ENDPOINT=$(terraform output -raw rds_endpoint 2>/dev/null || echo "")
SECRET_ARN=$(terraform output -raw secrets_manager_arn 2>/dev/null || echo "")
SECRET_NAME=$(echo "$SECRET_ARN" | rev | cut -d: -f1 | rev || echo "")

if [ -z "$EC2_IP" ]; then
    echo -e "${YELLOW}⚠️  Could not get EC2 IP from Terraform output. Using default IP...${NC}"
    EC2_IP="44.195.110.182"
fi

if [ -z "$RDS_ENDPOINT" ]; then
    echo -e "${RED}❌ Could not get RDS endpoint from Terraform output.${NC}"
    echo -e "${YELLOW}💡 Please check your Terraform state or run 'terraform output'${NC}"
    exit 1
fi

if [ -z "$SECRET_NAME" ]; then
    echo -e "${RED}❌ Could not get Secrets Manager ARN from Terraform output.${NC}"
    echo -e "${YELLOW}💡 Please check your Terraform state or run 'terraform output'${NC}"
    exit 1
fi

# Extract hostname and port from RDS endpoint
RDS_HOST=$(echo "$RDS_ENDPOINT" | cut -d: -f1)
RDS_PORT=$(echo "$RDS_ENDPOINT" | cut -d: -f2)

echo -e "${GREEN}✅ EC2 Instance IP: ${EC2_IP}${NC}"
echo -e "${GREEN}✅ RDS Host: ${RDS_HOST}${NC}"
echo -e "${GREEN}✅ RDS Port: ${RDS_PORT}${NC}"
echo -e "${GREEN}✅ Secrets Manager: ${SECRET_NAME}${NC}"

# Create the migration SQL file
echo -e "${YELLOW}📝 Creating migration SQL file...${NC}"
cat > financial_migration.sql << 'EOF'
-- Financial Transactions Table Migration
-- This script adds the financial_transactions table to the production database

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
        
        -- Foreign key constraint
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        
        -- Indexes for performance
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

-- Show indexes
SHOW INDEX FROM financial_transactions;

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

echo -e "${GREEN}✅ Migration SQL file created: financial_migration.sql${NC}"

# Upload the migration file to EC2
echo -e "${YELLOW}📤 Uploading migration file to EC2...${NC}"
scp -i ssh_key -o StrictHostKeyChecking=no financial_migration.sql ec2-user@${EC2_IP}:/tmp/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migration file uploaded successfully${NC}"
else
    echo -e "${RED}❌ Failed to upload migration file${NC}"
    exit 1
fi

# Create a remote execution script with actual database credentials
echo -e "${YELLOW}📝 Creating remote execution script...${NC}"
cat > remote_migration.sh << EOF
#!/bin/bash

echo "🚀 Starting financial transactions migration on EC2..."

# Database connection details (from your .env file)
DB_HOST="${RDS_HOST}"
DB_PORT="${RDS_PORT}"
DB_USER="webapp_user"
DB_PASS="5DoFtlBfaWaonf0t"
DB_NAME="webapp_db"

echo "📊 Database connection details:"
echo "   Host: \${DB_HOST}"
echo "   Port: \${DB_PORT}"
echo "   Database: \${DB_NAME}"
echo "   User: \${DB_USER}"

# Test database connection to RDS
echo "🔌 Testing RDS database connection..."
if mysql -h"\${DB_HOST}" -P"\${DB_PORT}" -u"\${DB_USER}" -p"\${DB_PASS}" -e "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ RDS database connection successful"
else
    echo "❌ RDS database connection failed"
    echo "💡 This might be due to:"
    echo "   - Security group rules not allowing EC2 to RDS"
    echo "   - Database credentials from Secrets Manager"
    echo "   - RDS instance not running"
    echo "   - Network connectivity issues"
    
    # Try to get more details about the error
    echo "🔍 Testing connection with verbose output..."
    mysql -h"\${DB_HOST}" -P"\${DB_PORT}" -u"\${DB_USER}" -p"\${DB_PASS}" -e "SELECT 1;" 2>&1 || true
    
    exit 1
fi

# Run the migration
echo "📝 Running migration SQL on RDS..."
if mysql -h"\${DB_HOST}" -P"\${DB_PORT}" -u"\${DB_USER}" -p"\${DB_PASS}" "\${DB_NAME}" < /tmp/financial_migration.sql; then
    echo "✅ Migration completed successfully on RDS!"
    
    # Verify the table
    echo "🔍 Verifying table structure..."
    mysql -h"\${DB_HOST}" -P"\${DB_PORT}" -u"\${DB_USER}" -p"\${DB_PASS}" "\${DB_NAME}" -e "DESCRIBE financial_transactions;"
    
    echo "📊 Showing sample data..."
    mysql -h"\${DB_HOST}" -P"\${DB_PORT}" -u"\${DB_USER}" -p"\${DB_PASS}" "\${DB_NAME}" -e "SELECT * FROM financial_transactions LIMIT 5;"
    
    echo "🎉 Financial transactions table is ready on RDS!"
else
    echo "❌ Migration failed on RDS"
    exit 1
fi

# Clean up
rm -f /tmp/financial_migration.sql
echo "🧹 Cleanup completed"
EOF

echo -e "${GREEN}✅ Remote execution script created: remote_migration.sh${NC}"

# Upload and execute the remote script
echo -e "${YELLOW}📤 Uploading and executing remote script...${NC}"
scp -i ssh_key -o StrictHostKeyChecking=no remote_migration.sh ec2-user@${EC2_IP}:/tmp/
ssh -i ssh_key -o StrictHostKeyChecking=no ec2-user@${EC2_IP} "chmod +x /tmp/remote_migration.sh && /tmp/remote_migration.sh"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Migration completed successfully on EC2!${NC}"
else
    echo -e "${RED}❌ Migration failed on EC2${NC}"
    echo -e "${YELLOW}💡 You can manually SSH to the instance and run the migration:${NC}"
    echo -e "${BLUE}   ssh -i ./ssh_key ec2-user@${EC2_IP}${NC}"
    echo -e "${BLUE}   cd /tmp && chmod +x remote_migration.sh && ./remote_migration.sh${NC}"
fi

# Clean up local files
echo -e "${YELLOW}🧹 Cleaning up local files...${NC}"
rm -f financial_migration.sql remote_migration.sh

echo -e "${GREEN}✅ Migration process completed!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "   1. Restart your Node.js application on EC2"
echo "   2. Test the /api/financial/submit endpoint"
echo "   3. Use the provided test script to verify functionality" 