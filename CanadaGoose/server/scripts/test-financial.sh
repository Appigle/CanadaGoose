#!/bin/bash

# Financial Transactions Test Runner Script
# This script runs the financial transactions API tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Financial Transactions API Test Runner${NC}"
echo "================================================"

# Check if we're in the server directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Please run this script from the server directory${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Please run setup-env.sh first.${NC}"
    echo -e "${YELLOW}   Creating minimal .env for testing...${NC}"
    
    # Create minimal .env for testing
    cat > .env << EOF
NODE_ENV=test
DB_HOST=localhost
DB_PORT=3306
DB_USER=webapp_user
DB_PASSWORD=webapp_pass
DB_NAME=webapp_db
JWT_SECRET=test-secret-key-for-testing-only
EOF
    
    echo -e "${GREEN}✅ Created minimal .env file for testing${NC}"
fi

# Check if required packages are installed
echo -e "${YELLOW}📦 Checking dependencies...${NC}"
if ! npm list jest > /dev/null 2>&1; then
    echo -e "${YELLOW}📦 Installing Jest for testing...${NC}"
    npm install --save-dev jest supertest
fi

# Check if database is accessible
echo -e "${YELLOW}🔌 Testing database connection...${NC}"
if ! mysql -h"${DB_HOST:-localhost}" -P"${DB_PORT:-3306}" -u"${DB_USER:-webapp_user}" -p"${DB_PASSWORD:-webapp_pass}" -e "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}❌ Cannot connect to database. Please ensure MySQL is running.${NC}"
    echo -e "${YELLOW}💡 You can start the local database with: docker-compose up -d${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Database connection successful${NC}"

# Check if financial_transactions table exists
echo -e "${YELLOW}🔍 Checking if financial_transactions table exists...${NC}"
TABLE_EXISTS=$(mysql -h"${DB_HOST:-localhost}" -P"${DB_PORT:-3306}" -u"${DB_USER:-webapp_user}" -p"${DB_PASSWORD:-webapp_pass}" -s -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '${DB_NAME:-webapp_db}' AND table_name = 'financial_transactions';")

if [ "$TABLE_EXISTS" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  financial_transactions table not found. Running migration...${NC}"
    if [ -f "scripts/migrate-financial-table.sh" ]; then
        chmod +x scripts/migrate-financial-table.sh
        ./scripts/migrate-financial-table.sh
    else
        echo -e "${RED}❌ Migration script not found. Please run the migration manually.${NC}"
        exit 1
    fi
fi

# Run the tests
echo -e "${YELLOW}🚀 Running financial transactions tests...${NC}"
echo ""

# Set test environment
export NODE_ENV=test

# Run tests with Jest
if npm test -- test/financial.test.js --verbose; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Test Summary:${NC}"
    echo "   ✅ Financial transaction submission"
    echo "   ✅ Data validation"
    echo "   ✅ Authentication requirements"
    echo "   ✅ Transaction retrieval"
    echo "   ✅ Summary and statistics"
    echo "   ✅ Database constraints"
    echo ""
    echo -e "${GREEN}🚀 Your financial transactions API is working correctly!${NC}"
else
    echo ""
    echo -e "${RED}❌ Some tests failed. Please check the output above.${NC}"
    exit 1
fi 