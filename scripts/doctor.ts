/**
 * Doctor Script
 *
 * Quick diagnostic check of the development environment.
 *
 * Usage: npm run doctor
 */

import 'dotenv/config';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');

interface CheckResult {
  label: string;
  status: 'pass' | 'fail' | 'warn' | 'disabled';
  detail?: string;
}

const results: CheckResult[] = [];

async function check(label: string, fn: () => Promise<boolean | string> | boolean | string): Promise<void> {
  try {
    const result = await fn();
    if (result === true) {
      results.push({ label, status: 'pass' });
    } else if (result === 'disabled') {
      results.push({ label, status: 'disabled' });
    } else if (typeof result === 'string') {
      results.push({ label, status: 'warn', detail: result });
    } else {
      results.push({ label, status: 'fail' });
    }
  } catch (e) {
    results.push({ label, status: 'fail', detail: String(e) });
  }
}

function cmdOutput(cmd: string): string {
  return execSync(cmd, { cwd: ROOT, stdio: 'pipe' }).toString().trim();
}

async function checkHttp(url: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    return res.ok;
  } catch {
    return false;
  }
}

function isFeatureEnabled(key: string): boolean {
  return process.env[key] === 'true' || process.env[key] === '1';
}

async function main() {
  console.log('\n🩺 Doctor - Environment Diagnostics\n');

  await check('Node.js', () => {
    const v = cmdOutput('node --version');
    const major = parseInt(v.replace('v', ''));
    return major >= 18 ? true : `Node ${v} detected, 18+ recommended`;
  });

  await check('.env file', () => existsSync(resolve(ROOT, '.env')));
  
  await check('Docker Compose', () => {
    cmdOutput('docker compose version');
    return true;
  });

  await check('PostgreSQL', async () => {
    const port = process.env.POSTGRES_PORT || '5432';
    try {
      // In a real environment, we'd use pg library, but we can try to connect to the port
      const res = await fetch(`http://localhost:${port}`).catch((e) => e);
      // It will throw a protocol error but connection will succeed if it's up
      return res.cause?.code === 'ECONNREFUSED' ? false : true;
    } catch {
      return false;
    }
  });

  await check('pgAdmin', async () => {
    const port = process.env.PGADMIN_PORT || '5050';
    try {
      // It will return a 302 or 200
      const res = await fetch(`http://localhost:${port}/login`, { redirect: 'manual' }).catch(() => null);
      return res !== null;
    } catch {
      return false;
    }
  });

  await check('Mailpit', async () => {
    if (!isFeatureEnabled('FEATURE_EMAIL')) return 'disabled';
    const port = process.env.MAILPIT_HTTP_PORT || '8025';
    return await checkHttp(`http://localhost:${port}`);
  });

  await check('Redis', async () => {
    if (!isFeatureEnabled('FEATURE_REDIS')) return 'disabled';
    return 'warn'; // Would need redis-cli or similar
  });

  await check('Clerk Configuration', () => {
    if (!isFeatureEnabled('FEATURE_AUTH')) return 'disabled';
    if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
      return 'Missing Clerk Keys';
    }
    return true;
  });

  await check('Storage Provider', () => isFeatureEnabled('FEATURE_STORAGE') ? true : 'disabled');
  await check('Payments', () => isFeatureEnabled('FEATURE_PAYMENTS') ? true : 'disabled');
  await check('AI', () => isFeatureEnabled('FEATURE_AI') ? true : 'disabled');

  // Report
  const icons = { pass: 'READY', fail: 'FAILED', warn: 'WARNING', disabled: 'DISABLED' };
  
  // Create aligned output
  for (const r of results) {
    const icon = icons[r.status].padEnd(8);
    const detail = r.detail ? ` (${r.detail})` : '';
    console.log(`  [${icon}] ${r.label}${detail}`);
  }

  const failures = results.filter((r) => r.status === 'fail').length;
  console.log(
    failures > 0
      ? `\n❌ ${failures} issue(s) found. Fix them before continuing.\n`
      : '\n✅ All checks passed or gracefully disabled!\n'
  );

  process.exit(failures > 0 ? 1 : 0);
}

main().catch(console.error);
