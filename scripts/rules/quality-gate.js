/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
require('@babel/register')({
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  ignore: [/node_modules/],
});

const {
  diffRulesQuality,
  evaluateRulesQuality,
  scanRulesQuality,
} = require('../../src/lib/rules/qualityGate');

const DEFAULT_DOCUMENT_PATH = path.resolve(
  __dirname,
  '..',
  '..',
  'src',
  'data',
  'rules',
  'rules.document.json',
);
const DEFAULT_REPORT_PATH = path.resolve(__dirname, 'input', 'quality-report.json');
const DEFAULT_LAST_REPORT_PATH = path.resolve(__dirname, 'input', 'quality-report.last.json');

function parseArg(name, fallback) {
  const prefix = `--${name}=`;
  const hit = process.argv.find(value => value.startsWith(prefix));
  if (!hit) {
    return fallback;
  }
  return hit.slice(prefix.length);
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function printSummary(report) {
  console.log(`Quality matches: ${report.totalMatches}`);
  report.patterns.forEach(pattern => {
    const status = pattern.count > pattern.maxCount ? 'FAIL' : 'ok';
    console.log(
      `  [${status}] ${pattern.id}: count=${pattern.count} max=${pattern.maxCount}`,
    );
  });
}

function printDiff(diff) {
  const changed = diff.filter(entry => entry.delta !== 0);
  if (!changed.length) {
    console.log('Quality diff vs last: no changes');
    return;
  }

  console.log('Quality diff vs last:');
  changed.forEach(entry => {
    const sign = entry.delta > 0 ? '+' : '';
    console.log(
      `  ${entry.id}: ${entry.previous} -> ${entry.current} (${sign}${entry.delta})`,
    );
  });
}

function main() {
  const documentPath = parseArg('document', DEFAULT_DOCUMENT_PATH);
  const outPath = parseArg('out', DEFAULT_REPORT_PATH);
  const lastPath = parseArg('last', DEFAULT_LAST_REPORT_PATH);
  const allowRegressions = hasFlag('allow-regressions');

  if (!fs.existsSync(documentPath)) {
    console.error(`Missing rules document: ${documentPath}`);
    process.exit(1);
  }

  const document = readJson(documentPath);
  const report = scanRulesQuality(document);
  const evaluation = evaluateRulesQuality(report);

  writeJson(outPath, report);
  printSummary(report);

  let hasRegression = false;
  if (fs.existsSync(lastPath)) {
    const previous = readJson(lastPath);
    const diff = diffRulesQuality(previous, report);
    printDiff(diff);
    hasRegression = diff.some(entry => entry.delta > 0);
    if (hasRegression && !allowRegressions) {
      console.error('Quality regression detected compared to last report.');
    }
  } else {
    console.log('Quality diff vs last: no baseline yet');
  }

  if (!evaluation.ok) {
    console.error('Quality gate failed: one or more pattern thresholds exceeded.');
  }

  const failed = !evaluation.ok || (hasRegression && !allowRegressions);
  if (!failed) {
    writeJson(lastPath, report);
  }

  process.exit(failed ? 1 : 0);
}

main();

