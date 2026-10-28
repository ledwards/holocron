/* eslint-env node */
/* global document */
/* eslint-disable @typescript-eslint/no-var-requires */
// Drives the real Holocron web build through iPhone Duo poses and screenshots each.
const {chromium} = require('playwright');
const fs = require('fs');

const OUT = process.argv[2];
const BASE = process.argv[3] || 'http://127.0.0.1:8790/';
const ONLY = process.argv[4] ? process.argv[4].split(',') : null;

// Points: Apple publishes pixels only (1398x2034 outer, 1878x2670 inner), /3.
// Insets: iPhone Duo puts its status strip on the trailing edge when closed and
// when open in landscape (assumed 54pt, unverified); upright it is at the top.
const CLOSED = {width: 466, height: 678, insets: {top: 0, right: 54, bottom: 20, left: 0}};
const CLOSED_LANDSCAPE = {width: 678, height: 466, insets: {top: 0, right: 54, bottom: 20, left: 0}};
const OPEN = {width: 890, height: 626, insets: {top: 0, right: 54, bottom: 20, left: 0}};
const OPEN_UPRIGHT = {width: 626, height: 890, insets: {top: 32, right: 0, bottom: 20, left: 0}};
const BOOK = {...OPEN, fold: {x: 433, y: 0, width: 24, height: 626}};
const TABLE = {...OPEN_UPRIGHT, fold: {x: 0, y: 433, width: 626, height: 24}};

const cardsSearch = async page => {
  await page.fill('[data-testid="cards-search-input"]', 'vader');
};
const cardsSelect = async page => {
  await cardsSearch(page);
  await page.waitForTimeout(500);
  await page.getByLabel('•Darth Vader', {exact: true}).first().click();
};
const deckSelect = async page => {
  await page.click('[data-testid="tab-decklists"]');
  await page.waitForTimeout(600);
  await page.fill('[data-testid="decklists-search-input"]', 'skwara');
  await page.waitForTimeout(600);
  await page.getByLabel('Watch Your Step', {exact: true}).first().click();
};
const rulesStack = async (page, split) => {
  await page.click('[data-testid="tab-rules"]');
  await page.waitForTimeout(800);
  if (split) {
    // "The Stack" in the contents list (order 11 in the generated rulebook)
    await page.click('[data-testid="rules-toc-item-11"]');
  } else {
    await page.click('[data-testid="rules-open-search"]');
    await page.fill('[data-testid="rules-search-input"]', 'current action');
    await page.waitForTimeout(500);
    await page.click('[data-testid="rules-search-result-1"]');
  }
};

const SHOTS = [
  ['01-closed-cards-search', CLOSED, cardsSearch],
  ['02-closed-deck-gallery', CLOSED, deckSelect],
  ['03-closed-rules', CLOSED, p => rulesStack(p, false)],
  ['04-closed-landscape-cards', CLOSED_LANDSCAPE, cardsSearch],
  ['05-open-decks', OPEN, deckSelect],
  ['06-open-cards', OPEN, cardsSelect],
  ['07-open-rules', OPEN, p => rulesStack(p, true)],
  ['08-open-upright-rules', OPEN_UPRIGHT, p => rulesStack(p, true)],
  ['09-open-upright-decks', OPEN_UPRIGHT, deckSelect],
  ['10-book-cards', BOOK, cardsSelect],
  ['11-book-decks', BOOK, deckSelect],
  ['12-book-rules', BOOK, p => rulesStack(p, true)],
  ['13-table-cards', TABLE, cardsSelect],
  ['14-table-decks', TABLE, deckSelect],
];

(async () => {
  fs.mkdirSync(OUT, {recursive: true});
  const proxy = process.env.HTTPS_PROXY ? {server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1'} : undefined;
  const browser = await chromium.launch({proxy});
  const report = [];
  for (const [name, scenario, act] of SHOTS) {
    if (ONLY && !ONLY.includes(name)) continue;
    const page = await browser.newPage({viewport: {width: scenario.width, height: scenario.height}, deviceScaleFactor: 2, colorScheme: 'dark'});
    // res.starwarsccg.org is denied by this environment's network policy. When
    // REAL_ART is unset, mark where each card image goes instead of inventing art.
    if (!process.env.REAL_ART) {
      await page.route('https://res.starwarsccg.org/**', route => route.fulfill({
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="339" height="475" viewBox="0 0 339 475">'
          + '<rect x="3" y="3" width="333" height="469" rx="16" fill="#3A3E42" stroke="#8A939A" stroke-width="3"/>'
          + '<text x="169" y="230" font-family="Inter, sans-serif" font-size="26" fill="#C9D0D5" text-anchor="middle">card image</text>'
          + '<text x="169" y="264" font-family="Inter, sans-serif" font-size="22" fill="#9AA3AA" text-anchor="middle">(host blocked here)</text></svg>',
      }));
    }
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
    await page.goto(BASE + '#' + encodeURIComponent(JSON.stringify(scenario)));
    await page.waitForSelector('[data-testid="cards-search-input"]', {timeout: 30000});
    let failed = '';
    try {
      await act(page);
    } catch (e) {
      failed = e.message.split('\n')[0];
    }
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.waitForLoadState('networkidle').catch(() => undefined);
    await page.waitForTimeout(1500);
    await page.screenshot({path: `${OUT}/${name}.png`});
    report.push(`${name}: ${failed ? 'ACTION FAILED ' + failed : 'ok'}${errors.length ? ' | errors: ' + errors.slice(0, 3).join(' / ') : ''}`);
    await page.close();
  }
  await browser.close();
  console.log(report.join('\n'));
})();
