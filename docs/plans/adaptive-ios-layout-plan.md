# Adaptive iOS layout and Duo

## Current snapshot
- App Store ID 6473052017 resolves to `com.ledwards.holocron`, this repository. `holocron.old` is an older checkout; `swu-holocron` is a different app.
- Navigation overrides safe-area padding with zero and fixes the complete tab bar to 62 points.
- Card/deck sizing uses global window dimensions; several detail screens estimate header/footer space from notch detection.
- Existing uncommitted Rules work must be preserved.
- Xcode 27 and iOS 26.5/27.1 simulators, including iPhone 17 Pro Max and iPhone Duo, are installed. Validation uses the repository's simulator/Maestro workflow; XcodeBuildMCP is unavailable.

## Goal and scope
Correct navigation and content insets across screen sizes; provide reviewable Duo browsing/detail comps with decklists left and selected content right. Preserve the established card artwork, light/dark themes, search behavior, and compact navigation.

## Phases and exit criteria
1. Identify shipping app and capture baseline screenshots. Exit: bundle ID verified and current layout recorded.
2. Restore system safe-area navigation and replace detail-screen inset guesses. Exit: regression tests and screenshots show usable controls above system gestures.
3. Produce responsive Duo comps for Decklists, Cards, and Rules. Exit: browsing remains visible beside selected detail; narrow layout and empty selection are specified.
4. Validate relevant tests, native build, and representative screen sizes. Exit: evidence and limitations recorded in permanent docs.

## Human-required steps
Review Duo comps before a broader redesign. A physical-device check and App Store submission remain release steps; this task does not publish a build.

## Validation
Compare before/after screenshots on iPhone 17 Pro Max; check compact phone and Duo dimensions, light/dark modes, search keyboard, and deck detail modes. Unit/integration tests protect navigation and resizing behavior. Run native build and existing test suites.

## Risks and mitigation
- Old React Native/native dependencies may expose SDK build issues: record exact failures, avoid unrelated upgrades.
- Animated card sizes depend on the entire window: size using the content region and verify resize behavior.
- Larger system text and keyboard can invalidate fixed footer estimates: use actual system insets and measured content where practical.
- Existing Rules changes: preserve edits and review integration without replacing the implementation.

## Sources
- https://apps.apple.com/app/id6473052017
- https://itunes.apple.com/lookup?id=6473052017

## Closure: layout corrections and design comps

Implemented navigator-owned safe areas, measured deck detail insets, accessible search-dock layout, keyboard clearance, a 44-point deck-view toggle, and native/Expo entry registration. Added the single-scene native lifecycle needed to launch on the installed iOS 27.1 Duo simulator. No App Store release was submitted.

Interactive Decklists, Cards, and Rules comps are in `docs/layout-comps/`, including compact/wide layouts and light/dark appearance. Native split panes remain follow-up work; the comps are the reviewable design deliverable.

Validation: Release simulator build succeeded; 35 Jest suites / 213 tests passed, with the dedicated E2E command also passing 4 suites / 7 tests (included in the first count). The native Maestro flow passed on iPhone 17 Pro Max / iOS 26.5 and iPhone SE / iOS 17.5, covering search, expansion, deck browsing, grid/list/text detail, and Rules. Duo launch was separately checked on its inner display. Captures and logs are in local `artifacts/layout-review/`.

Permanent guidance was promoted to `README.md`, `docs/ARCHITECTURE.md`, `docs/TESTING.md`, and `docs/ADAPTIVE_LAYOUT.md`. Remaining work: native split-pane integration, fold/rotation and larger-text validation, broader device coverage, physical-device review, and release submission. Existing full-window card animation math remains a constraint for native panes.

### Subsequent implementation
The user approved native execution after reviewing the comps. Native pane integration is now implemented and validated in [native-duo-panes-plan.md](native-duo-panes-plan.md); that plan supersedes the native split-pane follow-up above.
