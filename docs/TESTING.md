# Testing

## Test Types
- Unit/component tests: `src/**/__tests__/*.test.ts(x)`
- E2E-style integration tests: `src/e2e/*.e2e.test.ts(x)`
- Rules parser tests: `src/lib/rules/__tests__/*.test.ts`

## Core Commands
```bash
npm run test:unit
npm run test:e2e
npm run rules:test
npm run test:all
```

## Runtime Note
- App runtime uses Expo dev client commands (`npm run expo:ios` or `npm run ios:8081|ios:8082`).
- Test execution remains Jest-based and independent of simulator runtime.

## Change Requirements
- New feature: add/update unit or component tests.
- Bug fix: add a regression test when practical.
- Startup/data-flow change: update e2e tests in `src/e2e`.
- Rules pipeline change: update rules parser tests.

## Device Layout Regression Checks

Run layout and entry tests without Watchman when its service is unresponsive:
```bash
npm run test:unit -- --watchman=false --runInBand --coverage=false
npm run test:e2e -- --watchman=false --runInBand
```

`TabNavigation.test.tsx` protects compact icon-only bar dimensions and vertical icon centering and top protection for Rules. `DecklistDetailLayout.test.tsx` checks portrait/compact header and tab clearance. `useSearchDockBottomPadding.test.ts` verifies stable navigation clearance across navigator-height changes. `entry-registration.e2e.test.ts` protects the native/Expo entry names.

Build and install a **Release simulator** app for final visual comparisons. A Debug build can expose unrelated Metro/Expo font-download failures. Confirm the built bundle is installed, wait for cached/downloaded card and deck data, and inspect screenshots rather than trusting capture success alone.

The native layout flow lives at `screenshots/layout-regression.yaml`. Run it sequentially per simulator; concurrent Maestro sessions can contend for the iOS driver. Set `SCREENSHOT_PREFIX` to a device-specific artifact path. Inspect Cards (including keyboard and expanded card), Decklists, all three deck detail modes, and Rules. Use iPhone SE for no-home-indicator geometry and iPhone 17 Pro Max for modern safe areas. Validate native scene launch on iOS 27.1 too.

```bash
mkdir -p artifacts/layout-review
maestro --device <UDID> test -e SCREENSHOT_PREFIX=artifacts/layout-review/device screenshots/layout-regression.yaml
```

If switching devices leaves Maestro attached to the previous simulator, inspect the process listening on port 7001 and stop only the stale driver from the preceding run before retrying. A completed flow does not guarantee remote card artwork finished loading; inspect captures and repeat with warmed image caches when necessary.

Duo has multiple simulator displays. `xcrun simctl io <UDID> enumerate` identifies the active integrated display; the default display can be black when unfolded. In the installed Duo simulator, the inner display is ID 3:
```bash
xcrun simctl io <UDID> screenshot --display=3 /tmp/holocron-duo.png
```

Compare actual header/tab/home-indicator boundaries, full first and last rows, searchable controls in the accessibility hierarchy, keyboard clearance, and theme contrast. Device screenshots and logs from the October 2026 pass are in local `artifacts/layout-review/`.

## Native Adaptive Panes

`src/components/adaptive/__tests__` covers measured fit geometry, search/selection retention across width changes, compact Back, front/back resets, quantities, and deck mode retention. Rules tests cover dedicated compact search, live results, returning to the full document, clearing/empty states, contents during search, matching-page navigation, and query retention across widths.

`screenshots/adaptive-panes.yaml` exercises compact-device search, original inline card expansion/flip/collapse, the single deck mode icon cycling grid/list/text, and Rules. `layout-regression.yaml` delegates to it. Use the same `SCREENSHOT_PREFIX` argument described above. For Duo, use Device Hub's Open, Closed, and Rotate controls and capture its active display with simctl; Maestro can target the wrong display on this simulator. Verify both panes remain accessible, the selected card/deck survives folding, site images fit, and the tab bar remains legible. Check light/dark and larger text, restoring simulator settings afterwards.

