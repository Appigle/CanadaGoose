#!/bin/bash

# Database Initialization Script for CanadaGoose
# This script initializes the MySQL database on RDS

set -e

echo "🚀 Initializing CanadaGoose Database..."

# Load environment variables
if [ -f .env ]; then
    echo "📁 Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Set default values if not in environment
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER:-"webapp_user"}
DB_PASSWORD=${DB_PASSWORD:-"your-db-password-here"}
DB_NAME=${DB_NAME:-"webapp_db"}

# Clean up host if it includes port (remove :port from host)
if [[ "$DB_HOST" == *:* ]]; then
    DB_HOST=$(echo "$DB_HOST" | cut -d: -f1)
    echo "🔧 Extracted host from host:port format: $DB_HOST"
fi

echo "🔗 Database Connection Details:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   User: $DB_USER"
echo "   Database: $DB_NAME"

# Test database connection
echo "🧪 Testing database connection..."
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1 as test;" > /dev/null 2>&1; then
    echo "✅ Database connection successful!"
else
    echo "❌ Database connection failed!"
    echo "Please check your database credentials and ensure the RDS instance is running."
    echo "Trying to connect with verbose output..."
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1 as test;"
    exit 1
fi

# Create database if it doesn't exist
echo "🗄️  Creating database if it doesn't exist..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;"

# Initialize database schema
echo "📋 Initializing database schema..."
if [ -f "database/init.sql" ]; then
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database/init.sql
    echo "✅ Schema initialization completed!"
else
    echo "⚠️  Warning: database/init.sql not found, skipping schema initialization"
fi

echo "✅ Database initialization completed successfully!"
echo "🎉 Your CanadaGoose database is ready to use!"

# Show database status
echo "📊 Database Status:"
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME; SHOW TABLES;"

# Show sample data if available
echo "📋 Sample Data Check:"
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME; SELECT COUNT(*) as user_count FROM users;" 2>/dev/null; then
    echo "✅ Users table is accessible and contains data"
else
    echo "⚠️  Users table may not exist or be accessible"
fi 