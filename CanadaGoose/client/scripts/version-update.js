#!/usr/bin/env node

import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import readline from 'readline'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const packageJsonPath = join(__dirname, '..', 'package.json')

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function showHelp() {
  log('\n🚀 CanadaGoose Version Update Script', 'bright')
  log('=====================================\n', 'blue')
  log('Usage:', 'bright')
  log('  node version-update.js [options]\n', 'cyan')
  log('Options:', 'bright')
  log('  --major, -M          Increment major version (X.0.0)', 'red')
  log('  --minor, -m          Increment minor version (0.X.0)', 'yellow')
  log('  --patch, -p          Increment patch version (0.0.X)', 'green')
  log('  --version <ver>      Set specific version (e.g., 1.2.3)', 'magenta')
  log('  --no-git             Skip git operations', 'gray')
  log('  --help, -h           Show this help message', 'blue')
  log('  --silent, -s         Minimal output (for CI/CD)', 'gray')
  log('\nExamples:', 'bright')
  log('  node version-update.js --patch', 'cyan')
  log('  node version-update.js --minor --no-git', 'cyan')
  log('  node version-update.js --version 2.0.0', 'cyan')
  log('  node version-update.js -p -s', 'cyan')
}

function parseCommandLineArgs() {
  const args = process.argv.slice(2)
  const options = {
    type: null,
    version: null,
    git: true,
    silent: false,
    auto: false,
    help: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    switch (arg) {
      case '--major':
      case '-M':
        options.type = 'major'
        break
      case '--minor':
      case '-m':
        options.type = 'minor'
        break
      case '--patch':
      case '-p':
        options.type = 'patch'
        break
      case '--version':
        if (i + 1 < args.length) {
          options.version = args[++i]
        } else {
          log('❌ Error: --version requires a version number', 'red')
          process.exit(1)
        }
        break
      case '--no-git':
        options.git = false
        break
      case '--silent':
      case '-s':
        options.silent = true
        break
      case '--auto':
        options.auto = true
        break
      case '--help':
      case '-h':
        options.help = true
        break
      default:
        log(`⚠️  Warning: Unknown option: ${arg}`, 'yellow')
        break
    }
  }

  return options
}

function logSilent(message, color = 'reset') {
  if (!process.argv.includes('--silent') && !process.argv.includes('-s')) {
    log(message, color)
  }
}

function readPackageJson() {
  try {
    const content = readFileSync(packageJsonPath, 'utf8')
    return JSON.parse(content)
  } catch {
    log('❌ Error reading package.json', 'red')
    process.exit(1)
  }
}

function writePackageJson(packageJson) {
  try {
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
  } catch {
    log('❌ Error writing package.json', 'red')
    process.exit(1)
  }
}

function parseVersion(version) {
  const parts = version.split('.').map(Number)
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
  }
}

function incrementVersion(currentVersion, type) {
  const version = parseVersion(currentVersion)

  switch (type) {
    case 'major':
      version.major += 1
      version.minor = 0
      version.patch = 0
      break
    case 'minor':
      version.minor += 1
      version.patch = 0
      break
    case 'patch':
      version.patch += 1
      break
    default:
      throw new Error(`Invalid version type: ${type}`)
  }

  return `${version.major}.${version.minor}.${version.patch}`
}

function validateVersion(version) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error('Invalid version format. Use format: X.Y.Z')
  }
  return version
}

function createGitTag(version) {
  try {
    execSync(`git tag -a v${version} -m "Release version ${version}"`, { stdio: 'inherit' })
    logSilent(`✅ Git tag v${version} created successfully`, 'green')
    return true
  } catch (error) {
    logSilent(`⚠️  Warning: Could not create git tag: ${error.message}`, 'yellow')
    return false
  }
}

function commitVersionChange(version) {
  try {
    execSync('git add package.json', { stdio: 'inherit' })
    execSync(`git commit -m "Bump version to ${version}"`, { stdio: 'inherit' })
    logSilent(`✅ Version change committed to git`, 'green')
    return true
  } catch (error) {
    logSilent(`⚠️  Warning: Could not commit version change: ${error.message}`, 'yellow')
    return false
  }
}

async function promptVersionUpdate() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    log('\n🚀 Version Update Required Before Build', 'bright')
    log('Current version: ' + readPackageJson().version, 'cyan')
    log('\nChoose version update type:', 'bright')
    log('1. Major (X.0.0) - Breaking changes', 'red')
    log('2. Minor (0.X.0) - New features, backward compatible', 'yellow')
    log('3. Patch (0.0.X) - Bug fixes, backward compatible', 'green')
    log('4. Skip version update', 'blue')

    rl.question('\nEnter your choice (1-4): ', (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function main() {
  try {
    const options = parseCommandLineArgs()

    if (options.help) {
      showHelp()
      return
    }

    const packageJson = readPackageJson()
    const currentVersion = packageJson.version
    let newVersion = currentVersion

    // Handle command line options
    if (options.version) {
      newVersion = validateVersion(options.version)
      logSilent(`📦 Setting version to ${newVersion}`, 'cyan')
    } else if (options.type) {
      newVersion = incrementVersion(currentVersion, options.type)
      logSilent(
        `📦 Incrementing ${options.type} version from ${currentVersion} to ${newVersion}`,
        'cyan',
      )
    } else {
      // Fall back to interactive mode
      const choice = await promptVersionUpdate()

      if (choice === '4') {
        logSilent('⏭️  Skipping version update', 'yellow')
        return
      }

      if (!['1', '2', '3'].includes(choice)) {
        log('❌ Invalid choice. Please run the script again.', 'red')
        process.exit(1)
      }

      const versionTypes = {
        1: 'major',
        2: 'minor',
        3: 'patch',
      }

      const versionType = versionTypes[choice]
      newVersion = incrementVersion(currentVersion, versionType)
      logSilent(`📦 Updating version from ${currentVersion} to ${newVersion}`, 'cyan')
    }

    // Check if version actually changed
    if (newVersion === currentVersion) {
      logSilent(`ℹ️  Version is already ${currentVersion}`, 'blue')
      return
    }

    // Update package.json
    packageJson.version = newVersion
    writePackageJson(packageJson)

    logSilent(`✅ Version updated to ${newVersion}`, 'green')

    // Git operations
    if (options.git) {
      logSilent('\n🔧 Performing git operations...', 'blue')
      if (options.auto) {
        // Auto mode: perform all git operations without prompts
        commitVersionChange(newVersion)
        createGitTag(newVersion)
      } else {
        // Interactive mode: ask for confirmation
        commitVersionChange(newVersion)
        createGitTag(newVersion)
      }
    } else {
      logSilent('⏭️  Skipping git operations', 'yellow')
    }

    logSilent(`\n🎉 Version ${newVersion} successfully updated!`, 'bright')
    logSilent('You can now proceed with the build process.', 'green')

    // For CI/CD, output the new version
    if (options.silent) {
      console.log(newVersion)
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Export main function for use in other modules
export { main }

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
