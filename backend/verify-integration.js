/**
 * Quick integration verification script
 * Checks that all routes and services are properly integrated
 */

console.log('🔍 Verifying Lecture Recording Backend Integration\n');

const checks = [];

// Check 1: TypeScript compilation
console.log('1️⃣  Checking TypeScript compilation...');
const fs = require('fs');
const path = require('path');

const distFiles = [
  'dist/index.js',
  'dist/routes/lectures.js',
  'dist/services/jobManager.js',
  'dist/services/audioProcessor.js',
  'dist/services/lectureProcessor.js',
  'dist/types/lecture.js',
];

let tsOk = true;
for (const file of distFiles) {
  if (!fs.existsSync(path.join(__dirname, file))) {
    console.log(`   ❌ Missing: ${file}`);
    tsOk = false;
  }
}

if (tsOk) {
  console.log('   ✅ All TypeScript files compiled successfully\n');
} else {
  console.log('   ❌ Some files are missing. Run: npm run build\n');
}

checks.push({ name: 'TypeScript compilation', passed: tsOk });

// Check 2: Required directories
console.log('2️⃣  Checking required directories...');

const requiredDirs = ['uploads', 'temp', 'lectures'];
let dirsOk = true;

for (const dir of requiredDirs) {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`   📁 Created: ${dir}/`);
  } else {
    console.log(`   ✅ Exists: ${dir}/`);
  }
}

console.log();
checks.push({ name: 'Required directories', passed: true });

// Check 3: Environment variables
console.log('3️⃣  Checking environment variables...');

require('dotenv').config();

const envVars = {
  'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
  'PORT': process.env.PORT || '3001',
};

let envOk = true;
for (const [key, value] of Object.entries(envVars)) {
  if (key === 'OPENAI_API_KEY') {
    if (value && value.startsWith('sk-')) {
      console.log(`   ✅ ${key}: Configured`);
    } else {
      console.log(`   ❌ ${key}: Missing or invalid`);
      envOk = false;
    }
  } else {
    console.log(`   ✅ ${key}: ${value}`);
  }
}

console.log();
checks.push({ name: 'Environment variables', passed: envOk });

// Check 4: FFmpeg
console.log('4️⃣  Checking FFmpeg installation...');

const { execSync } = require('child_process');
let ffmpegOk = false;

try {
  execSync('ffmpeg -version', { stdio: 'ignore' });
  console.log('   ✅ FFmpeg is installed\n');
  ffmpegOk = true;
} catch (e) {
  console.log('   ⚠️  FFmpeg not found');
  console.log('   📝 Install with: brew install ffmpeg (macOS)\n');
  ffmpegOk = false;
}

checks.push({ name: 'FFmpeg', passed: ffmpegOk });

// Check 5: NPM packages
console.log('5️⃣  Checking required packages...');

const packageJson = require('./package.json');
const requiredPackages = [
  'express',
  'cors',
  'dotenv',
  'multer',
  'openai',
  'fluent-ffmpeg',
  'form-data',
];

let packagesOk = true;
for (const pkg of requiredPackages) {
  if (packageJson.dependencies[pkg]) {
    console.log(`   ✅ ${pkg}`);
  } else {
    console.log(`   ❌ ${pkg} missing`);
    packagesOk = false;
  }
}

console.log();
checks.push({ name: 'Required packages', passed: packagesOk });

// Check 6: Route integration
console.log('6️⃣  Checking route integration...');

try {
  const indexPath = path.join(__dirname, 'dist/index.js');
  const indexContent = fs.readFileSync(indexPath, 'utf-8');
  
  const routes = [
    { path: '/api/chat', name: 'Chat' },
    { path: '/api/upload', name: 'Upload' },
    { path: '/api/youtube', name: 'YouTube' },
    { path: '/api/lectures', name: 'Lectures' },
  ];
  
  let routesOk = true;
  for (const route of routes) {
    if (indexContent.includes(route.path)) {
      console.log(`   ✅ ${route.name} route registered`);
    } else {
      console.log(`   ❌ ${route.name} route missing`);
      routesOk = false;
    }
  }
  
  console.log();
  checks.push({ name: 'Route integration', passed: routesOk });
} catch (e) {
  console.log('   ❌ Could not verify routes\n');
  checks.push({ name: 'Route integration', passed: false });
}

// Summary
console.log('📊 Integration Summary:');
console.log('═'.repeat(50));

let allPassed = true;
for (const check of checks) {
  const icon = check.passed ? '✅' : '❌';
  console.log(`${icon} ${check.name}`);
  if (!check.passed) allPassed = false;
}

console.log('═'.repeat(50));

if (allPassed) {
  console.log('\n🎉 All integration checks passed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Start backend: npm run dev');
  console.log('   2. Test API: node test-lecture-api.js <audio-file>');
  console.log('   3. Build frontend integration');
  process.exit(0);
} else {
  console.log('\n⚠️  Some checks failed. Please fix the issues above.');
  console.log('\n📖 See LECTURE_INTEGRATION_GUIDE.md for setup instructions');
  process.exit(1);
}

