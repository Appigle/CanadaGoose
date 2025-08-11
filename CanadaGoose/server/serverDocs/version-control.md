# CanadaGoose Server Version Management

This directory contains scripts for managing the server application version, similar to the client version management system.

## 🚀 Quick Start

### Check Current Version

```bash
npm run version:check
```

### Update Version

```bash
# Patch version (0.0.X) - Bug fixes
npm run version:patch

# Minor version (0.X.0) - New features
npm run version:minor

# Major version (X.0.0) - Breaking changes
npm run version:major

# Interactive mode
npm run version:interactive
```

## 📁 Scripts Overview

### `version-update.js`

Core version update script with command-line support.

**Features:**

- Interactive version prompts
- Command-line arguments (`--major`, `--minor`, `--patch`)
- Git integration (commit + tag)
- CI/CD support (`--silent`, `--no-git`)

**Usage:**

```bash
# Interactive mode
node scripts/version-update.js

# Command-line mode
node scripts/version-update.js --patch --auto
node scripts/version-update.js --minor --no-git
node scripts/version-update.js --version 2.0.0
```

### `interactive-version.js`

Enhanced interactive version manager with status display.

**Features:**

- Current version status
- Git tag information
- Environment details
- Comprehensive menu system
- Command-line automation

**Usage:**

```bash
# Interactive mode
node scripts/interactive-version.js

# Automated mode
node scripts/interactive-version.js --patch --auto
node scripts/interactive-version.js --minor --silent
```

### `check-version.js`

Simple version information display.

**Features:**

- Current package.json version
- Recent git tags
- Timestamp information

**Usage:**

```bash
node scripts/check-version.js
```

### `demo-version.sh`

Quick reference for available commands.

**Usage:**

```bash
./scripts/demo-version.sh
```

## 🔧 NPM Scripts

The following scripts are available in `package.json`:

```json
{
  "version:check": "node scripts/check-version.js",
  "version:patch": "node scripts/interactive-version.js --patch --auto",
  "version:minor": "node scripts/interactive-version.js --minor --auto",
  "version:major": "node scripts/interactive-version.js --major --auto",
  "version:interactive": "node scripts/interactive-version.js"
}
```

## 🌐 API Endpoint

### `GET /api/version`

Returns current server version information.

**Response:**

```json
{
  "version": "1.0.0",
  "name": "server",
  "description": "Express.js backend with JWT authentication and security features",
  "timestamp": "2025-08-11T22:20:00.000Z",
  "environment": "development",
  "uptime": 123.45,
  "serverInfo": {
    "internalUrl": "http://localhost:3000",
    "internalApiUrl": "http://localhost:3000/api",
    "externalDomain": "s25cicd.xiaopotato.top",
    "externalUrl": "http://s25cicd.xiaopotato.top",
    "externalApiUrl": "http://s25cicd.xiaopotato.top/api"
  }
}
```

## 🎯 Workflow Examples

### Development Workflow

```bash
# 1. Check current version
npm run version:check

# 2. Make changes and test

# 3. Update patch version
npm run version:patch

# 4. Deploy
npm run start
```

### Production Release Workflow

```bash
# 1. Check current version
npm run version:check

# 2. Update minor version for new features
npm run version:minor

# 3. Verify changes
npm run version:check

# 4. Deploy
npm run prod
```

### CI/CD Integration

```bash
# Automated patch version bump
node scripts/version-update.js --patch --silent --auto

# Automated minor version bump
node scripts/version-update.js --minor --silent --auto

# Set specific version
node scripts/version-update.js --version 2.0.0 --silent --auto
```

## 🔍 Command Line Options

### Common Flags

- `--major, -M`: Increment major version
- `--minor, -m`: Increment minor version
- `--patch, -p`: Increment patch version
- `--version <ver>`: Set specific version
- `--no-git`: Skip git operations
- `--silent, -s`: Minimal output (for CI/CD)
- `--auto`: Auto-confirm all actions
- `--help, -h`: Show help message

### Examples

```bash
# Quick patch update
node scripts/version-update.js -p

# Silent minor update for CI/CD
node scripts/version-update.js -m -s --auto

# Set specific version
node scripts/version-update.js --version 1.5.0

# Skip git operations
node scripts/version-update.js --patch --no-git
```

## 📋 Version Management Rules

### Semantic Versioning

- **Major (X.0.0)**: Breaking changes, not backward compatible
- **Minor (0.X.0)**: New features, backward compatible
- **Patch (0.0.X)**: Bug fixes, backward compatible

### Git Integration

- Automatically commits version changes
- Creates git tags for each version
- Can be disabled with `--no-git` flag

## 🚨 Troubleshooting

### Common Issues

**Script not executable:**

```bash
chmod +x scripts/*.js scripts/*.sh
```

**Permission denied:**

```bash
# Check file permissions
ls -la scripts/

# Make executable
chmod +x scripts/script-name.js
```

**Git operations fail:**

```bash
# Check git status
git status

# Check git configuration
git config --list
```

**Version not updating:**

```bash
# Check package.json
cat package.json | grep version

# Verify script execution
npm run version:check
```

## 🔗 Related Documentation

- [Client Version Management](../client/scripts/README.md)
- [CORS Troubleshooting](../CORS_TROUBLESHOOTING.md)
- [Server Deployment](../serverDocs/DEPLOYMENT_WORKFLOW.md)

## 📞 Support

For issues with version management:

1. Check the troubleshooting section above
2. Verify script permissions and execution
3. Check git configuration and status
4. Review package.json format and content

The version management system is designed to be robust and user-friendly, with comprehensive error handling and clear feedback messages.
