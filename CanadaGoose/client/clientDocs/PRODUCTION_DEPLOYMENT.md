# 🚀 CanadaGoose Client Production Deployment Guide

This guide explains how to deploy your Vue.js client to production with the correct API base URLs.

## **🔧 Configuration Overview**

The client is configured to automatically switch between development and production environments:

- **Development**: Uses `http://localhost:3000/api` for API calls
- **Production**: Uses `http://s25cicd.xiaopotato.top/api` for API calls

## **📁 Configuration Files**

### **1. API Configuration (`src/config/api.ts`)**

- Automatically detects environment (dev/prod)
- Provides correct API base URLs
- Exports axios configuration

### **2. Environment Files**

- `env.development` - Development configuration
- `env.production` - Production configuration

### **3. Vite Configuration (`vite.config.ts`)**

- Environment-aware build configuration
- Production optimizations
- Development proxy settings

## **🚀 Production Build Commands**

### **Option 1: Using the Deployment Script (Recommended)**

```bash
cd CanadaGoose/client
./deploy-production.sh
```

### **Option 2: Manual Build**

```bash
cd CanadaGoose/client

# Set production environment
export NODE_ENV=production
export VITE_API_BASE_URL=http://s25cicd.xiaopotato.top
export VITE_API_URL=http://s25cicd.xiaopotato.top/api

# Build for production
npm run build:prod
```

### **Option 3: Using NPM Scripts**

```bash
cd CanadaGoose/client
npm run deploy
```

## **📦 Build Output**

After successful build, you'll get:

```
dist/
├── index.html          # Main HTML file
├── assets/
│   ├── index-*.js      # JavaScript bundles
│   ├── index-*.css     # CSS bundles
│   └── *.png           # Static assets
└── favicon.ico         # Favicon
```

## **🌐 Deployment to Server**

### **Step 1: Build the Client**

```bash
./deploy-production.sh
```

### **Step 2: Upload to Server**

```bash
# Upload the built files
scp -r dist/* ec2-user@44.195.110.182:/var/www/app/

# Or upload the package
scp canadagoose-client-prod.tar.gz ec2-user@44.195.110.182:/tmp/
ssh ec2-user@44.195.110.182 'cd /opt/app && tar -xzf /tmp/canadagoose-client-prod.tar.gz'
```

### **Step 3: Verify Deployment**

```bash
# Check if files are uploaded
ssh ec2-user@44.195.110.182 'ls -la /var/www/app/'

# Test the application
curl http://s25cicd.xiaopotato.top/app
```

## **🔍 Environment Variables**

### **Development**

```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000/api
VITE_FRONTEND_URL=http://localhost:5173
```

### **Production**

```bash
VITE_API_BASE_URL=http://s25cicd.xiaopotato.top
VITE_API_URL=http://s25cicd.xiaopotato.top/api
VITE_FRONTEND_URL=http://s25cicd.xiaopotato.top
```

## **📱 Testing Your Production Build**

### **Local Preview**

```bash
# Preview production build locally
npm run preview:prod

# Access at http://localhost:4173
```

### **Production Testing**

```bash
# Test the deployed application
open http://s25cicd.xiaopotato.top/app

# Test API endpoints
curl http://s25cicd.xiaopotato.top/api/healthcheck
```

## **🔧 Troubleshooting**

### **Build Issues**

```bash
# Clean and rebuild
rm -rf dist/ node_modules/
npm install
npm run build:prod
```

### **API Connection Issues**

- Verify server is running on EC2
- Check CORS configuration
- Ensure domain DNS is correct
- Verify Nginx proxy configuration

### **Environment Issues**

```bash
# Check current environment
echo $NODE_ENV
echo $VITE_API_URL

# Force production mode
export NODE_ENV=production
npm run build:prod
```

## **📊 Production Features**

- **Code Splitting**: Automatic vendor and UI chunking
- **Minification**: Terser minification for production
- **Source Maps**: Disabled in production for security
- **Asset Optimization**: Optimized file names and caching
- **Environment Detection**: Automatic API URL switching

## **🎯 Quick Deployment Checklist**

- [ ] Run `./deploy-production.sh`
- [ ] Verify `dist/` folder is created
- [ ] Upload files to `/var/www/app/` on EC2
- [ ] Test application at `http://s25cicd.xiaopotato.top/app`
- [ ] Verify API calls work correctly
- [ ] Check browser console for errors

## **💡 Pro Tips**

1. **Always use the deployment script** for consistent builds
2. **Test locally first** with `npm run preview:prod`
3. **Keep environment files updated** when changing URLs
4. **Monitor browser console** for API connection issues
5. **Use browser dev tools** to verify production URLs

Your client is now ready for production deployment with the correct API base URLs! 🚀
