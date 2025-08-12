# Command Line Usage Guide

## 🚀 Quick Start Examples

### Basic Version Updates

```bash
# Patch version (0.0.X) - Bug fixes
npm run version:patch

# Minor version (0.X.0) - New features
npm run version:minor

# Major version (X.0.0) - Breaking changes
npm run version:major
```

### Build with Version Updates

```bash
# Build with automatic patch version update
npm run build:version:patch

# Build with automatic minor version update
npm run build:version:minor

# Build with automatic major version update
npm run build:version:major
```

## 📋 Direct Script Usage

### Version Update Script

```bash
# Interactive mode
node scripts/version-update.js

# Command line mode
node scripts/version-update.js --patch
node scripts/version-update.js --minor --no-git
node scripts/version-update.js --version 2.0.0
node scripts/version-update.js --patch --silent
```

### Interactive Version Script

```bash
# Interactive mode
node scripts/interactive-version.js

# Command line mode
node scripts/interactive-version.js --patch --auto
node scripts/interactive-version.js --minor --no-git
node scripts/interactive-version.js --version 2.0.0 --auto
```

### Pre-build Script

```bash
# Manual pre-build with options
node scripts/pre-build-direct.js --patch --no-git
node scripts/pre-build-direct.js --minor --silent
node scripts/pre-build-direct.js --version 2.0.0 --auto
```

## 🔧 Command Line Options

### Common Options

| Option            | Short | Description                          |
| ----------------- | ----- | ------------------------------------ |
| `--major`         | `-M`  | Increment major version (X.0.0)      |
| `--minor`         | `-m`  | Increment minor version (0.X.0)      |
| `--patch`         | `-p`  | Increment patch version (0.0.X)      |
| `--version <ver>` | -     | Set specific version (e.g., 1.2.3)   |
| `--no-git`        | -     | Skip git operations                  |
| `--help`          | `-h`  | Show help message                    |
| `--silent`        | `-s`  | Minimal output (for CI/CD)           |
| `--auto`          | -     | Auto-confirm all actions (for CI/CD) |

### Option Combinations

```bash
# Silent patch update with git
node scripts/version-update.js --patch --silent

# Minor update without git operations
node scripts/version-update.js --minor --no-git

# Custom version with auto-confirm
node scripts/interactive-version.js --version 2.0.0 --auto

# Patch update for CI/CD
node scripts/version-update.js --patch --silent --no-git
```

## 🏭 CI/CD Integration

### GitHub Actions Example

```yaml
- name: Update version
  run: |
    npm run version:patch --silent
    echo "NEW_VERSION=$(npm run version:patch --silent)" >> $GITHUB_ENV

- name: Build application
  run: npm run build
```

### GitLab CI Example

```yaml
update_version:
  script:
    - npm run version:patch --silent
    - echo "NEW_VERSION=$(npm run version:patch --silent)" > version.txt
  artifacts:
    paths:
      - version.txt
```

### Jenkins Pipeline Example

```groovy
stage('Version Update') {
    steps {
        script {
            def newVersion = sh(
                script: 'npm run version:patch --silent',
                returnStdout: true
            ).trim()
            env.NEW_VERSION = newVersion
        }
    }
}
```

## 📊 Output Modes

### Normal Output

```bash
npm run version:patch
# Shows full interactive interface with colors and status
```

### Silent Output (CI/CD)

```bash
npm run version:patch --silent
# Shows only essential information, outputs version number
```

### Minimal Output

```bash
node scripts/version-update.js --patch --silent
# Outputs only the new version number
```

## 🔄 Workflow Examples

### Development Workflow

```bash
# 1. Update version interactively
npm run version:interactive

# 2. Build application
npm run build

# 3. Deploy
npm run deploy
```

### Automated Release Workflow

```bash
# 1. Auto-update patch version
npm run version:patch --silent

# 2. Build for production
npm run build:prod

# 3. Deploy to production
npm run deploy:aws
```

### Hotfix Workflow

```bash
# 1. Quick patch version update
npm run version:patch

# 2. Build and deploy
npm run build:prod
npm run deploy:aws
```

## ⚠️ Important Notes

### Git Operations

- By default, all scripts perform git operations
- Use `--no-git` to skip git commits and tags
- Git operations require a clean working directory

### Version Validation

- Versions must follow semantic versioning (X.Y.Z)
- Invalid versions will cause script failure
- Custom versions are validated before application

### Error Handling

- Scripts exit with code 1 on errors
- Warnings are shown but don't stop execution
- Git errors are handled gracefully

## 🆘 Help and Support

### Get Help

```bash
# Show help for any script
node scripts/version-update.js --help
node scripts/interactive-version.js --help
node scripts/pre-build-direct.js --help
```

### Debug Mode

```bash
# Run with verbose output
DEBUG=* node scripts/version-update.js --patch

# Check script permissions
ls -la scripts/*.js
```

### Common Issues

1. **Permission denied**: Run `chmod +x scripts/*.js`
2. **Git not available**: Scripts continue without git operations
3. **Invalid version format**: Use X.Y.Z format (e.g., 1.2.3)
4. **Working directory not clean**: Commit or stash changes first

## 📚 Additional Resources

- [Main README](./README.md) - Complete system overview
- [Package.json Scripts](../package.json) - All available npm commands
- [Version Management Best Practices](./README.md#best-practices)
- [Troubleshooting Guide](./README.md#troubleshooting)
