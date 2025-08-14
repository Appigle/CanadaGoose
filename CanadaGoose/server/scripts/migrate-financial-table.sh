#!/bin/bash

# Financial Transactions Table Migration Script
# This script adds the financial_transactions table to the database

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting Financial Transactions Table Migration...${NC}"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found. Please run setup-env.sh first.${NC}"
    exit 1
fi

# Load environment variables
source .env

# Database connection details
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER:-webapp_user}
DB_PASSWORD=${DB_PASSWORD:-webapp_pass}
DB_NAME=${DB_NAME:-webapp_db}

echo -e "${YELLOW}📊 Database: ${DB_HOST}:${DB_PORT}/${DB_NAME}${NC}"

# Check if MySQL client is available
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL client not found. Please install mysql-client.${NC}"
    exit 1
fi

# Test database connection
echo -e "${YELLOW}🔌 Testing database connection...${NC}"
if ! mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}❌ Cannot connect to database. Please check your credentials.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Database connection successful${NC}"

# Check if table already exists
echo -e "${YELLOW}🔍 Checking if financial_transactions table exists...${NC}"
TABLE_EXISTS=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -s -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$DB_NAME' AND table_name = 'financial_transactions';")

if [ "$TABLE_EXISTS" -eq 1 ]; then
    echo -e "${YELLOW}⚠️  Table financial_transactions already exists. Skipping creation.${NC}"
else
    echo -e "${YELLOW}📝 Creating financial_transactions table...${NC}"
    
    # Create the table
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" << 'EOF'
CREATE TABLE financial_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('income', 'expenditure') NOT NULL,
  subtype VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency ENUM('USD', 'CAD') NOT NULL DEFAULT 'USD',
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
);
EOF

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Table financial_transactions created successfully${NC}"
    else
        echo -e "${RED}❌ Failed to create table${NC}"
        exit 1
    fi
fi

# Insert sample data if table is empty
echo -e "${YELLOW}🔍 Checking if table has data...${NC}"
ROW_COUNT=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -s -N -e "SELECT COUNT(*) FROM financial_transactions;" "$DB_NAME")

if [ "$ROW_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}📊 Inserting sample data...${NC}"
    
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" << 'EOF'
INSERT INTO financial_transactions (user_id, type, subtype, amount, currency, transaction_date, description) VALUES
(1, 'income', 'salary', 5000.00, 'USD', '2024-01-15', 'Monthly salary payment'),
(1, 'expenditure', 'grocery', 150.75, 'USD', '2024-01-16', 'Weekly grocery shopping'),
(1, 'expenditure', 'transportation', 45.50, 'USD', '2024-01-17', 'Gas and parking'),
(1, 'income', 'bonus', 1000.00, 'CAD', '2024-01-18', 'Performance bonus'),
(1, 'expenditure', 'gift', 89.99, 'USD', '2024-01-19', 'Birthday gift for friend');
EOF

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Sample data inserted successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Warning: Failed to insert sample data (this is okay if user ID 1 doesn't exist)${NC}"
    fi
else
    echo -e "${GREEN}✅ Table already contains $ROW_COUNT rows${NC}"
fi

# Verify table structure
echo -e "${YELLOW}🔍 Verifying table structure...${NC}"
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "DESCRIBE financial_transactions;" "$DB_NAME"

echo -e "${GREEN}🎉 Migration completed successfully!${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "   1. Restart your server to load the new routes"
echo -e "   2. Test the /api/financial/submit endpoint"
echo -e "   3. Use the provided test script to verify functionality" 