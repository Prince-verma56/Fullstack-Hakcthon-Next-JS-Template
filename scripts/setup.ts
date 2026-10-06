/**
 * Setup Script
 *
 * Validates runtime, prepares environment, and reports readiness.
 *
 * Usage: npm run setup
 */

import { execSync } from 'child_process';
import { existsSync, copyFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');

function run(cmd: string, label: string): boolean {
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'pipe' });
    console.log(`  ✅ ${label}`);
    return true;
  } catch {
    console.log(`  ❌ ${label}`);
    return false;
  }
}

async function main() {
  console.log('\n🚀 Fullstack Hackathon Template - Setup\n');

  // 1. Check Node
  console.log('1. Runtime check');
  run('node --version', 'Node.js');
  run('npm --version', 'npm');

  // 2. Environment file
  console.log('\n2. Environment');
  const envPath = resolve(ROOT, '.env');
  const envExamplePath = resolve(ROOT, '.env.example');
  if (!existsSync(envPath) && existsSync(envExamplePath)) {
    copyFileSync(envExamplePath, envPath);
    console.log('  ✅ Created .env from .env.example');
  } else if (existsSync(envPath)) {
    console.log('  ✅ .env already exists');
  } else {
    console.log('  ⚠️  No .env.example found');
  }

  // 3. Dependencies
  console.log('\n3. Dependencies');
  run('npm install', 'npm install');

  // 4. Prisma generate
  console.log('\n4. Prisma');
  run('npx prisma generate', 'Prisma client generated');

  console.log('\n✨ Setup complete!');
  console.log('\nNext steps:');
  console.log('  1. Start infrastructure: npm run infra:up');
  console.log('  2. Run migrations:       npm run db:migrate');
  console.log('  3. Seed database:        npm run db:seed');
  console.log('  4. Start dev server:     npm run dev\n');
}

main().catch(console.error);
