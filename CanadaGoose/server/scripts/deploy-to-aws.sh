#!/bin/bash
set -e

echo "🚀 Deploying CanadaGoose Node.js Server to AWS Production..."
echo "🌐 This script builds AND deploys to AWS EC2 automatically"
echo "🏗️  For build-only (local), use: ./build-production.sh"
echo ""

# Variables
EC2_IP="44.195.110.182"
SSH_KEY="../../infra/ssh_key"
SERVER_DIR="CanadaGoose/server"

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

echo "🔧 Building for production..."
echo "   Environment: Production"
echo "   API Base URL: http://s25cicd.xiaopotato.top/api"
echo "   Server Port: 3000"

# Update version before deployment
echo ""
echo "🏷️  Updating version before deployment..."
echo "   Current version: $(node -e "console.log(require('./package.json').version)")"

# Check if version update script exists
if [ -f "scripts/interactive-version.js" ]; then
    echo "   Updating patch version..."
    if node scripts/interactive-version.js --patch --auto --silent; then
        NEW_VERSION=$(node -e "console.log(require('./package.json').version)")
        echo "   ✅ Version updated to: $NEW_VERSION"
        echo "   📝 Changes committed to git"
    else
        echo "   ⚠️  Version update failed, continuing with current version"
    fi
else
    echo "   ⚠️  Version update script not found, continuing with current version"
fi

echo "   Final version: $(node -e "console.log(require('./package.json').version)")"
echo ""

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

# Set production environment variables
export NODE_ENV=production
export PORT=3000
export FRONTEND_URL=http://s25cicd.xiaopotato.top
export CORS_ORIGIN=http://s25cicd.xiaopotato.top
export API_BASE_URL=http://s25cicd.xiaopotato.top/api

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

# Note: Database connection test will be performed on EC2
echo "ℹ️  Database connection test will be performed on EC2"
echo "   Reason: RDS security groups block external connections from local machine"
echo "   Database connectivity will be tested after deployment on EC2"
echo ""

# Check dependencies
echo "📦 Checking dependencies..."
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
  scripts/ \
  env.example \
  setup-env.sh \
  init-database.sh

if [ ! -f "canadagoose-server-prod.tar.gz" ]; then
    echo "❌ Package creation failed!"
    exit 1
fi

echo "📁 Package created: canadagoose-server-prod.tar.gz"
echo "📏 Package size: $(du -h canadagoose-server-prod.tar.gz | cut -f1)"

# Upload to EC2
echo "📤 Uploading to EC2..."
if scp -i "$SSH_KEY" canadagoose-server-prod.tar.gz "ec2-user@$EC2_IP:/tmp/"; then
    echo "✅ Upload successful!"
else
    echo "❌ Upload failed! Check your SSH key and EC2 connection."
    exit 1
fi

