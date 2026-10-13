# Architecture

Holocron is a React Native app that runs with Expo dev client tooling on top of native iOS/Android projects.

## Runtime Model
- App entrypoint: `index.js` via Expo `registerRootComponent`.
- Main app shell: `App.tsx`.
- Navigation: `src/components/navigation/TabNavigation.tsx`.
- Data loading/downloads: `src/lib/Load*.ts` and `src/lib/Download*.ts`.
- Shared state: React contexts under `src/contexts`.

## Dev Runtime
- Default run: `npm run expo:ios`.
- Isolated run lane: `npm run ios:8082` (use when another app owns `8081`).
- Native rebuild/install: `npm run ios`.

## Project Layout
- `src/models`: domain and filtering logic.
- `src/presenters`: model-to-view transformations.
- `src/components`: UI screens/components.
- `src/lib`: data IO and helper utilities.
- `src/lib/rules`: rules parser/index/search pipeline code.
- `src/data/rules`: generated rules artifacts consumed by the app.
- `scripts/rules`: build-time rules extraction/generation scripts.
- `scripts/screenshots`: screenshot automation scripts.

## Rules Content Pipeline
1. Extract source spans, font traits, columns, headings, lists, and diagrams with PyMuPDF (`rules:extract`).
2. Generate native artifacts and index from exact block text (`rules:generate`); bypass legacy word-repair passes.
3. Consume `pdf-spans-v1` JSON from `src/data/rules`, preserving source spans and heading levels in the existing native reader. See [rules extraction](RULES_EXTRACTION.md).

Rules pages use measured per-page heights and stable placeholders for unmeasured pages. Long jumps seed rendering at the destination and correct the offset until that page is visible, avoiding a document-wide moving average that can land on another page. Width changes invalidate measured heights. Source figures use their natural aspect ratio without a minimum height that could force them wider than the reader.

## Design Constraints
- Offline-first behavior for cached content.
- Correct search/filter behavior takes precedence over cosmetic changes.
- Theme behavior must stay consistent across tabs and screens.

## Adaptive iOS Layout
Navigation reports the actual compact icon-bar height to content; horizontal/top safe areas come from the screen wrappers. Headerless Rules gets top safe-area protection in the navigation wrapper; deck detail screens use measured navigator heights. Search docks keep content in normal flow inside an anchored keyboard-avoiding wrapper. See [adaptive layout guidance](ADAPTIVE_LAYOUT.md).

`index.js` registers both Expo's `main` and the existing native `holocron` entry. The iOS app uses a single `UIWindowScene`, attaching the React Native-created window in `HolocronSceneDelegate` to support iOS 27 lifecycle requirements.

`AdaptiveWorkspace` owns measured compact/wide layout and keeps the browser and detail mounted. Selection belongs above pane visibility changes. `CardArtwork` fits intrinsic source dimensions into measured bounds, including rotated site cards. `AdaptiveDeckDetail` embeds the original deck views; grid sizing uses measured pane width. The existing single mode icon and Back chevron stay in the navigation header. Rules keeps its full document mounted alongside the search browser. Compact devices show either the browser or reader; wide devices show both. Search updates as text changes, selecting a result dismisses the keyboard, and the reader uses an in-flow icon toolbar for matching-page navigation. Contents remains unfiltered by the active query.

## Card startup state
`CardDataStatusContext` distinguishes loading, ready, and unavailable data. Startup reads cached/bundled cards first and refreshes online in the background. An empty cache remains in loading until connectivity and any online refresh finish; failed refreshes retain usable cards. Cancelled loads cannot replace a newer connection state. The Cards screen shows a spinner during loading and never infers an internet failure from an empty array. Card-title examples use the same search callback and controlled input as typed queries.
