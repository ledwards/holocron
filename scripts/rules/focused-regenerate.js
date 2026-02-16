/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');
require('@babel/register')({
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  ignore: [/node_modules/],
});

const {auditExtractedTextRuns} = require('../../src/lib/rules/RulesParser');
const {parseExtractedTextRuns} = require('../../src/lib/rules/RulesParser');
const {applyFocusedCleanup} = require('../../src/lib/rules/focusedCleanup');

const INPUT_RUNS_PATH = path.resolve(__dirname, 'input', 'extracted-runs.json');
const INPUT_AUDIT_PATH = path.resolve(__dirname, 'input', 'audit-report.json');
const INPUT_META_PATH = path.resolve(__dirname, 'input', 'extracted-meta.json');
const OUTPUT_RUNS_PATH = path.resolve(
  __dirname,
  'input',
  'extracted-runs.focused.json',
);
const OUTPUT_COMPARE_PATH = path.resolve(
  __dirname,
  'input',
  'focused-compare.json',
);

function parseArg(name, fallback) {
  const prefix = `--${name}=`;
  const hit = process.argv.find(value => value.startsWith(prefix));
  if (!hit) {
    return fallback;
  }
  return hit.slice(prefix.length);
}

function toMapByPage(audit) {
  const map = new Map();
  audit.forEach(entry => map.set(entry.page, entry));
  return map;
}

function pickTargetPages(auditReport, threshold, maxPages) {
  return auditReport
    .filter(entry => entry.score >= threshold)
    .sort((a, b) => b.score - a.score || a.page - b.page)
    .slice(0, maxPages)
    .map(entry => entry.page);
}

function parseMetadataFromFile(metaPath) {
  if (!fs.existsSync(metaPath)) {
    return {
      sourceUrl: 'unknown',
      sourceSha256: 'unknown',
      generatedAt: new Date().toISOString(),
      version: 'focused-regenerate',
    };
  }

  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  return {
    sourceUrl: meta.sourceUrl || 'unknown',
    sourceSha256: meta.sourceSha256 || 'unknown',
    generatedAt: meta.extractedAt || new Date().toISOString(),
    version: 'focused-regenerate',
  };
}

function collectLowConfidencePages(runs, confidenceThreshold, maxPages, metaPath) {
  const parsed = parseExtractedTextRuns(runs, parseMetadataFromFile(metaPath));
  const pageMap = new Map();

  parsed.sections.forEach(section => {
    section.blocks.forEach(block => {
      if (block.type !== 'paragraph') {
        return;
      }
      const page = Number(block.pageRef || section.pageRef || 0);
      if (!Number.isFinite(page) || page <= 0) {
        return;
      }
      const score =
        typeof block.confidenceScore === 'number' ? block.confidenceScore : 1;
      if (score >= confidenceThreshold) {
        return;
      }

      const entry = pageMap.get(page) || {page, lowCount: 0, sumScore: 0};
      entry.lowCount += 1;
      entry.sumScore += score;
      pageMap.set(page, entry);
    });
  });

  return [...pageMap.values()]
    .sort((a, b) => {
      if (b.lowCount !== a.lowCount) {
        return b.lowCount - a.lowCount;
      }
      return a.sumScore - b.sumScore || a.page - b.page;
    })
    .slice(0, maxPages)
    .map(entry => entry.page);
}

function compareAudit(beforeAudit, afterAudit, targetPages) {
  const beforeMap = toMapByPage(beforeAudit);
  const afterMap = toMapByPage(afterAudit);
  const pages = targetPages.map(page => {
    const before = beforeMap.get(page);
    const after = afterMap.get(page);
    const delta = Number(((after?.score || 0) - (before?.score || 0)).toFixed(2));
    return {
      page,
      beforeScore: before?.score || 0,
      afterScore: after?.score || 0,
      delta,
    };
  });

  const improved = pages.filter(p => p.delta < 0).length;
  const unchanged = pages.filter(p => p.delta === 0).length;
  const worse = pages.filter(p => p.delta > 0).length;
  const avgBefore =
    pages.reduce((sum, p) => sum + p.beforeScore, 0) / Math.max(1, pages.length);
  const avgAfter =
    pages.reduce((sum, p) => sum + p.afterScore, 0) / Math.max(1, pages.length);

  return {
    summary: {
      targetCount: pages.length,
      improved,
      unchanged,
      worse,
      avgBefore: Number(avgBefore.toFixed(2)),
      avgAfter: Number(avgAfter.toFixed(2)),
      avgDelta: Number((avgAfter - avgBefore).toFixed(2)),
    },
    pages,
  };
}

function main() {
  const runsPath = parseArg('runs', INPUT_RUNS_PATH);
  const auditPath = parseArg('audit', INPUT_AUDIT_PATH);
  const scoreThreshold = Number(parseArg('threshold', '90'));
  const maxPages = Number(parseArg('max-pages', '20'));
  const confidenceThreshold = Number(parseArg('confidence-threshold', '0.56'));
  const confidenceMaxPages = Number(parseArg('confidence-max-pages', '12'));
  const metaPath = parseArg('meta', INPUT_META_PATH);
  const apply = parseArg('apply', 'true') !== 'false';

  if (!fs.existsSync(runsPath)) {
    console.error(`Missing runs file: ${runsPath}`);
    process.exit(1);
  }

  const runs = JSON.parse(fs.readFileSync(runsPath, 'utf8'));
  const beforeAudit = auditExtractedTextRuns(runs);
  const sourceAudit = fs.existsSync(auditPath)
    ? JSON.parse(fs.readFileSync(auditPath, 'utf8'))
    : beforeAudit;

  const auditPages = pickTargetPages(sourceAudit, scoreThreshold, maxPages);
  const confidencePages = collectLowConfidencePages(
    runs,
    confidenceThreshold,
    confidenceMaxPages,
    metaPath,
  );
  const targetPages = [...new Set([...auditPages, ...confidencePages])];
  if (!targetPages.length) {
    console.log('No pages met focused regeneration threshold.');
    process.exit(0);
  }

  const cleanedRuns = applyFocusedCleanup(runs, new Set(targetPages));
  const afterAudit = auditExtractedTextRuns(cleanedRuns);
  const compare = compareAudit(beforeAudit, afterAudit, targetPages);

  fs.writeFileSync(OUTPUT_RUNS_PATH, JSON.stringify(cleanedRuns, null, 2));
  fs.writeFileSync(OUTPUT_COMPARE_PATH, JSON.stringify(compare, null, 2));

  console.log(`Targeted pages: ${targetPages.join(', ')}`);
  if (confidencePages.length) {
    console.log(
      `Included low-confidence pages: ${confidencePages.join(', ')} (threshold ${confidenceThreshold})`,
    );
  }
  console.log(`Comparison written: ${OUTPUT_COMPARE_PATH}`);
  console.log(`Focused runs written: ${OUTPUT_RUNS_PATH}`);
  console.log(
    `Summary: improved=${compare.summary.improved} unchanged=${compare.summary.unchanged} ` +
      `worse=${compare.summary.worse} avgDelta=${compare.summary.avgDelta}`,
  );

  if (apply) {
    execSync(`node scripts/rules/generate-rules.js --runs=${OUTPUT_RUNS_PATH}`, {
      stdio: 'inherit',
    });
  } else {
    console.log('Dry-run mode: skipped rules generation apply step.');
  }
}

main();