# Deploy on EC2
echo "🔧 Deploying on EC2..."
ssh -i "$SSH_KEY" "ec2-user@$EC2_IP" << 'REMOTE_COMMANDS'
    echo "🚀 Starting server deployment on EC2..."
    
    # Check if deployment package exists
    echo "📦 Checking deployment package..."
    if [ ! -f "/tmp/canadagoose-server-prod.tar.gz" ]; then
        echo "❌ Deployment package not found!"
        exit 1
    fi
    
    # Create backup of current deployment
    echo "💾 Creating backup..."
    if [ -d "/opt/app/server" ]; then
        sudo cp -r /opt/app/server /opt/app/server.backup.$(date +%Y%m%d_%H%M%S)
        echo "✅ Backup created"
    fi
    
    # Stop PM2 process if running
    echo "🛑 Stopping PM2 process..."
    if pm2 list | grep -q "canadagoose-server"; then
        pm2 stop canadagoose-server
        pm2 delete canadagoose-server
        echo "✅ PM2 process stopped and removed"
    else
        echo "ℹ️  No PM2 process found"
    fi
    
    # Extract new deployment
    echo "📁 Extracting deployment package..."
    cd /tmp
    # Use tar with options to handle macOS extended attributes and ignore errors
    tar -xzf canadagoose-server-prod.tar.gz --warning=no-timestamp --warning=no-unknown-keyword 2>/dev/null || {
        echo "⚠️  Some tar warnings occurred (normal on macOS), continuing with deployment..."
    }
    
    # Deploy to application directory
    echo "📁 Deploying to /opt/app/server..."
    sudo mkdir -p /opt/app/server
    sudo rm -rf /opt/app/server/*
    
    # Copy files while excluding macOS-specific files
    echo "📋 Copying application files..."
    for item in *; do
        if [ "$item" != "__MACOSX" ] && [ "$item" != ".DS_Store" ] && [ "$item" != ".*" ]; then
            sudo cp -r "$item" /opt/app/server/
        fi
    done
    
    # Set correct permissions
    echo "🔐 Setting permissions..."
    sudo chown -R ec2-user:ec2-user /opt/app/server
    sudo chmod -R 755 /opt/app/server
    
    # Install production dependencies
    echo "📦 Installing production dependencies..."
    cd /opt/app/server
    npm install --production
    
    # Create .env file from env.example
    echo "📁 Setting up environment..."
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "✅ Created .env file from env.example"
    else
        echo "⚠️  Warning: env.example not found"
    fi
    
    # Start PM2 process
    echo "🚀 Starting PM2 process..."
    pm2 start app.js --name "canadagoose-server" --env production
    pm2 save
    pm2 startup
    
    # Clean up temporary files
    echo "🧹 Cleaning up..."
    rm -rf /tmp/* /tmp/.* 2>/dev/null || true
    
    # Test deployment
    echo "🧪 Testing deployment..."
    sleep 5  # Wait for server to start
    
    if pm2 list | grep -q "canadagoose-server.*online"; then
        echo "✅ PM2 process is running"
        echo "📊 Process info:"
        pm2 show canadagoose-server
        
        # Test API endpoint
        echo "🌐 Testing API endpoint..."
        if curl -s http://localhost:3000/api/healthcheck | grep -q "status"; then
            echo "✅ API is responding correctly"
        else
            echo "⚠️  API may not be fully ready yet"
        fi
        
        # Test version endpoint
        echo "🏷️  Testing version endpoint..."
        if curl -s http://localhost:3000/api/version | grep -q "version"; then
            echo "✅ Version endpoint is responding correctly"
            # Display version information
            echo "📋 Version information:"
            curl -s http://localhost:3000/api/version | jq -r '.version, .name, .environment' 2>/dev/null || {
                echo "   Version: $(curl -s http://localhost:3000/api/version | grep -o '"version":"[^"]*"' | cut -d'"' -f4)"
                echo "   Name: $(curl -s http://localhost:3000/api/version | grep -o '"name":"[^"]*"' | cut -d'"' -f4)"
                echo "   Environment: $(curl -s http://localhost:3000/api/version | grep -o '"environment":"[^"]*"' | cut -d'"' -f4)"
            }
        else
            echo "⚠️  Version endpoint may not be fully ready yet"
        fi
        
        # Test database connection on EC2
        echo "🗄️  Testing database connection on EC2..."
        if node -e "
        const { testConnection } = require('./config/database');
        testConnection()
          .then(success => {
            if (success) {
              console.log('✅ Database connection successful on EC2');
              process.exit(0);
            } else {
              console.log('❌ Database connection failed on EC2');
              process.exit(1);
            }
          })
          .catch(err => {
            console.error('❌ Database test error on EC2:', err.message);
            process.exit(1);
          });
        "; then
            echo "✅ Database connection test passed on EC2"
        else
            echo "❌ Database connection test failed on EC2"
            echo "Please check RDS configuration and security groups"
            exit 1
        fi
    else
        echo "❌ PM2 process failed to start!"
        echo "📋 PM2 logs:"
        pm2 logs canadagoose-server --lines 10
        exit 1
    fi
    
    echo "✅ Server deployment completed successfully!"
REMOTE_COMMANDS

# Test external API endpoints
echo ""
echo "🌐 Testing external API endpoints..."
echo "   Testing from local machine to production server..."

# Test health check endpoint
if curl -s http://s25cicd.xiaopotato.top/api/healthcheck | grep -q "status"; then
    echo "✅ External health check endpoint is accessible"
else
    echo "⚠️  External health check endpoint may not be accessible yet"
fi

# Test version endpoint
if curl -s http://s25cicd.xiaopotato.top/api/version | grep -q "version"; then
    echo "✅ External version endpoint is accessible"
    echo "📋 Production version information:"
    curl -s http://s25cicd.xiaopotato.top/api/version | jq -r '.version, .name, .environment' 2>/dev/null || {
        echo "   Version: $(curl -s http://s25cicd.xiaopotato.top/api/version | grep -o '"version":"[^"]*"' | cut -d'"' -f4)"
        echo "   Name: $(curl -s http://s25cicd.xiaopotato.top/api/version | grep -o '"name":"[^"]*"' | cut -d'"' -f4)"
        echo "   Environment: $(curl -s http://s25cicd.xiaopotato.top/api/version | grep -o '"environment":"[^"]*"' | cut -d'"' -f4)"
    }
else
    echo "⚠️  External version endpoint may not be accessible yet"
fi

echo ""
echo "🎉 Server deployment completed successfully!"
echo ""
echo "📊 Deployment Summary:"
echo "   ✅ Version updated to: $(node -e "console.log(require('./package.json').version)")"
echo "   ✅ Production package created"
echo "   ✅ Files uploaded to EC2"
echo "   ✅ Deployed to /opt/app/server"
echo "   ✅ Dependencies installed"
echo "   ✅ PM2 process started"
echo "   ✅ Environment configured"
echo "   ✅ API endpoints tested (healthcheck + version)"
echo "   ✅ Database connection tested on EC2"
echo ""
echo "🌐 Your server is now available at:"
echo "   API: http://s25cicd.xiaopotato.top/api"
echo "   Health Check: http://s25cicd.xiaopotato.top/api/healthcheck"
echo ""
echo "🔍 Test your deployment:"
echo "   curl http://s25cicd.xiaopotato.top/api/healthcheck"
echo "   curl http://s25cicd.xiaopotato.top/api/version"
echo "   ssh -i ../../infra/ssh_key ec2-user@44.195.110.182 'pm2 status'"
echo ""
echo "💡 Next steps:"
echo "   1. Test the API endpoints"
echo "   2. Database connectivity already verified on EC2"
echo "   3. Check PM2 logs if needed: pm2 logs canadagoose-server"
echo "   4. Monitor server performance"
echo "   5. Version automatically bumped to: $(node -e "console.log(require('./package.json').version)")"
echo ""
echo "🚀 Deployment script completed successfully!" 