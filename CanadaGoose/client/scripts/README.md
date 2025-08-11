# Version Management System

This directory contains scripts for managing version updates before building your Vue.js application.

## Scripts Overview

### 1. `version-update.js` - Basic Version Update

A script that prompts for version type (major, minor, patch) and updates package.json accordingly.

**Usage:**

```bash
# Interactive mode
npm run build:version
# or
node scripts/version-update.js

# Command line mode
node scripts/version-update.js --patch
node scripts/version-update.js --minor --no-git
node scripts/version-update.js --version 2.0.0
```

**Command Line Options:**

- `--major, -M` - Increment major version (X.0.0)
- `--minor, -m` - Increment minor version (0.X.0)
- `--patch, -p` - Increment patch version (0.0.X)
- `--version <ver>` - Set specific version (e.g., 1.2.3)
- `--no-git` - Skip git operations
- `--help, -h` - Show help message
- `--silent, -s` - Minimal output (for CI/CD)

**Features:**

- Prompts for version type selection (interactive mode)
- Command line parameter support
- Automatically increments version numbers
- Updates package.json
- Optional git commit and tag creation
- Silent mode for CI/CD automation

### 2. `interactive-version.js` - Interactive Version Management

A comprehensive version management tool with enhanced features and better UX.

**Usage:**

```bash
# Interactive mode
npm run version:interactive
# or
node scripts/interactive-version.js

# Command line mode
node scripts/interactive-version.js --patch --auto
node scripts/interactive-version.js --minor --no-git
node scripts/interactive-version.js --version 2.0.0 --auto
```

**Command Line Options:**

- `--major, -M` - Increment major version (X.0.0)
- `--minor, -m` - Increment minor version (0.X.0)
- `--patch, -p` - Increment patch version (0.0.X)
- `--version <ver>` - Set specific version (e.g., 1.2.3)
- `--no-git` - Skip git operations
- `--help, -h` - Show help message
- `--silent, -s` - Minimal output (for CI/CD)
- `--auto` - Auto-confirm all actions (for CI/CD)

**Features:**

- Interactive menu system
- Command line parameter support
- Current status display
- Git status checking
- Custom version input
- Recent tags display
- Confirmation prompts for all actions
- Auto-confirm mode for automation

### 3. `pre-build-direct.js` - Pre-build Version Check

Automatically runs before build commands to ensure version updates are handled.

**Usage:**

```bash
# Automatic (via npm scripts)
npm run build        # Automatically runs pre-build checks
npm run build:prod   # Automatically runs pre-build checks

# Manual with options
node scripts/pre-build-direct.js --patch --no-git
node scripts/pre-build-direct.js --minor --silent
```

**Command Line Options:**

- `--major, -M` - Auto-increment major version
- `--minor, -m` - Auto-increment minor version
- `--patch, -p` - Auto-increment patch version
- `--version <ver>` - Set specific version
- `--no-git` - Skip git operations
- `--help, -h` - Show help message
- `--silent, -s` - Minimal output (for CI/CD)
- `--auto` - Auto-confirm all actions

## Integration with Build Process

The version management system is automatically integrated with your build commands:

- `npm run build` - Runs pre-build checks, then builds
- `npm run build:prod` - Runs pre-build checks, then builds for production
- `npm run prebuild` - Manually run pre-build checks only

## New NPM Scripts

### Quick Version Updates

```bash
# Patch version (0.0.X)
npm run version:patch

# Minor version (0.X.0)
npm run version:minor

# Major version (X.0.0)
npm run version:major
```

### Build with Version Updates

```bash
# Build with patch version update
npm run build:version:patch

# Build with minor version update
npm run build:version:minor

# Build with major version update
npm run build:version:major
```

## Version Types

### Major Version (X.0.0)

- Breaking changes
- Not backward compatible
- Use when making significant changes that break existing functionality

### Minor Version (0.X.0)

- New features
- Backward compatible
- Use when adding new functionality without breaking existing features

### Patch Version (0.0.X)

- Bug fixes
- Backward compatible
- Use for bug fixes and minor improvements

## Git Integration

The scripts automatically handle git operations:

1. **Commit Changes**: Automatically commits package.json changes with version bump
2. **Create Tags**: Creates annotated git tags for each version release
3. **Status Check**: Shows current git status and recent tags

## CI/CD Automation

### Silent Mode

Use `--silent` or `-s` for minimal output in CI/CD pipelines:

```bash
node scripts/version-update.js --patch --silent
# Outputs only the new version number
```

### Auto-Confirm Mode

Use `--auto` to skip all confirmation prompts:

```bash
node scripts/interactive-version.js --patch --auto
# Automatically confirms all actions
```

### No Git Mode

Use `--no-git` to skip git operations:

```bash
node scripts/version-update.js --patch --no-git
# Updates version without git commits/tags
```

## Workflow Examples

### Standard Development Workflow

```bash
# 1. Update version (interactive)
npm run version:interactive

# 2. Build application
npm run build

# 3. Deploy
npm run deploy
```

### Quick Version Update

```bash
# Quick patch version update
npm run version:patch

# Quick minor version update
npm run version:minor
```

### Production Build with Version Check

```bash
# Automatically prompts for version update, then builds
npm run build:prod
```

### CI/CD Pipeline

```bash
# Automated version bump and build
npm run build:version:patch
npm run build:prod
```

## Configuration

The scripts automatically detect and use:

- Current working directory structure
- package.json location
- Git repository status

No additional configuration is required.

## Error Handling

The scripts include comprehensive error handling:

- Graceful fallbacks for git operations
- Clear error messages
- Non-blocking warnings for optional features
- Validation of version formats
- Command line parameter validation

## Best Practices

1. **Always update version before building** for production
2. **Use semantic versioning** (major.minor.patch)
3. **Create git tags** for important releases
4. **Review changes** before committing version updates
5. **Test builds** after version updates
6. **Use silent mode** in CI/CD pipelines
7. **Use auto-confirm** for automated deployments

## Troubleshooting

### Common Issues

**Script not executable:**

```bash
chmod +x scripts/*.js
```

**Git not available:**

- Scripts will continue without git operations
- Version updates will still work

**Permission denied:**

- Ensure you have write access to package.json
- Check file permissions in the scripts directory

**Command line parameters not working:**

- Check script syntax and parameter order
- Use `--help` to see available options
- Ensure parameters are properly formatted

### Manual Version Update

If scripts fail, you can manually update:

1. Edit `package.json` and change the version field
2. Commit changes: `git add package.json && git commit -m "Bump version to X.Y.Z"`
3. Create tag: `git tag -a vX.Y.Z -m "Release version X.Y.Z"`

## Support

For issues or questions about the version management system:

1. Check this README
2. Review script error messages
3. Use `--help` flag for usage information
4. Ensure all dependencies are installed
5. Verify file permissions and git access

## Additional Resources

- [Command Line Usage Guide](./UPDATE_VERSION_COMMAND_LINE_USAGE.md) - Detailed command line examples and CI/CD integration
- [Main Client README](../README.md) - Complete project overview
