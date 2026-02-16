/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
require('@babel/register')({
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  ignore: [/node_modules/],
});

const {auditExtractedTextRuns} = require('../../src/lib/rules/RulesParser');

const INPUT_RUNS_PATH = path.resolve(__dirname, 'input', 'extracted-runs.json');
const OUTPUT_AUDIT_PATH = path.resolve(__dirname, 'input', 'audit-report.json');

function parseArg(name, fallback) {
  const prefix = `--${name}=`;
  const hit = process.argv.find(value => value.startsWith(prefix));
  if (!hit) {
    return fallback;
  }
  return hit.slice(prefix.length);
}

function main() {
  const runsPath = parseArg('runs', INPUT_RUNS_PATH);
  const outputPath = parseArg('out', OUTPUT_AUDIT_PATH);
  const limit = Number(parseArg('limit', '25'));

  if (!fs.existsSync(runsPath)) {
    console.error(`Missing extracted runs file: ${runsPath}`);
    process.exit(1);
  }

  const runs = JSON.parse(fs.readFileSync(runsPath, 'utf8'));
  const report = auditExtractedTextRuns(runs)
    .sort((a, b) => b.score - a.score || a.page - b.page);

  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

  const top = report.slice(0, limit);
  console.log(`Audit written to ${outputPath}`);
  console.log('');
  console.log('Top suspicious pages:');
  top.forEach(entry => {
    console.log(
      `p${entry.page} score=${entry.score} lines=${entry.lineCount} ` +
        `transitions=${entry.columnTransitions} shortRatio=${entry.shortLineRatio} ` +
        `splitWords=${entry.splitWordCount} punctOnly=${entry.punctuationOnlyLineCount}`,
    );
  });
}

main();
