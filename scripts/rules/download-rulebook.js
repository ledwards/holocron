/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const DEFAULT_SOURCE_URL =
  'https://res.starwarsccg.org/rules/SWCCG_2023_AdvancedRulebook.pdf';
const DEFAULT_OUTPUT_PATH = path.resolve(
  __dirname,
  'input',
  'SWCCG_2023_AdvancedRulebook.pdf',
);

function parseArg(name, fallback) {
  const prefix = `--${name}=`;
  const hit = process.argv.find(value => value.startsWith(prefix));
  if (!hit) {
    return fallback;
  }
  return hit.slice(prefix.length);
}

async function downloadRulebook(url, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), {recursive: true});

  console.log(`Downloading rulebook from ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
  console.log(`Saved ${outputPath}`);
}

async function main() {
  const source = parseArg('source', DEFAULT_SOURCE_URL);
  const output = parseArg('out', DEFAULT_OUTPUT_PATH);
  await downloadRulebook(source, output);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
