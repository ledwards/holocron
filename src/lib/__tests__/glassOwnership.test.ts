import * as fs from 'fs';
import * as path from 'path';

/**
 * Glass has one definition, GlassSurface, and the tab bar draws its own through
 * the navigator. Before, each screen drew glass under the bar for itself:
 * Decklists and the Cards dock did, Rules did not, so Rules had a bar with no
 * glass behind it. A screen that needs glass uses GlassSurface or SearchDock.
 */
const SRC = path.join(__dirname, '../..');

const sourceFiles = (dir: string): string[] =>
  fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return ['__tests__', 'e2e', '__fixtures__', 'data'].includes(entry.name) ? [] : sourceFiles(full);
    }
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
const read = (...parts: string[]) => fs.readFileSync(path.join(SRC, ...parts), 'utf8');
const rel = (file: string) => path.relative(SRC, file);

it('only GlassSurface, the navigation headers and card rows import the blur view', () => {
  const allowed = [
    path.join('components', 'glass', 'GlassSurface.tsx'),
    path.join('components', 'navigation', 'TabNavigation.tsx'), // header backgrounds
    path.join('components', 'cards', 'CardListItem.tsx'), // row artwork
  ];
  const offenders = sourceFiles(SRC)
    .filter(file => /react-native-community\/blur/.test(fs.readFileSync(file, 'utf8')))
    .map(rel)
    .filter(file => !allowed.includes(file));
  expect(offenders).toEqual([]);
});

it('draws the tab bar glass once, in the navigator, for every tab', () => {
  const navigation = read('components', 'navigation', 'TabNavigation.tsx');
  expect(navigation).toMatch(/tabBarBackground:\s*\(\)\s*=>\s*<GlassSurface/);
  expect(navigation).not.toMatch(/tabBarBackground:\s*\(\)\s*=>\s*null/);
});

it('has no per-screen glass behind the tab bar', () => {
  const files = sourceFiles(SRC).map(rel);
  expect(files).not.toContain(path.join('components', 'decklists', 'DecklistEmptyFooter.tsx'));
  expect(files).toContain(path.join('components', 'glass', 'SearchDock.tsx'));
});
