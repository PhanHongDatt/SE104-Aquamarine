const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command) {
  console.log(`\n> Executing: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`\n[ERROR] Failed to execute: ${command}`);
    return false;
  }
}

async function setup() {
  console.log('==============================================');
  console.log('💎 QUẢN LÝ VÀNG BẠC - PROJECT SETUP 💎');
  console.log('==============================================');

  // 1. Install dependencies
  console.log('\n[1/5] Installing dependencies...');
  if (!runCommand('npm install')) process.exit(1);

  // 2. Setup environment
  console.log('\n[2/5] Setting up environment variables...');
  if (!fs.existsSync('.env')) {
    fs.copyFileSync('.env.example', '.env');
    console.log('✓ Created .env from .env.example');
  } else {
    console.log('! .env already exists, skipping...');
  }

  // 3. Start Docker
  console.log('\n[3/5] Starting Docker containers (PostgreSQL)...');
  if (!runCommand('docker-compose up -d')) {
    console.log('\n[!] Make sure Docker Desktop is running.');
    process.exit(1);
  }

  // 4. Wait for DB
  console.log('\n[4/5] Waiting for Database to be ready (10s)...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  // 5. Setup Database
  console.log('\n[5/5] Initializing Database (Prisma)...');
  if (!runCommand('npm run db:setup')) {
    console.log('\n[!] Database setup failed. You might need to wait longer or check Docker logs.');
    process.exit(1);
  }

  console.log('\n==============================================');
  console.log('🎉 SETUP COMPLETED SUCCESSFULLY! 🎉');
  console.log('\nRun "npm run dev" to start the application.');
  console.log('Login with: admin / Admin@123');
  console.log('==============================================');
}

setup();
