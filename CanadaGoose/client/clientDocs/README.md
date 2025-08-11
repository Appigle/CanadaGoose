# 📚 CanadaGoose Client Documentation

Welcome to the CanadaGoose Vue.js client documentation! This directory contains all the deployment and production guides for your application.

## 📋 **Documentation Index**

### 🚀 **Deployment Guides**

| Document                                                            | Purpose                          | When to Use                      |
| ------------------------------------------------------------------- | -------------------------------- | -------------------------------- |
| **[AWS Production Deployment](AWS_PRODUCTION_DEPLOYMENT.md)**       | 🚀 Complete AWS deployment guide | Deploying to production on AWS   |
| **[Production Deployment](PRODUCTION_DEPLOYMENT.md)**               | 🏗️ General production deployment | Understanding deployment process |
| **[Deployment Scripts Reference](DEPLOYMENT_SCRIPTS_REFERENCE.md)** | 📖 Script usage guide            | Understanding deployment scripts |

### 🛠️ **Quick Reference**

| Script                    | Location      | Purpose                |
| ------------------------- | ------------- | ---------------------- |
| **`build-production.sh`** | `../scripts/` | 🏗️ Build locally only  |
| **`deploy-to-aws.sh`**    | `../scripts/` | 🚀 Full AWS deployment |

## 🎯 **Quick Start**

### **🚀 NPM Scripts (Recommended)**

```bash
cd CanadaGoose/client/

# Full AWS deployment
npm run deploy:aws          # 🚀 Deploy to AWS (default)

# Build only (local)
npm run deploy:build        # 🏗️ Build locally only

# Direct script access
npm run deploy:local        # 🏗️ Build locally (direct script)
npm run deploy:full         # 🚀 Full AWS deployment (direct script)
```

### **For Production Deployment (Recommended)**

```bash
cd CanadaGoose/client/
./deploy                    # 🚀 Full AWS deployment (default)
# OR
npm run deploy:aws          # 🚀 Full AWS deployment via npm
# OR
./scripts/deploy-to-aws.sh  # 🚀 Full AWS deployment
```

### **For Local Build Only**

```bash
cd CanadaGoose/client/
./deploy build              # 🏗️ Build locally only
# OR
npm run deploy:build        # 🏗️ Build locally only via npm
# OR
./scripts/build-production.sh  # 🏗️ Build locally only
```

## 🌐 **Production URLs**

| Service        | URL                                             | Status  |
| -------------- | ----------------------------------------------- | ------- |
| **Frontend**   | `http://s25cicd.xiaopotato.top/app`             | ✅ Live |
| **API Health** | `http://s25cicd.xiaopotato.top/api/healthcheck` | ✅ Live |
| **API Base**   | `http://s25cicd.xiaopotato.top/api`             | ✅ Live |

## 📁 **Directory Structure**

```
CanadaGoose/client/
├── clientDocs/                              # 📚 This documentation directory
│   ├── README.md                            # 📖 This index file
│   ├── AWS_PRODUCTION_DEPLOYMENT.md        # 🚀 AWS deployment guide
│   ├── PRODUCTION_DEPLOYMENT.md            # 🏗️ General deployment guide
│   └── DEPLOYMENT_SCRIPTS_REFERENCE.md     # 📖 Script reference
├── deploy                                   # 🚀 Main deployment script
├── scripts/                                 # 🛠️ Deployment scripts
│   ├── build-production.sh                  # 🏗️ Build locally only
│   └── deploy-to-aws.sh                    # 🚀 Full AWS deployment
├── src/                                     # 🎨 Vue.js source code
├── dist/                                    # 🚀 Production build output
└── ... (other project files)
```

## 🔄 **Deployment Workflow**

### **1. Make Code Changes**

- Edit files in `src/` directory
- Test locally with `npm run dev`

### **2. Deploy to Production**

```bash
cd CanadaGoose/client/
npm run deploy:aws          # 🚀 Recommended: Use npm script
# OR
./deploy                    # 🚀 Use deploy wrapper
# OR
./scripts/deploy-to-aws.sh  # 🚀 Direct script access
```

### **3. Verify Deployment**

- Check frontend: `http://s25cicd.xiaopotato.top/app`
- Check API health: `http://s25cicd.xiaopotato.top/api/healthcheck`

## 📋 **Available Commands**

### **🚀 NPM Scripts (Recommended)**

| Command                | Purpose                         | Equivalent                      |
| ---------------------- | ------------------------------- | ------------------------------- |
| `npm run deploy:aws`   | 🚀 Full AWS deployment          | `./deploy`                      |
| `npm run deploy:build` | 🏗️ Build locally only           | `./deploy build`                |
| `npm run deploy:local` | 🏗️ Build locally (direct)       | `./scripts/build-production.sh` |
| `npm run deploy:full`  | 🚀 Full AWS deployment (direct) | `./scripts/deploy-to-aws.sh`    |

### **🛠️ Shell Scripts**

| Command                         | Purpose                    | Location          |
| ------------------------------- | -------------------------- | ----------------- |
| `./deploy`                      | 🚀 Main deployment wrapper | `client/`         |
| `./deploy build`                | 🏗️ Build-only mode         | `client/`         |
| `./scripts/build-production.sh` | 🏗️ Build locally only      | `client/scripts/` |
| `./scripts/deploy-to-aws.sh`    | 🚀 Full AWS deployment     | `client/scripts/` |

## 🛠️ **Troubleshooting**

### **Common Issues**

- **Build failures**: Check `build-production.sh` output
- **Deployment failures**: Check `deploy-to-aws.sh` output
- **App not accessible**: Check Nginx and file permissions
- **API issues**: Check server logs and PM2 status

### **Get Help**

1. Check the relevant documentation above
2. Review script output for error messages
3. Check server status: `ssh -i ../../infra/ssh_key ec2-user@44.195.110.182`

## 📚 **Additional Resources**

- **Infrastructure**: `../../infra/README.md`
- **Server Management**: `../../infra/SERVER_MANAGEMENT.md`
- **Database Setup**: `../server/DATABASE_FIX_SUMMARY.md`
- **NPM Scripts**: [NPM_SCRIPTS_REFERENCE.md](./NPM_SCRIPTS_REFERENCE.md)

## 🎯 **Success Metrics**

✅ **Deployment Successful When**:

- Build completes without errors
- Files upload to EC2 successfully
- App is accessible at production URL
- API health check returns 200 OK
- No console errors in browser

---

**Your CanadaGoose app is running in production on AWS! 🎉**

**Production URL**: http://s25cicd.xiaopotato.top/app
**Status**: ✅ Live and Operational
**Documentation**: 📚 Complete and organized in `clientDocs/`
