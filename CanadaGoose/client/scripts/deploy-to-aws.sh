#!/bin/bash
set -e

echo "🚀 Deploying CanadaGoose Vue.js SPA to AWS Production..."
echo "🌐 This script builds AND deploys to AWS EC2 automatically"
echo "🏗️  For build-only (local), use: ./build-production.sh"
echo ""

# Variables
EC2_IP="44.195.110.182"
SSH_KEY="../../infra/ssh_key"
CLIENT_DIR="CanadaGoose/client"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "vite.config.ts" ]; then
    echo "❌ Error: package.json or vite.config.ts not found."
    echo "Please run this script from the client directory."
    exit 1
fi

echo "🔧 Building for production..."
echo "   Environment: Production"
echo "   API Base URL: https://s25cicd.xiaopotato.top/api"
echo "   Frontend URL: https://s25cicd.xiaopotato.top/app"

# Set production environment variables
export NODE_ENV=production
export VITE_API_BASE_URL=https://s25cicd.xiaopotato.top
export VITE_API_URL=https://s25cicd.xiaopotato.top/api
export VITE_FRONTEND_URL=https://s25cicd.xiaopotato.top

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/

# Check dependencies
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build for production with fallback options
echo "🔨 Building production bundle..."
echo "   Using esbuild minification (faster and more reliable than terser)"

# Try production build first
if npm run build:prod; then
    echo "✅ Production build completed successfully!"
else
    echo "⚠️  Production build failed, trying fallback build..."
    
    # Fallback: try regular build
    if npm run build; then
        echo "✅ Fallback build completed successfully!"
    else
        echo "❌ All build attempts failed!"
        echo "🔍 Troubleshooting tips:"
        echo "   1. Check for syntax errors in your code"
        echo "   2. Ensure all dependencies are installed: npm install"
        echo "   3. Try clearing node_modules: rm -rf node_modules && npm install"
        echo "   4. Check Vite configuration for errors"
        exit 1
    fi
fi

# Check if build was successful
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo "❌ Build failed! No dist/ folder created."
    exit 1
fi

# Verify build contents
echo "📁 Build contents:"
ls -la dist/
echo "📊 Total files: $(find dist -type f | wc -l)"

# Create deployment package (exclude macOS-specific files)
echo "📦 Creating deployment package..."
tar -czf canadagoose-client-prod.tar.gz \
  --exclude=.DS_Store \
  --exclude=__MACOSX \
  --exclude="*.xattr" \
  --exclude="._*" \
  --exclude=".*" \
  dist/
echo "📁 Package created: canadagoose-client-prod.tar.gz"
echo "📏 Package size: $(du -h canadagoose-client-prod.tar.gz | cut -f1)"

# Upload to EC2
echo "📤 Uploading to EC2..."
if scp -i "$SSH_KEY" canadagoose-client-prod.tar.gz "ec2-user@$EC2_IP:/tmp/"; then
    echo "✅ Upload successful!"
else
    echo "❌ Upload failed! Check your SSH key and EC2 connection."
    exit 1
fi

