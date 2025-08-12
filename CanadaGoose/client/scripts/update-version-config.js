#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Paths
const packageJsonPath = join(__dirname, '..', 'package.json')
const versionConfigPath = join(__dirname, '..', 'src', 'config', 'version.ts')

function updateVersionConfig() {
  try {
    // Read package.json
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
    const version = packageJson.version
    const name = packageJson.name === 'client' ? 'CanadaGoose' : packageJson.name

    // Create version config content
    const versionConfigContent = `// This file is automatically updated during the build process
// Do not edit manually

export const APP_VERSION = '${version}'
export const APP_NAME = '${name}'
export const BUILD_DATE = new Date().toISOString()

// Version information for display
export const versionInfo = {
  version: APP_VERSION,
  name: APP_NAME,
  buildDate: BUILD_DATE,
  tech: 'Vue 3 + TypeScript + Vite'
}
`

    // Write version config file
    writeFileSync(versionConfigPath, versionConfigContent)

    console.log(`✅ Version config updated to ${version}`)
  } catch (error) {
    console.error('❌ Error updating version config:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateVersionConfig()
}

export { updateVersionConfig }
