# 🚀 NPM Scripts Reference

## 📋 **Available Deployment Scripts**

### **🚀 Production Deployment**

```bash
npm run deploy:aws          # 🚀 Full AWS deployment (recommended)
npm run deploy:full         # 🚀 Full AWS deployment (direct script)
```

### **🏗️ Local Build Only**

```bash
npm run deploy:build        # 🏗️ Build locally only (recommended)
npm run deploy:local        # 🏗️ Build locally (direct script)
```

### **🔄 Legacy Commands**

```bash
npm run deploy              # 🏗️ Build only + manual upload instructions
```

## 🎯 **Quick Start**

### **For AWS Production Deployment**

```bash
cd CanadaGoose/client/
npm run deploy:aws          # 🚀 One command to deploy to AWS
```

### **For Local Testing**

```bash
cd CanadaGoose/client/
npm run deploy:build        # 🏗️ Build locally for testing
```

## 📊 **Script Comparison**

| NPM Script     | Purpose                         | Shell Equivalent                | Use Case                  |
| -------------- | ------------------------------- | ------------------------------- | ------------------------- |
| `deploy:aws`   | 🚀 Full AWS deployment          | `./deploy`                      | **Production deployment** |
| `deploy:build` | 🏗️ Build locally only           | `./deploy build`                | **Local testing**         |
| `deploy:local` | 🏗️ Build locally (direct)       | `./scripts/build-production.sh` | **Direct script access**  |
| `deploy:full`  | 🚀 Full AWS deployment (direct) | `./scripts/deploy-to-aws.sh`    | **Direct script access**  |

## 🔧 **What Each Script Does**

### **`npm run deploy:aws`** ⭐ **RECOMMENDED**

- ✅ Builds production bundle
- ✅ Creates deployment package
- ✅ Uploads to EC2
- ✅ Deploys to `/opt/app/client`
- ✅ Sets permissions
- ✅ **Restarts Nginx automatically**
- ✅ Tests deployment
- ✅ **One command for everything!**

### **`npm run deploy:build`** ⭐ **RECOMMENDED**

- ✅ Builds production bundle
- ✅ Creates deployment package
- ✅ Shows manual upload instructions
- ❌ Does NOT deploy to AWS
- **Perfect for local testing**

### **`npm run deploy:local`**

- ✅ Direct access to build script
- ✅ Same as `deploy:build`
- ❌ Less user-friendly output

### **`npm run deploy:full`**

- ✅ Direct access to deployment script
- ✅ Same as `deploy:aws`
- ❌ Less user-friendly output

## 🔄 **Nginx Management**

### **Automatic Nginx Restart**

Both deployment scripts now automatically restart Nginx after deploying new frontend files:

- **`deploy-to-aws.sh`**: Automatically restarts Nginx after deployment
- **`build-production.sh`**: Includes nginx restart commands in manual instructions
- **Fallback**: If restart fails, tries reload instead
- **Verification**: Checks nginx status after restart

### **Manual Nginx Commands**

```bash
# Restart Nginx (full restart)
ssh -i ../../infra/ssh_key ec2-user@44.195.110.182 'sudo systemctl restart nginx'

# Reload Nginx (graceful reload)
ssh -i ../../infra/ssh_key ec2-user@44.195.110.182 'sudo systemctl reload nginx'

# Check Nginx status
ssh -i ../../infra/ssh_key ec2-user@44.195.110.182 'sudo systemctl status nginx'
```

## 🚀 **Workflow Examples**

### **Daily Development Workflow**

```bash
# 1. Make changes to code
npm run dev                    # 🧪 Test locally

# 2. Build for production
npm run deploy:build          # 🏗️ Build locally

# 3. Test production build
npm run preview:prod          # 👀 Preview production build

# 4. Deploy to AWS when ready
npm run deploy:aws            # 🚀 Deploy to production
```

### **Quick Production Fix**

```bash
# Make urgent fix and deploy immediately
npm run deploy:aws            # 🚀 Build + Deploy in one command
```

### **Team Collaboration**

```bash
# Developer builds locally
npm run deploy:build          # 🏗️ Build for review

# DevOps deploys to production
npm run deploy:aws            # 🚀 Deploy after approval
```

## 🔍 **Troubleshooting**

### **Script Not Found**

```bash
# Make sure you're in the client directory
cd CanadaGoose/client/

# Check available scripts
npm run

# Verify scripts directory exists
ls -la scripts/
```

### **Permission Denied**

```bash
# Make scripts executable
chmod +x deploy
chmod +x scripts/*.sh
```

### **Build Fails**

```bash
# Check dependencies
npm install

# Clear cache
rm -rf node_modules package-lock.json
npm install
```

## 📚 **Related Documentation**

- **Main Guide**: [README.md](./README.md)
- **AWS Deployment**: [AWS_PRODUCTION_DEPLOYMENT.md](./AWS_PRODUCTION_DEPLOYMENT.md)
- **Scripts Reference**: [DEPLOYMENT_SCRIPTS_REFERENCE.md](./DEPLOYMENT_SCRIPTS_REFERENCE.md)

## 🎯 **Success Metrics**

✅ **Scripts Working When**:

- `npm run deploy:aws` deploys to AWS successfully
- `npm run deploy:build` creates production build
- All scripts show clear output and instructions
- No permission or path errors

---

**🚀 Your CanadaGoose deployment is now npm-powered!**

**Quick Deploy**: `npm run deploy:aws`  
**Quick Build**: `npm run deploy:build`  
**Status**: ✅ All scripts working perfectly