The repository's plain `tsc` command is currently blocked by the removed `suppressImplicitAnyIndexErrors` option. A temporary source-only config without that option passes after replacing the two legacy SearchBars. This does not validate the original full-project configuration. Native builds and Jest are the validated gates for this pass; do not report a clean full-project typecheck.

Native rotation regression: after opening a selected deck, rotate Duo between landscape and portrait, close/reopen, and repeat with larger text. Confirm the tab bar remains inside the active display after each transition. `HolocronSceneDelegate` must preserve React Native's `RCTWindowFrameDidChangeNotification` when scene coordinates change; pane-local `onLayout` alone does not update navigator window metrics.

Run `maestro --device <UDID> test -e SCREENSHOT_PREFIX=artifacts/layout-review/rules screenshots/rules-reader.yaml` for Rules search with the keyboard, result selection, reader controls, and contents. Inspect screenshots on both iPhone 17 Pro Max and iPhone SE.

## Rules source-format fidelity
Run `npm run rules:test:extraction` for font traits, heading classification, wrapped headings, bullet continuations, style-boundary spacing, and symbol mapping. `structuredArtifact.test.ts` validates all 179 content pages (8–186), unique anchors, exact styled-span/plain-text agreement, page 9's hierarchy and italic definition, page 10's five bullets and search snippets, diagrams, and maintenance-symbol images. Unknown private-use glyphs fail extraction instead of disappearing.

Run `screenshots/rules-formatting.yaml` with Maestro and a device-specific `SCREENSHOT_PREFIX` to compare native page 9 and its Life Force diagram against the source PDF. `screenshots/rules-reader.yaml` still checks search, selecting page 10, moving to page 19, and returning to contents.

The Rules long-jump regression is covered by `screenshots/rules-symbols.yaml`: it searches text retained inside the page-99 source legend, jumps from the start of the book, and captures the symbol layout. The component regression verifies that estimated jumps are corrected until the requested page becomes visible.

Card startup regressions in `AppStartup.e2e.test.tsx` cover pending downloads, offline empty data, and failed refreshes with usable cache. `CardSearchSuggestions.test.tsx` uses the real search footer to verify suggestion-to-input synchronization, filtering, editing, and clearing. `screenshots/card-search-suggestions.yaml` exercises example taps on the native app.

Natural-language query audit: `src/models/__tests__/QueryAudit.test.ts` runs the real parser over 16 verbatim upstream rows (`src/data/__fixtures__/query-audit.json`; string and absent stats, power `*`). Its "pinned behaviour" block must stay green through any parser change. Its "known defects" block uses `it.failing` with the correct expectation: when a fix lands, Jest reports "Failing test passed even though it was expected to fail" — change that test to `it` in the same commit, never delete it. Several queries work today only by accident (see the `type effect` case), so run the full block after every parser edit, not just the test for the defect you fixed.

Card identity and query-value regressions: `Loaders.test.ts` ("loads exactly one card per gempId") drives the real loader with `(ALT)`, `(Holo AI)`, and title-variant duplicates and asserts unique ids and the canonical printing; `AliasResolver.test.ts` pins exact-match-only resolution for card nicknames and set abbreviations; `FilterQuery.test.ts` ("typed values are taken literally") pins that `set c premiere`, `side = dark`, `icons c pilot`, and `type c effect` are never rewritten into a card title, including when the value is also a card nickname. Each was verified to fail under the matching mutation (substring resolution, resolving every field as a card name, removing the id collapse, dropping `(ALT)` from the exclusion) before being trusted.

Validation note (2026-10-13): card suggestion/startup tests and iOS Release builds pass. A TypeScript check including `App.tsx` still reports the existing missing navigator `id` type requirement in `src/components/navigation/TabNavigation.tsx`; this is separate from the card startup/search changes.
