#!/usr/bin/env node

const { readFileSync } = require('fs');
const { dirname, join } = require('path');

// Paths
const packageJsonPath = join(__dirname, '..', 'package.json');

console.log('🔍 Server Version Information Check');
console.log('===================================\n');

try {
  // Read package.json
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  console.log(`📦 Package.json version: ${packageJson.version}`);
  console.log(`🏷️  Package name: ${packageJson.name}`);
  console.log(`📅 Last check: ${new Date().toLocaleString()}`);

  // Check git tags
  try {
    const { execSync } = require('child_process');
    const tags = execSync('git tag --sort=-version:refname | head -5', {
      encoding: 'utf8',
    });
    const tagList = tags
      .trim()
      .split('\n')
      .filter((tag) => tag);

    if (tagList.length > 0) {
      console.log('\n🏷️  Recent Git Tags:');
      tagList.forEach((tag) => console.log(`   ${tag}`));
    } else {
      console.log('\n🏷️  No git tags found');
    }
  } catch (error) {
    console.log('\n🏷️  Could not retrieve git tags');
  }

  console.log('\n✅ Version check completed successfully');
} catch (error) {
  console.error('❌ Error reading package.json:', error.message);
}