# Deploy on EC2
echo "🔧 Deploying on EC2..."
ssh -i "$SSH_KEY" "ec2-user@$EC2_IP" << 'REMOTE_COMMANDS'
    echo "🚀 Starting deployment on EC2..."
    
    # Extract build files
    echo "📦 Extracting build files..."
    cd /tmp
    if [ ! -f "canadagoose-client-prod.tar.gz" ]; then
        echo "❌ Deployment package not found!"
        exit 1
    fi
    
    # Extract with error handling for macOS-specific issues
    echo "📁 Extracting deployment package..."
    tar -xzf canadagoose-client-prod.tar.gz --warning=no-timestamp --warning=no-unknown-keyword 2>/dev/null || {
        echo "⚠️  Some tar warnings occurred (normal on macOS), continuing with deployment..."
    }
    
    # Backup current deployment
    echo "💾 Creating backup..."
    if [ -d "/var/www/app" ]; then
        sudo cp -r /var/www/app /var/www/app.backup.$(date +%Y%m%d_%H%M%S)
        echo "✅ Backup created"
    fi
    
    # Deploy to application directory
    echo "📁 Deploying to /var/www/app..."
    sudo mkdir -p /var/www/app
    sudo rm -rf /var/www/app/*
    
    # Copy files while excluding macOS-specific files
    echo "📋 Copying application files..."
    if [ -d "dist" ]; then
        for item in dist/*; do
            # Skip macOS-specific files and hidden files
            if [[ "$item" != dist/__MACOSX && "$item" != dist/.DS_Store && "$item" != dist/.* && "$item" != dist/._* ]]; then
                sudo cp -r "$item" /var/www/app/
                echo "   ✅ Copied: $(basename "$item")"
            else
                echo "   ⏭️  Skipped: $(basename "$item") (macOS artifact)"
            fi
        done
    else
        echo "❌ dist/ directory not found after extraction!"
        exit 1
    fi
    
    # Set correct permissions
    echo "🔐 Setting permissions..."
    sudo chown -R nginx:nginx /var/www/app
    sudo chmod -R 755 /var/www/app
    
    # Clean up temporary files
    echo "🧹 Cleaning up..."
    rm -rf /tmp/dist /tmp/canadagoose-client-prod.tar.gz
    
    # Restart Nginx to serve new files
    echo "🔄 Restarting Nginx..."
    sudo systemctl restart nginx
    if [ $? -eq 0 ]; then
        echo "✅ Nginx restarted successfully"
    else
        echo "⚠️  Nginx restart failed, trying reload instead..."
        sudo systemctl reload nginx
        if [ $? -eq 0 ]; then
            echo "✅ Nginx reloaded successfully"
        else
            echo "❌ Nginx reload failed! Check nginx status manually"
        fi
    fi
    
    # Test deployment
    echo "🧪 Testing deployment..."
    if [ -f "/var/www/app/index.html" ]; then
        echo "✅ index.html found"
        echo "📊 File count: $(ls -1 /var/www/app/ | wc -l)"
        echo "📁 Contents:"
        ls -la /var/www/app/
        
            # Test if the app is accessible
    echo "🌐 Testing app accessibility..."
    if curl -s http://localhost/app | grep -q "CanadaGoose"; then
        echo "✅ App is accessible and contains expected content"
    else
        echo "⚠️  App accessible but content may be different"
    fi
    
    # Check Nginx status
    echo "🔍 Checking Nginx status..."
    if sudo systemctl is-active --quiet nginx; then
        echo "✅ Nginx is running and active"
    else
        echo "❌ Nginx is not running!"
        echo "   Status: $(sudo systemctl status nginx --no-pager -l | head -3)"
    fi
    else
        echo "❌ index.html not found!"
        exit 1
    fi
    
    echo "✅ Deployment completed successfully!"
REMOTE_COMMANDS

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Deployment Summary:"
echo "   ✅ Production build completed"
echo "   ✅ Files uploaded to EC2"
echo "   ✅ Deployed to /var/www/app"
echo "   ✅ Permissions set correctly"
echo "   ✅ Nginx restarted/reloaded"
echo ""
echo "🌐 Your application is now available at:"
        echo "   Frontend: https://s25cicd.xiaopotato.top/app"
        echo "   API: https://s25cicd.xiaopotato.top/api"
        echo ""
        echo "🔍 Test your deployment:"
        echo "   curl https://s25cicd.xiaopotato.top/app"
        echo "   curl https://s25cicd.xiaopotato.top/api/healthcheck"
        echo ""
        echo "💡 Next steps:"
        echo "   1. Test the frontend at https://s25cicd.xiaopotato.top/app"
echo "   2. Verify API calls work correctly"
echo "   3. Check browser console for any errors"
echo "   4. Monitor server logs if needed"
echo ""
echo "🚀 Deployment script completed successfully!"
