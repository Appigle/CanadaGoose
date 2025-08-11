#!/usr/bin/env node

import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Paths
const packageJsonPath = join(__dirname, '..', 'package.json')
const versionConfigPath = join(__dirname, '..', 'src', 'config', 'version.ts')

console.log('🔍 Version Information Check')
console.log('============================\n')

try {
  // Read package.json
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  console.log(`📦 Package.json version: ${packageJson.version}`)

  // Read version config
  const versionConfig = readFileSync(versionConfigPath, 'utf8')
  const versionMatch = versionConfig.match(/APP_VERSION = '([^']+)'/)
  if (versionMatch) {
    console.log(`⚙️  Version config: ${versionMatch[1]}`)
  }

  // Check if they match
  if (packageJson.version === versionMatch?.[1]) {
    console.log('✅ Versions are in sync!')
  } else {
    console.log('❌ Versions are out of sync!')
    console.log('💡 Run: node scripts/update-version-config.js')
  }
} catch (error) {
  console.error('❌ Error reading version files:', error.message)
}
