#!/usr/bin/env node

function showHelp() {
  console.log('\n🔍 CanadaGoose Pre-Build Version Check')
  console.log('=====================================\n')
  console.log('Usage:')
  console.log('  node pre-build-direct.js [options]\n')
  console.log('Options:')
  console.log('  --major, -M          Auto-increment major version')
  console.log('  --minor, -m          Auto-increment minor version')
  console.log('  --patch, -p          Auto-increment patch version')
  console.log('  --version <ver>      Set specific version')
  console.log('  --no-git             Skip git operations')
  console.log('  --help, -h           Show this help message')
  console.log('  --silent, -s         Minimal output (for CI/CD)')
  console.log('  --auto               Auto-confirm all actions')
  console.log('\nDefault Behavior:')
  console.log('  🏷️  If no version type is specified, defaults to --patch')
  console.log('  ✅ Always uses --auto for automated builds')
  console.log('\nExamples:')
  console.log('  node pre-build-direct.js                    # Default: patch update')
  console.log('  node pre-build-direct.js --patch           # Explicit patch update')
  console.log('  node pre-build-direct.js --minor --no-git  # Minor update, no git')
  console.log('  node pre-build-direct.js --version 2.0.0  # Set specific version')
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
          console.error('❌ Error: --version requires a version number')
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
        console.warn(`⚠️  Warning: Unknown option: ${arg}`)
        break
    }
  }

  return options
}

function log(message) {
  if (!process.argv.includes('--silent') && !process.argv.includes('-s')) {
    console.log(message)
  }
}

console.log('🔍 Running pre-build checks...')

try {
  const options = parseCommandLineArgs()

  if (options.help) {
    showHelp()
    process.exit(0)
  }

  // Import and run version update logic directly
  log('📝 Checking version update requirements...')

  // Import the version update module
  const versionUpdateModule = await import('./version-update.js')

  // Prepare arguments for version update
  const args = []

  // Set default patch version update if no specific type is provided
  if (options.type) {
    args.push(`--${options.type}`)
  } else if (!options.version) {
    // Default to patch version update for builds
    log('🏷️  No version type specified, defaulting to patch version update')
    args.push('--patch')
  }

  if (options.version) {
    args.push('--version', options.version)
  }
  if (!options.git) {
    args.push('--no-git')
  }
  if (options.silent) {
    args.push('--silent')
  }
  if (options.auto) {
    args.push('--auto')
  }

  // Always add --auto for automated builds
  if (!args.includes('--auto')) {
    args.push('--auto')
  }

  // Set process.argv for the version update script
  const originalArgv = process.argv
  process.argv = [process.argv[0], process.argv[1], ...args]

  try {
    // Run the main function if it exists
    if (versionUpdateModule.main) {
      await versionUpdateModule.main()
    }
  } finally {
    // Restore original process.argv
    process.argv = originalArgv
  }

  log('✅ Pre-build checks completed successfully')
  log('🚀 Ready to build!')
} catch (error) {
  console.error('❌ Pre-build checks failed:', error.message)
  process.exit(1)
}
