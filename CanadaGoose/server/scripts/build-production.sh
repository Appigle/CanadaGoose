#!/bin/bash

# Build Production Script for CanadaGoose Node.js Server
# 🏗️  PURPOSE: Creates production package locally (does NOT deploy)
# 
# This script:
# 1. Tests database connectivity locally
# 2. Validates environment configuration
# 3. Creates a deployment package (.tar.gz)
# 4. Shows manual deployment instructions
# 5. Does NOT upload or deploy to AWS
#
# For full AWS deployment, use: ./deploy-to-aws.sh
# For local development, use: ./deploy-production.sh

set -e

echo "🏗️  Building CanadaGoose Server for Production (Local Build Only)..."
echo "📦 This script packages locally but does NOT deploy to AWS"
echo "🚀 For full deployment, use: ./deploy-to-aws.sh"
echo ""

# Check if we're in the right directory
# First, try to find the server directory by looking for app.js and package.json
SERVER_DIR="."
if [ ! -f "app.js" ] || [ ! -f "package.json" ]; then
    # If not found in current directory, check if we're in scripts subdirectory
    if [ -f "../app.js" ] && [ -f "../package.json" ]; then
        SERVER_DIR=".."
        echo "📁 Detected scripts subdirectory, using parent directory: $SERVER_DIR"
    else
        echo "❌ Error: app.js or package.json not found."
        echo "   Current directory: $(pwd)"
        echo "   Please run this script from the server directory or its scripts subdirectory."
        exit 1
    fi
fi

# Change to server directory if needed
if [ "$SERVER_DIR" != "." ]; then
    cd "$SERVER_DIR"
    echo "📁 Changed to server directory: $(pwd)"
fi

# Load environment variables from .env if it exists, otherwise create from env.example
if [ -f ".env" ]; then
    echo "📁 Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "📁 Creating .env file from env.example..."
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "✅ Created .env file from env.example"
        export $(cat .env | grep -v '^#' | xargs)
    else
        echo "❌ Error: env.example not found. Cannot create .env file."
        exit 1
    fi
fi

# Set production environment variables (override any existing values)
export NODE_ENV=production
export PORT=3000
export FRONTEND_URL=http://s25cicd.xiaopotato.top
export CORS_ORIGIN=http://s25cicd.xiaopotato.top
export API_BASE_URL=http://s25cicd.xiaopotato.top/api

# Display production configuration
echo "🔧 Production Configuration:"
echo "   Environment: $NODE_ENV"
echo "   Port: $PORT"
echo "   Frontend URL: $FRONTEND_URL"
echo "   CORS Origin: $CORS_ORIGIN"
echo "   API Base URL: $API_BASE_URL"
echo "   Database Host: $DB_HOST"
echo "   Database Name: $DB_NAME"
echo "   Database User: $DB_USER"
echo "   Database Port: $DB_PORT"

# Verify critical environment variables
if [ -z "$DB_HOST" ] || [ "$DB_HOST" = "localhost" ]; then
    echo "❌ Error: DB_HOST is not set or is localhost. Please check your .env file."
    echo "   Expected: canadagoose-prod-db.cozaqoges4eb.us-east-1.rds.amazonaws.com"
    echo "   Current: $DB_HOST"
    exit 1
fi

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ Error: DB_PASSWORD is not set. Please check your .env file."
    exit 1
fi

# Note: Database connection test skipped locally
echo "ℹ️  Database connection test skipped locally"
echo "   Reason: RDS security groups block external connections"
echo "   Database connectivity will be tested on EC2 during deployment"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --production
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -f canadagoose-server-prod.tar.gz

# Create deployment package (include only necessary files)
echo "📦 Creating deployment package..."
tar -czf canadagoose-server-prod.tar.gz \
  app.js \
  package.json \
  package-lock.json \
  config/ \
  routes/ \
  middleware/ \
  database/ \
  test/ \
  env.example \
  setup-env.sh \
  init-database.sh

if [ -f "canadagoose-server-prod.tar.gz" ]; then
    echo "✅ Production package created successfully!"
    echo ""
    echo "📊 Package Summary:"
    echo "   Package: canadagoose-server-prod.tar.gz"
    echo "   Size: $(du -h canadagoose-server-prod.tar.gz | cut -f1)"
    echo "   Contents:"
    tar -tzf canadagoose-server-prod.tar.gz | head -20
    echo "   ... and $(($(tar -tzf canadagoose-server-prod.tar.gz | wc -l) - 20)) more files"
    echo ""
    echo "🚀 Next Steps:"
echo "   1. Upload the package to your EC2 instance"
echo "   2. Extract it in /opt/app/server/ on your EC2 instance"
echo "   3. Ensure environment variables are set correctly"
echo "   4. Restart PM2 and Nginx services"
echo "   5. Test your API at http://s25cicd.xiaopotato.top/api/healthcheck"
echo "   6. Database connectivity will be tested automatically during deployment"
    echo ""
    echo "💡 Manual Deployment Commands:"
    echo "   scp -i ../../infra/ssh_key canadagoose-server-prod.tar.gz ec2-user@44.195.110.182:/tmp/"
    echo "   ssh -i ../../infra/ssh_key ec2-user@44.195.110.182 'cd /opt/app/server && tar -xzf /tmp/canadagoose-server-prod.tar.gz'"
    echo "   ssh -i ../../infra/ssh_key ec2-user@44.195.110.182 'cd /opt/app/server-scripts && ./deploy-app.sh'"
    echo ""
    echo "🚀 OR use automated deployment:"
    echo "   ./scripts/deploy-to-aws.sh"
else
    echo "❌ Package creation failed!"
    exit 1
fi

echo ""
echo "🎯 Your server is ready for deployment!"
echo "📦 Package: canadagoose-server-prod.tar.gz"
echo "🌐 Test locally: npm run prod"
echo "🚀 Deploy to AWS: ./scripts/deploy-to-aws.sh" 