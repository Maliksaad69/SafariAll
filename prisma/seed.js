#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function runStep(command, args, label) {
  console.log(`\n======================================================`);
  console.log(`==> ${label}`);
  console.log(`======================================================\n`);
  const result = spawnSync(command, args, { stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    console.error(`❌ [ERROR] ${label} failed with exit code ${result.status}`);
    process.exit(result.status || 1);
  }
}

// 1. Check for pre-bundled standalone JavaScript files (used in Docker runner)
const distSeedBase = path.join(__dirname, '../dist-seed/seed-base.js');
const distSeedDummy = path.join(__dirname, '../dist-seed/seed-dummy.js');
const altSeedBase = path.join(__dirname, './dist-seed/seed-base.js');
const altSeedDummy = path.join(__dirname, './dist-seed/seed-dummy.js');

const hasBundled =
  (fs.existsSync(distSeedBase) && fs.existsSync(distSeedDummy)) ||
  (fs.existsSync(altSeedBase) && fs.existsSync(altSeedDummy));

if (hasBundled) {
  const baseScript = fs.existsSync(distSeedBase) ? distSeedBase : altSeedBase;
  const dummyScript = fs.existsSync(distSeedDummy) ? distSeedDummy : altSeedDummy;

  runStep(process.execPath, [baseScript], 'Step 1/2: Base Marketplace Seed (Admin, Agencies, Base Tours)');
  runStep(process.execPath, [dummyScript], 'Step 2/2: Complete Dummy Data Seed (All Parks Tours, Reviews, Inquiries)');

  console.log('\n🎉 ALL DATABASE SEEDING COMPLETED SUCCESSFULLY!\n');
} else {
  // 2. Fallback to TypeScript execution via tsx (used in local development)
  const baseTs = path.join(__dirname, 'seed.ts');
  const dummyTs = path.join(__dirname, '../scripts/seed-complete-dummy-data.ts');

  runStep('npx', ['tsx', `"${baseTs}"`], 'Step 1/2: Base Marketplace Seed via tsx (prisma/seed.ts)');
  runStep('npx', ['tsx', `"${dummyTs}"`], 'Step 2/2: Complete Dummy Data Seed via tsx (scripts/seed-complete-dummy-data.ts)');

  console.log('\n🎉 ALL DATABASE SEEDING COMPLETED SUCCESSFULLY!\n');
}
