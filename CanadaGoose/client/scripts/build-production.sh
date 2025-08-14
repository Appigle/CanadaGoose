#!/bin/bash

# Build Production Script for CanadaGoose Vue.js Client
# 🏗️  PURPOSE: Creates production build locally (does NOT deploy)
# 
# This script:
# 1. Builds the production bundle locally
# 2. Creates a deployment package (.tar.gz)
# 3. Shows manual deployment instructions
# 4. Does NOT upload or deploy to AWS
#
# For full AWS deployment, use: ./deploy-to-aws.sh
# For local development, use: npm run dev

set -e

echo "🏗️  Building CanadaGoose Client for Production (Local Build Only)..."
echo "📦 This script builds locally but does NOT deploy to AWS"
echo "🚀 For full deployment, use: ./deploy-to-aws.sh"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "vite.config.ts" ]; then
    echo "❌ Error: package.json or vite.config.ts not found. Please run this script from the client directory."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/

# Set production environment
export NODE_ENV=production
export VITE_API_BASE_URL=http://your-domain-here
export VITE_API_URL=http://your-domain-here/api
export VITE_FRONTEND_URL=http://your-domain-here

echo "🔧 Production Configuration:"
echo "   Environment: $NODE_ENV"
echo "   API Base URL: $VITE_API_BASE_URL"
echo "   API URL: $VITE_API_URL"
echo "   Frontend URL: $VITE_FRONTEND_URL"

# Build for production
echo "🔨 Building production bundle..."
npm run build:prod

# Check if build was successful
if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
    echo "✅ Production build completed successfully!"
    echo ""
    echo "📊 Build Summary:"
    echo "   Output directory: dist/"
    echo "   Files created:"
    ls -la dist/
    echo ""
    echo "📁 Key files:"
    echo "   Main HTML: dist/index.html"
    echo "   JavaScript: dist/assets/"
    echo "   CSS: dist/assets/"
    echo "   Static assets: dist/assets/"
    echo ""
    echo "🚀 Next Steps:"
echo "   1. Upload the dist/ folder to your server"
echo "   2. Place it in /var/www/app/ on your EC2 instance"
echo "   3. Ensure Nginx is configured to serve from this directory"
echo "   4. Restart Nginx to serve new files"
echo "   5. Test your application at http://your-domain-here/app"
echo ""
echo "💡 Manual Deployment Commands:"
echo "   scp -i ../../infra/ssh_key -r dist/* ec2-user@your-ec2-ip-here:/var/www/app/"
echo "   ssh -i ../../infra/ssh_key ec2-user@your-ec2-ip-here 'sudo systemctl restart nginx'"
echo ""
echo "🚀 OR use automated deployment:"
echo "   ./deploy-to-aws.sh"
else
    echo "❌ Build failed! Check the error messages above."
    exit 1
fi

# Optional: Create deployment package (exclude macOS-specific files)
echo "📦 Creating deployment package..."
tar -czf canadagoose-client-prod.tar.gz \
  --exclude=.DS_Store \
  --exclude=__MACOSX \
  --exclude="*.xattr" \
  --exclude="._*" \
  --exclude=".*" \
  dist/
echo "✅ Deployment package created: canadagoose-client-prod.tar.gz"
echo ""
echo "🎯 You can now upload this package to your server:"
echo "   scp -i ../../infra/ssh_key canadagoose-client-prod.tar.gz ec2-user@your-ec2-ip-here:/tmp/"
echo "   ssh -i ../../infra/ssh_key ec2-user@your-ec2-ip-here 'cd /opt/app && tar -xzf /tmp/canadagoose-client.tar.gz'"
echo "   ssh -i ../../infra/ssh_key ec2-user@your-ec2-ip-here 'sudo systemctl restart nginx'" 