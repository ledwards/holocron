/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

const COMPARE_PATH = path.resolve(__dirname, 'input', 'focused-compare.json');
const AUDIT_PATH = path.resolve(__dirname, 'input', 'audit-report.json');
const FOCUSED_RUNS_PATH = path.resolve(__dirname, 'input', 'extracted-runs.focused.json');
const BASE_RUNS_PATH = path.resolve(__dirname, 'input', 'extracted-runs.json');
const OPENAI_KEY_ENV_NAMES = ['OPENAI_API_KEY', 'OPENAI_KEY', 'OPENAI_TOKEN'];

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function parseArg(name, fallback = '') {
  const prefix = `--${name}=`;
  const hit = process.argv.find(value => value.startsWith(prefix));
  if (!hit) {
    return fallback;
  }
  return hit.slice(prefix.length);
}

function run(command) {
  console.log(`\n$ ${command}`);
  execSync(command, {stdio: 'inherit'});
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function printFocusedSummary(label) {
  if (!fs.existsSync(COMPARE_PATH)) {
    console.log(`${label}: focused comparison missing at ${COMPARE_PATH}`);
    return;
  }

  const compare = readJson(COMPARE_PATH);
  const summary = compare.summary || {};
  console.log(
    `${label}: improved=${summary.improved || 0} unchanged=${summary.unchanged || 0} ` +
      `worse=${summary.worse || 0} avgDelta=${summary.avgDelta || 0}`,
  );
}

function printTopAuditPages(label, limit = 10) {
  if (!fs.existsSync(AUDIT_PATH)) {
    console.log(`${label}: audit report missing at ${AUDIT_PATH}`);
    return;
  }

  const audit = readJson(AUDIT_PATH).slice(0, limit);
  console.log(`${label}: top ${audit.length} suspicious pages`);
  audit.forEach(entry => {
    console.log(
      `  p${entry.page} score=${entry.score} splitWords=${entry.splitWordCount} ` +
        `shortRatio=${entry.shortLineRatio}`,
    );
  });
}

function resolveOpenAiApiKey() {
  for (const envName of OPENAI_KEY_ENV_NAMES) {
    const value = process.env[envName];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return '';
}

function main() {
  const skipDownload = hasFlag('skip-download');
  const skipExtract = hasFlag('skip-extract');
  const skipGenerate = hasFlag('skip-generate');
  const skipLlmClean = hasFlag('skip-llm-clean');
  const changedPagesOnly = hasFlag('changed-pages-only');
  const changedPages = parseArg('changed-pages', '');
  const changedPagesFile = parseArg('changed-pages-file', '');
  const openAiApiKey = resolveOpenAiApiKey();
  const useLlmClean = !skipLlmClean && (hasFlag('llm-clean') || Boolean(openAiApiKey));

  console.log('Phase 3 text extraction pipeline');
  console.log(
    `Options: skipDownload=${skipDownload} skipExtract=${skipExtract} ` +
      `skipGenerate=${skipGenerate} llmClean=${useLlmClean} skipLlmClean=${skipLlmClean}`,
  );

  if (!skipDownload) {
    run('npm run rules:download');
  }

  if (!skipExtract) {
    run('npm run rules:extract');
  } else if (!fs.existsSync(BASE_RUNS_PATH)) {
    throw new Error(`Missing base runs file at ${BASE_RUNS_PATH}`);
  }

  run(`npm run rules:audit -- --runs=${BASE_RUNS_PATH} --limit=30`);
  printTopAuditPages('Base audit');

  run(`npm run rules:focused-regenerate -- --threshold=20 --max-pages=16${skipGenerate ? ' --apply=false' : ''}`);
  printFocusedSummary('Pass 1');
  run(`npm run rules:focused-regenerate -- --threshold=15 --max-pages=24${skipGenerate ? ' --apply=false' : ''}`);
  printFocusedSummary('Pass 2');
  run(`npm run rules:focused-regenerate -- --threshold=10 --max-pages=40${skipGenerate ? ' --apply=false' : ''}`);
  printFocusedSummary('Pass 3');

  if (fs.existsSync(FOCUSED_RUNS_PATH)) {
    run(`npm run rules:audit -- --runs=${FOCUSED_RUNS_PATH} --limit=20`);
    printTopAuditPages('Focused audit');
  }

  if (useLlmClean) {
    if (!openAiApiKey) {
      throw new Error(
        `Missing OpenAI API key. Set one of: ${OPENAI_KEY_ENV_NAMES.join(', ')} or pass --skip-llm-clean.`,
      );
    }
    const llmArgs = [];
    if (changedPagesOnly) {
      llmArgs.push('--changed-pages-only');
    }
    if (changedPages) {
      llmArgs.push(`--changed-pages=${changedPages}`);
    }
    if (changedPagesFile) {
      llmArgs.push(`--changed-pages-file=${changedPagesFile}`);
    }

    const llmCommand =
      llmArgs.length > 0
        ? `npm run rules:llm-clean -- ${llmArgs.join(' ')}`
        : 'npm run rules:llm-clean';
    run(llmCommand);
  }

  run('npm run rules:quality-gate');
}

main();
