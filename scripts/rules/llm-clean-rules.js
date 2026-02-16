/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

require('@babel/register')({
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  ignore: [/node_modules/],
});

const {
  collectCleanupTargets,
  applyCleanupEdits,
} = require('../../src/lib/rules/llmCleanup');

const DEFAULT_INPUT_PATH = path.resolve(
  __dirname,
  '..',
  '..',
  'src',
  'data',
  'rules',
  'rules.document.json',
);
const DEFAULT_OUTPUT_PATH = DEFAULT_INPUT_PATH;
const DEFAULT_CHANGED_PAGES_PATH = path.resolve(
  __dirname,
  'input',
  'focused-compare.json',
);
const OPENAI_KEY_ENV_NAMES = ['OPENAI_API_KEY', 'OPENAI_KEY', 'OPENAI_TOKEN'];

function parseArg(name, fallback) {
  const prefix = `--${name}=`;
  const hit = process.argv.find(value => value.startsWith(prefix));
  if (!hit) {
    return fallback;
  }
  return hit.slice(prefix.length);
}

function toNumberArg(name, fallback) {
  const value = Number(parseArg(name, String(fallback)));
  return Number.isFinite(value) ? value : fallback;
}

function chunk(items, size) {
  const output = [];
  for (let i = 0; i < items.length; i += size) {
    output.push(items.slice(i, i + size));
  }
  return output;
}

function parsePageList(value) {
  if (!value) {
    return [];
  }
  return String(value)
    .split(',')
    .map(token => Number(token.trim()))
    .filter(page => Number.isFinite(page) && page > 0);
}

function loadChangedPagesFromCompare(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const pages = Array.isArray(payload?.pages) ? payload.pages : [];
  return pages
    .map(item => Number(item?.page))
    .filter(page => Number.isFinite(page) && page > 0);
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

async function callLlm(model, apiKey, targets) {
  const system = [
    'You clean OCR-extracted rulebook text.',
    'Fix spelling/spacing/word-break artifacts and preserve meaning exactly.',
    'Do not summarize or remove rules content.',
    'Return strict JSON only in this shape: {"edits":[{"id":"section:block","cleaned":"..."}]}',
  ].join(' ');

  const user = {
    items: targets.map(item => ({
      id: item.id,
      sectionTitle: item.sectionTitle,
      text: item.text,
    })),
  };

  const extractJson = content => {
    try {
      return JSON.parse(content);
    } catch (error) {
      const fencedMatch = content.match(/```json\\s*([\\s\\S]*?)```/i);
      if (fencedMatch?.[1]) {
        return JSON.parse(fencedMatch[1].trim());
      }
      const start = content.indexOf('{');
      const end = content.lastIndexOf('}');
      if (start >= 0 && end > start) {
        return JSON.parse(content.slice(start, end + 1));
      }
      throw error;
    }
  };

  let parseError = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: {type: 'json_object'},
        messages: [
          {role: 'system', content: system},
          {
            role: 'user',
            content:
              attempt === 1
                ? JSON.stringify(user)
                : `Return strict JSON only. Fix formatting. Input:\\n${JSON.stringify(user)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`LLM request failed: ${response.status} ${text}`);
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content || '{}';
    try {
      return extractJson(content);
    } catch (error) {
      parseError = error;
      if (attempt < 3) {
        continue;
      }
    }
  }

  throw parseError || new Error('Unable to parse LLM response JSON');
}

async function main() {
  const model = parseArg('model', process.env.RULES_CLEAN_MODEL || 'gpt-4.1-mini');
  const inputPath = parseArg('in', DEFAULT_INPUT_PATH);
  const outputPath = parseArg('out', DEFAULT_OUTPUT_PATH);
  const minScore = toNumberArg('min-score', 3);
  const limit = toNumberArg('limit', 220);
  const batchSize = toNumberArg('batch-size', 12);
  const changedPagesOnly = process.argv.includes('--changed-pages-only');
  const changedPagesArg = parseArg('changed-pages', '');
  const changedPagesComparePath = parseArg('changed-pages-file', DEFAULT_CHANGED_PAGES_PATH);

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Missing rules document at ${inputPath}`);
  }

  const document = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  let targets = collectCleanupTargets(document, {minScore, limit});
  if (changedPagesOnly) {
    const fromArg = parsePageList(changedPagesArg);
    const fromCompare = fromArg.length
      ? fromArg
      : loadChangedPagesFromCompare(changedPagesComparePath);
    const pageSet = new Set(fromCompare);
    if (!pageSet.size) {
      console.log(
        `No changed pages found. Use --changed-pages=1,2 or provide --changed-pages-file=<path>.`,
      );
      return;
    }

    targets = targets.filter(target => pageSet.has(target.pageRef));
    console.log(
      `Changed-pages mode enabled: pages=${Array.from(pageSet)
        .sort((left, right) => left - right)
        .join(',')}`,
    );
  }

  if (targets.length === 0) {
    console.log('No paragraphs met cleanup threshold.');
    return;
  }

  const apiKey = resolveOpenAiApiKey();
  if (!apiKey) {
    throw new Error(
      `Missing OpenAI API key. Set one of: ${OPENAI_KEY_ENV_NAMES.join(', ')}`,
    );
  }

  console.log(
    `LLM cleanup targets=${targets.length} model=${model} minScore=${minScore} batchSize=${batchSize}`,
  );

  const edits = {};
  const batches = chunk(targets, batchSize);
  for (let index = 0; index < batches.length; index += 1) {
    const batch = batches[index];
    const payload = await callLlm(model, apiKey, batch);
    const llmEdits = Array.isArray(payload?.edits) ? payload.edits : [];
    llmEdits.forEach(edit => {
      if (!edit?.id || typeof edit.cleaned !== 'string') {
        return;
      }
      edits[edit.id] = edit.cleaned;
    });
    console.log(
      `batch ${index + 1}/${batches.length}: requested=${batch.length} received=${llmEdits.length}`,
    );
  }

  const {updated, appliedCount, skippedCount} = applyCleanupEdits(document, edits);
  fs.mkdirSync(path.dirname(outputPath), {recursive: true});
  fs.writeFileSync(outputPath, JSON.stringify(updated, null, 2));
  console.log(`Wrote cleaned rules document: ${outputPath}`);
  console.log(`Applied edits: ${appliedCount} (skipped: ${skippedCount})`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
