import * as fs from 'fs';
import * as path from 'path';

/**
 * Bottom clearance has one definition, useBottomClearance: the bottom tab bar
 * on a regular iPhone, only the home indicator beside iPhone Duo's vertical
 * strip. A screen that reads the tab bar height itself keeps reserving a bar
 * that is not there: four views did on 2026-10-28 and drew an empty band
 * across the deck gallery on iPhone Duo.
 */
const SRC = path.join(__dirname, '../..');
const OWNER = path.join(SRC, 'lib', 'useBottomClearance.ts');

const sourceFiles = (dir: string): string[] =>
  fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return ['__tests__', 'e2e', '__fixtures__', 'data'].includes(entry.name) ? [] : sourceFiles(full);
    }
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });

it('only useBottomClearance reads the bottom tab bar height', () => {
  const offenders = sourceFiles(SRC)
    .filter(file => file !== OWNER)
    .filter(file => /useBottomTabBarHeight\s*\(/.test(fs.readFileSync(file, 'utf8')))
    .map(file => path.relative(SRC, file));
  expect(offenders).toEqual([]);
});

it('scans the files that matter', () => {
  const files = sourceFiles(SRC).map(file => path.relative(SRC, file));
  expect(files).toContain(path.join('components', 'decklists', 'DecklistsScreenGridView.tsx'));
  expect(files).toContain(path.join('lib', 'useBottomClearance.ts'));
});
