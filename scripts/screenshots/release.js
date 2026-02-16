#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const {parseScenarios} = require('./lib/parser');
const {
  readJsonFile,
  resolveScreenshotJobs,
} = require('./lib/requirements');
const {executeJobs} = require('./lib/runtime');

function parseArgs(argv) {
  const args = {
    platform: 'both',
    config: 'screenshots/scenarios.txt',
    requirements: 'screenshots/requirements.json',
    devices: 'screenshots/devices.json',
    outDir: 'artifacts/screenshots',
    dryRun: false,
    continueOnError: false,
    scenario: '',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--platform') {
      args.platform = argv[i + 1];
      i += 1;
    } else if (arg === '--config') {
      args.config = argv[i + 1];
      i += 1;
    } else if (arg === '--requirements') {
      args.requirements = argv[i + 1];
      i += 1;
    } else if (arg === '--devices') {
      args.devices = argv[i + 1];
      i += 1;
    } else if (arg === '--out-dir') {
      args.outDir = argv[i + 1];
      i += 1;
    } else if (arg === '--scenario') {
      args.scenario = argv[i + 1];
      i += 1;
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--continue-on-error') {
      args.continueOnError = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function run() {
  const args = parseArgs(process.argv.slice(2));
  const repoRoot = process.cwd();

  const scenariosPath = path.resolve(repoRoot, args.config);
  const requirementsPath = path.resolve(repoRoot, args.requirements);
  const devicesPath = path.resolve(repoRoot, args.devices);
  const outDir = path.resolve(repoRoot, args.outDir);

  if (!fs.existsSync(scenariosPath)) {
    throw new Error(`Missing scenarios file: ${scenariosPath}`);
  }

  if (!fs.existsSync(requirementsPath)) {
    throw new Error(`Missing requirements file: ${requirementsPath}`);
  }

  let effectiveDevicesPath = devicesPath;
  if (!fs.existsSync(effectiveDevicesPath)) {
    const examplePath = path.resolve(repoRoot, 'screenshots/devices.example.json');
    if (args.dryRun && fs.existsSync(examplePath)) {
      effectiveDevicesPath = examplePath;
      console.log(
        `Using ${examplePath} for dry run. Create screenshots/devices.json for real captures.`,
      );
    } else {
      throw new Error(
        `Missing devices file: ${devicesPath}. Copy screenshots/devices.example.json to screenshots/devices.json and set device IDs.`,
      );
    }
  }

  const scenarios = parseScenarios(fs.readFileSync(scenariosPath, 'utf8'));
  const requirements = readJsonFile(requirementsPath);
  const devicesConfig = readJsonFile(effectiveDevicesPath);

  const jobs = resolveScreenshotJobs({
    requirements,
    scenarios,
    platformSelection: args.platform,
    scenarioFilter: args.scenario,
  });

  if (jobs.length === 0) {
    throw new Error('No screenshot jobs resolved. Check --platform and scenario filters.');
  }

  const {rows, reportPath} = executeJobs({
    jobs,
    devicesConfig,
    outDir,
    repoRoot,
    dryRun: args.dryRun,
    continueOnError: args.continueOnError,
  });

  const failed = rows.filter(row => row.status === 'FAILED');

  console.log(`Screenshot jobs: ${rows.length}`);
  console.log(`Failed jobs: ${failed.length}`);
  console.log(`Report: ${reportPath}`);

  if (failed.length > 0) {
    const summary = failed
      .map(row => `${row.platform}/${row.profileId}/${row.scenarioId}: ${row.error}`)
      .join('\n');
    throw new Error(`Screenshot generation failed:\n${summary}`);
  }
}

try {
  run();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
