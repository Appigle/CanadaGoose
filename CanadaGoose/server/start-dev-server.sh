#!/bin/bash

# LOCAL Development Server Script for CanadaGoose API Server
# 🚀 PURPOSE: Starts local development server for testing and development
# 
# This script:
# 1. Validates environment configuration
# 2. Installs dependencies locally
# 3. Starts the server locally for development/testing
# 4. Provides local API access at localhost:3000
#
# For production deployment packages, use: ./scripts/build-production.sh
# For AWS deployment, use: ./scripts/deploy-to-aws.sh
# For server management, see: infra/SERVER_MANAGEMENT.md

set -e

echo "🚀 LOCAL Development & Testing for CanadaGoose API Server..."
echo "⚠️  This script runs on your LOCAL machine, not on EC2!"
echo ""

# Check if we're in the right directory
if [ ! -f "app.js" ]; then
    echo "❌ Error: app.js not found. Please run this script from the server directory."
    exit 1
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

# Note: Database connection test skipped for local development
echo "ℹ️  Database connection test skipped for local development"
echo "   Reason: RDS security groups block external connections"
echo "   Database connectivity will be tested during AWS deployment"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --production
fi

# Start the production server
echo "🚀 Starting production server..."
echo "📊 Server Configuration:"
echo "   🔌 Internal Server: http://localhost:3000"
echo "   🔗 Internal API: http://localhost:3000/api"
echo "   📊 Internal Health: http://localhost:3000/api/healthcheck"
echo ""
echo "   🌍 External Access (via Nginx):"
echo "   🎨 Frontend: http://s25cicd.xiaopotato.top/app"
echo "   🔗 API: http://s25cicd.xiaopotato.top/api"
echo "   📊 Health: http://s25cicd.xiaopotato.top/api/healthcheck"
echo ""
echo "💡 Note: Server runs on localhost:3000, Nginx proxies external traffic"
echo ""

# Start the server
npm run prod 