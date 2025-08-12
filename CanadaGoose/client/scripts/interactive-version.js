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
  gray: '\x1b[90m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function showHelp() {
  log('\n🚀 CanadaGoose Interactive Version Manager', 'bright')
  log('===========================================\n', 'blue')
  log('Usage:', 'bright')
  log('  node interactive-version.js [options]\n', 'cyan')
  log('Options:', 'bright')
  log('  --major, -M          Increment major version (X.0.0)', 'red')
  log('  --minor, -m          Increment minor version (0.X.0)', 'yellow')
  log('  --patch, -p          Increment patch version (0.0.X)', 'green')
  log('  --version <ver>      Set specific version (e.g., 1.2.3)', 'magenta')
  log('  --no-git             Skip git operations', 'gray')
  log('  --help, -h           Show this help message', 'blue')
  log('  --silent, -s         Minimal output (for CI/CD)', 'gray')
  log('  --auto               Auto-confirm all actions (for CI/CD)', 'gray')
  log('\nExamples:', 'bright')
  log('  node interactive-version.js --patch', 'cyan')
  log('  node interactive-version.js --minor --no-git', 'cyan')
  log('  node interactive-version.js --version 2.0.0 --auto', 'cyan')
  log('  node interactive-version.js -p -s --auto', 'cyan')
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

function logHeader(title) {
  const line = '─'.repeat(title.length + 4)
  logSilent(`\n┌${line}┐`, 'blue')
  logSilent(`│  ${title}  │`, 'bright')
  logSilent(`└${line}┘`, 'blue')
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

function getVersionDescription(type) {
  const descriptions = {
    major: 'Breaking changes, not backward compatible',
    minor: 'New features, backward compatible',
    patch: 'Bug fixes, backward compatible',
  }
  return descriptions[type] || ''
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

function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' })
    return status
      .trim()
      .split('\n')
      .filter((line) => line.length > 0)
  } catch {
    return []
  }
}

function showCurrentStatus() {
  const packageJson = readPackageJson()
  const currentVersion = packageJson.version
  const gitStatus = checkGitStatus()

  logHeader('Current Status')
  logSilent(`📦 Current version: ${colors.cyan}${currentVersion}${colors.reset}`)

  if (gitStatus.length > 0) {
    logSilent(`\n📝 Git status:`, 'yellow')
    gitStatus.forEach((file) => {
      logSilent(`   ${file}`, 'gray')
    })
  } else {
    logSilent(`\n📝 Git status: Clean working directory`, 'green')
  }

  // Show recent git tags
  try {
    const tags = execSync('git tag --sort=-version:refname | head -5', { encoding: 'utf8' })
    if (tags.trim()) {
      logSilent(`\n🏷️  Recent tags:`, 'blue')
      tags
        .trim()
        .split('\n')
        .forEach((tag) => {
          logSilent(`   ${tag}`, 'gray')
        })
    }
  } catch {
    // Git not available or no tags
  }
}

