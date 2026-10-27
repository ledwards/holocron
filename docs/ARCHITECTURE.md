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

### Card identity and query values

`Card.id` (upstream `gempId`) is the identity the app keys on: list rows, selection, decklist lookups. Upstream does not keep it unique — alternate-image printings (`(AI)`, `(Holo AI)`, and since late 2026 `(ALT)`) and some title variants (`Fanfare (Tatooine) (V)` / `Fanfare (V)`) reuse the original card's id. `loadCardDefinitions` therefore drops alternate-image rows by title and then collapses to one card per id (`onePrintingPerId`, preferring the title with the fewest qualifiers), logging how many it collapsed. Duplicate ids reached the list once and produced repeated rows and stale results from earlier searches; do not key a card list on anything else, and do not let a second loader bypass this step.

Natural-language query values are taken literally. Only fields declared with a `valueAlias` in `src/constants/fields.ts` — card-name fields (`title`, `matching`, `pulls`, `cancels`, …) and `set` — may have their value rewritten, and only when the typed value matches a card nickname or set abbreviation exactly (`AliasResolver`). Resolution used to apply to every non-text field and matched by substring, so `set c premiere` became `set matches "alter premiere v"` and returned nothing; `side = dark`, `icons c pilot`, and `type c effect` failed the same way. `FilterQuery.execute` resolves into a local filter and never mutates the parsed value, so the status bar always shows what was typed.

### Queries typed without spaces

Phone users type `setcpremiere`, not `set c premiere`, so removing every space from a query must not change its results. A clause is FIELD [COMPARATOR] VALUE with optional spaces: the field is the longest field spelling the clause starts with (falling through to the next field when one cannot read the rest, since `m` is both maneuver and matching); the comparator is looked for only directly after the field, never inside the field name (`cancels` contains `nc`) or the value; a field typed with no comparator uses its default (title, type, gametext and lore default to "contains"). Multi-word field and comparator aliases also match without their spaces (`doesnotcontain`).

When a letter comparator runs straight into the value (`setcpremiere`, `rarityc2`) there are two readings. Without cards the explicit comparator wins; `FilterQuerySet(query, cards)` — which the card list uses — prefers a default equality that finds cards, then a default reading that finds everything the explicit one does, then whichever finds cards. A symbol or a spaced word (`title = vader`) is never ambiguous.

Values match exactly first. Only when that finds nothing and the value has no spaces is the match retried with spaces removed from the card text, so `gtcbadfeeling` finds "bad feeling" and a spaced query that already finds cards is never widened (`hand` also occurs in "rough **and**"). Title search mode follows the same rule (`searchCardsByTitle`).

`and` between spaces always joins clauses; `and` inside a word never does. A space-free `and` splits only where every resulting clause is valid, the clause after it starts with a field spelled with two or more letters, and — with cards — each clause finds cards.

Filter runs, alias lookups and normalized card text are cached per card list (card lists are replaced, never mutated), because a keystroke asks the same question several times and the next keystroke asks most of them again.
