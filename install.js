#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const platform = os.platform();
const arch = os.arch();

// Map Node.js arch to Rust target arch
const archMap = {
  'x64': 'x86_64',
  'arm64': 'aarch64',
  'arm': 'armv7',
};

const platformMap = {
  'darwin': 'apple-darwin',
  'linux': 'unknown-linux-gnu',
  'win32': 'pc-windows-msvc',
};

const rustArch = archMap[arch];
const rustPlatform = platformMap[platform];

if (!rustArch || !rustPlatform) {
  console.error(`Unsupported platform: ${platform}-${arch}`);
  process.exit(1);
}

const target = `${rustArch}-${rustPlatform}`;
const binDir = path.join(__dirname, 'bin');
const binName = platform === 'win32' ? 'ew.exe' : 'ew';
const binPath = path.join(binDir, binName);

console.log('Installing easy-worktree...');
console.log(`Platform: ${platform}`);
console.log(`Architecture: ${arch}`);
console.log(`Rust target: ${target}`);

// Check if Rust is installed
try {
  execSync('cargo --version', { stdio: 'ignore' });
} catch (error) {
  console.error('Error: Cargo (Rust) is not installed.');
  console.error('Please install Rust from https://rustup.rs/');
  process.exit(1);
}

// Create bin directory
if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

try {
  // Build the Rust binary
  console.log('Building Rust binary...');
  execSync('cargo build --release', { 
    stdio: 'inherit',
    cwd: __dirname
  });

  // Copy the binary to bin/
  const sourceBinary = path.join(__dirname, 'target', 'release', binName);
  
  if (fs.existsSync(sourceBinary)) {
    fs.copyFileSync(sourceBinary, binPath);
    
    // Make it executable on Unix-like systems
    if (platform !== 'win32') {
      fs.chmodSync(binPath, 0o755);
    }
    
    console.log('✓ easy-worktree installed successfully!');
    console.log(`Binary location: ${binPath}`);
  } else {
    console.error(`Error: Built binary not found at ${sourceBinary}`);
    process.exit(1);
  }
} catch (error) {
  console.error('Error building Rust binary:', error.message);
  process.exit(1);
}