async function promptVersionUpdate() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    logHeader('Version Update Options')
    logSilent('Choose version update type:', 'bright')
    logSilent('1. Major (X.0.0) - Breaking changes', 'red')
    logSilent('2. Minor (0.X.0) - New features, backward compatible', 'yellow')
    logSilent('3. Patch (0.0.X) - Bug fixes, backward compatible', 'green')
    logSilent('4. Custom version', 'magenta')
    logSilent('5. Skip version update', 'blue')
    logSilent('6. Show current status', 'cyan')
    logSilent('7. Exit', 'gray')

    rl.question('\nEnter your choice (1-7): ', (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function promptCustomVersion() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question('Enter custom version (e.g., 1.2.3): ', (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function confirmAction(message, options = {}) {
  if (options.auto) {
    return true
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    })
  })
}

async function handleCommandLineOptions(options) {
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
    return null // No command line options, use interactive mode
  }

  // Check if version actually changed
  if (newVersion === currentVersion) {
    logSilent(`ℹ️  Version is already ${currentVersion}`, 'blue')
    return null
  }

  // Show confirmation
  logHeader('Version Update Confirmation')
  logSilent(`Current version: ${currentVersion}`, 'cyan')
  logSilent(`New version: ${newVersion}`, 'green')
  if (options.type) {
    logSilent(`Type: ${options.type} - ${getVersionDescription(options.type)}`, 'yellow')
  }

  const confirmed = await confirmAction('Proceed with this version update?', options)
  if (!confirmed) return null

  // Update package.json
  packageJson.version = newVersion
  writePackageJson(packageJson)

  logSilent(`✅ Version updated to ${newVersion}`, 'green')

  // Git operations
  if (options.git) {
    if (await confirmAction('Commit version change to git?', options)) {
      commitVersionChange(newVersion)
    }
    if (await confirmAction('Create git tag?', options)) {
      createGitTag(newVersion)
    }
  } else {
    logSilent('⏭️  Skipping git operations', 'yellow')
  }

  logSilent(`\n🎉 Version ${newVersion} successfully updated!`, 'bright')

  // For CI/CD, output the new version
  if (options.silent) {
    console.log(newVersion)
  }

  return newVersion
}

async function main() {
  try {
    const options = parseCommandLineArgs()

    if (options.help) {
      showHelp()
      return
    }

    // Show initial status
    showCurrentStatus()

    // Handle command line options first
    const result = await handleCommandLineOptions(options)
    if (result !== null) {
      return // Command line options handled, exit
    }

    // Fall back to interactive mode
    while (true) {
      const choice = await promptVersionUpdate()

      if (choice === '7') {
        logSilent('👋 Goodbye!', 'blue')
        break
      }

      if (choice === '6') {
        showCurrentStatus()
        continue
      }

      if (choice === '5') {
        logSilent('⏭️  Skipping version update', 'yellow')
        break
      }

      if (choice === '4') {
        const customVersion = await promptCustomVersion()
        if (!/^\d+\.\d+\.\d+$/.test(customVersion)) {
          log('❌ Invalid version format. Use format: X.Y.Z', 'red')
          continue
        }

        const packageJson = readPackageJson()
        const currentVersion = packageJson.version

        if (customVersion === currentVersion) {
          log('⚠️  Version is already set to this value', 'yellow')
          continue
        }

        const confirmed = await confirmAction(
          `Update version from ${currentVersion} to ${customVersion}?`,
        )
        if (!confirmed) continue

        packageJson.version = customVersion
        writePackageJson(packageJson)
        log(`✅ Version updated to ${customVersion}`, 'green')

        // Git operations
        if (await confirmAction('Commit version change to git?')) {
          commitVersionChange(customVersion)
        }

        if (await confirmAction('Create git tag?')) {
          createGitTag(customVersion)
        }

        break
      }

      if (!['1', '2', '3'].includes(choice)) {
        log('❌ Invalid choice. Please try again.', 'red')
        continue
      }

      const versionTypes = {
        1: 'major',
        2: 'minor',
        3: 'patch',
      }

      const versionType = versionTypes[choice]
      const packageJson = readPackageJson()
      const currentVersion = packageJson.version
      const newVersion = incrementVersion(currentVersion, versionType)

      logHeader('Version Update Confirmation')
      log(`Current version: ${currentVersion}`, 'cyan')
      log(`New version: ${newVersion}`, 'green')
      log(`Type: ${versionType} - ${getVersionDescription(versionType)}`, 'yellow')

      const confirmed = await confirmAction('Proceed with this version update?')
      if (!confirmed) continue

      // Update package.json
      packageJson.version = newVersion
      writePackageJson(packageJson)

      log(`✅ Version updated to ${newVersion}`, 'green')

      // Git operations
      if (await confirmAction('Commit version change to git?')) {
        commitVersionChange(newVersion)
      }

      if (await confirmAction('Create git tag?')) {
        createGitTag(newVersion)
      }

      log(`\n🎉 Version ${newVersion} successfully updated!`, 'bright')
      break
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
