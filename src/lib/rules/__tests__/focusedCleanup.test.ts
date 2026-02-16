import {applyFocusedCleanup} from '../focusedCleanup';
import {ExtractedTextRun} from '../types';

describe('applyFocusedCleanup', () => {
  it('merges single-letter split words on targeted pages only', () => {
    const runs: ExtractedTextRun[] = [
      {page: 10, x: 10, y: 100, text: 'p'},
      {page: 10, x: 20, y: 100, text: 'roviding'},
      {page: 11, x: 10, y: 100, text: 'p'},
      {page: 11, x: 20, y: 100, text: 'roviding'},
    ];

    const cleaned = applyFocusedCleanup(runs, new Set([10]));
    const p10 = cleaned.filter(run => run.page === 10).map(run => run.text);
    const p11 = cleaned.filter(run => run.page === 11).map(run => run.text);

    expect(p10).toEqual(['providing']);
    expect(p11).toEqual(['p', 'roviding']);
  });

  it('removes linked dot-leader artifacts on targeted pages', () => {
    const runs: ExtractedTextRun[] = [
      {page: 5, x: 10, y: 100, text: '.....', internalHref: 'page-6'},
      {page: 5, x: 40, y: 100, text: '20', internalHref: 'page-6'},
      {page: 5, x: 10, y: 120, text: 'Real text'},
    ];

    const cleaned = applyFocusedCleanup(runs, new Set([5]));
    expect(cleaned.map(run => run.text)).toEqual(['20', 'Real text']);
  });

  it('repairs tail-letter splits like "Separatis" + "t"', () => {
    const runs: ExtractedTextRun[] = [
      {page: 9, x: 10, y: 100, text: 'Separatis'},
      {page: 9, x: 22, y: 100, text: 't'},
    ];

    const cleaned = applyFocusedCleanup(runs, new Set([9]));
    expect(cleaned.map(run => run.text)).toEqual(['Separatist']);
  });

  it('attaches middle single-letter fragments to next token when closer', () => {
    const runs: ExtractedTextRun[] = [
      {page: 9, x: 10, y: 110, text: 'Starting'},
      {page: 9, x: 45, y: 110, text: 't'},
      {page: 9, x: 48, y: 110, text: 'his'},
    ];

    const cleaned = applyFocusedCleanup(runs, new Set([9]));
    expect(cleaned.map(run => run.text)).toEqual(['Starting', 'this']);
  });

  it("repairs apostrophe suffix splits like \"Playe\" + \"r's\"", () => {
    const runs: ExtractedTextRun[] = [
      {page: 9, x: 10, y: 120, text: 'Playe'},
      {page: 9, x: 24, y: 120, text: "r's"},
    ];

    const cleaned = applyFocusedCleanup(runs, new Set([9]));
    expect(cleaned.map(run => run.text)).toEqual(["Player's"]);
  });

  it('does not merge common short words with following words', () => {
    const runs: ExtractedTextRun[] = [
      {page: 9, x: 10, y: 140, text: 'a'},
      {page: 9, x: 18, y: 140, text: 'card'},
    ];

    const cleaned = applyFocusedCleanup(runs, new Set([9]));
    expect(cleaned.map(run => run.text)).toEqual(['a', 'card']);
  });

  it("repairs split contractions like \"it\" + \"s\" into \"it's\"", () => {
    const runs: ExtractedTextRun[] = [
      {page: 9, x: 10, y: 160, text: 'it'},
      {page: 9, x: 22, y: 160, text: 's'},
      {page: 9, x: 30, y: 160, text: 'noteworthy'},
    ];

    const cleaned = applyFocusedCleanup(runs, new Set([9]));
    expect(cleaned.map(run => run.text)).toEqual(["it's", 'noteworthy']);
  });

  it("repairs split possessives like \"player\" + \"s\" + \"hand\"", () => {
    const runs: ExtractedTextRun[] = [
      {page: 9, x: 10, y: 170, text: 'player'},
      {page: 9, x: 28, y: 170, text: 's'},
      {page: 9, x: 36, y: 170, text: 'hand'},
    ];

    const cleaned = applyFocusedCleanup(runs, new Set([9]));
    expect(cleaned.map(run => run.text)).toEqual(["player's", 'hand']);
  });

  it('repairs suffix letter splits like "prohibit" + "s" + "it"', () => {
    const runs: ExtractedTextRun[] = [
      {page: 9, x: 10, y: 180, text: 'prohibit'},
      {page: 9, x: 29, y: 180, text: 's'},
      {page: 9, x: 35, y: 180, text: 'it'},
    ];

    const cleaned = applyFocusedCleanup(runs, new Set([9]));
    expect(cleaned.map(run => run.text)).toEqual(['prohibits', 'it']);
  });

  it('repairs phrase-level trailing letter split like "has m" + "ultiple"', () => {
    const runs: ExtractedTextRun[] = [
      {page: 9, x: 10, y: 190, text: 'When a card has m'},
      {page: 9, x: 130, y: 190, text: 'ultiple printed destiny values'},
    ];

    const cleaned = applyFocusedCleanup(runs, new Set([9]));
    expect(cleaned.map(run => run.text)).toEqual([
      'When a card has multiple printed destiny values',
    ]);
  });

  it('repairs phrase-level leading letter split like "Ligh" + "t must"', () => {
    const runs: ExtractedTextRun[] = [
      {page: 9, x: 10, y: 200, text: 'Aqua Monster, etc) Ligh'},
      {page: 9, x: 140, y: 200, text: 't must likewise select the'},
    ];

    const cleaned = applyFocusedCleanup(runs, new Set([9]));
    expect(cleaned.map(run => run.text)).toEqual([
      'Aqua Monster, etc) Light must likewise select the',
    ]);
  });

  it("repairs phrase-level apostrophe split like \"playe\" + \"r's hand\"", () => {
    const runs: ExtractedTextRun[] = [
      {page: 9, x: 10, y: 210, text: 'to a playe'},
      {page: 9, x: 90, y: 210, text: "r's hand"},
    ];

    const cleaned = applyFocusedCleanup(runs, new Set([9]));
    expect(cleaned.map(run => run.text)).toEqual(["to a player's hand"]);
  });

  it('repairs intra-run split words like "d oes"', () => {
    const runs: ExtractedTextRun[] = [{page: 9, x: 10, y: 220, text: 'Light d oes'}];

    const cleaned = applyFocusedCleanup(runs, new Set([9]));
    expect(cleaned.map(run => run.text)).toEqual(['Light does']);
  });

  it('repairs intra-run split contractions like "it s"', () => {
    const runs: ExtractedTextRun[] = [
      {page: 9, x: 10, y: 230, text: 'Second, it s noteworthy'},
    ];

    const cleaned = applyFocusedCleanup(runs, new Set([9]));
    expect(cleaned.map(run => run.text)).toEqual(["Second, it's noteworthy"]);
  });
});
