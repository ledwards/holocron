# Architecture

Holocron is a React Native app for browsing Star Wars CCG cards and decklists.

## Runtime Tooling

- Runtime/tooling is Expo dev client on top of the existing native iOS/Android projects (`expo@50`, `react-native@0.73.6`).
- Development commands:
  - `npm run expo:ios` for default iOS simulator launch
  - `npm run ios:8081` (or `ios:8082`) for fixed-port lanes when running multiple apps

## High-Level Flow

1. `App.tsx` initializes theme, connectivity, and data-loading state.
2. Data is downloaded when online (`src/lib/Download*.ts`).
3. Data is loaded into in-memory models (`src/lib/Load*.ts`).
4. Global contexts provide loaded data and theme to UI.
5. `src/components/navigation/TabNavigation.tsx` renders Cards and Decklists tabs.
6. Rules content is generated offline from the official PDF into app-local JSON artifacts.

## Project Structure

- `src/models`: domain objects and filtering/query logic.
- `src/presenters`: model-to-UI formatting and mapping logic.
- `src/components`: screen and UI components.
- `src/contexts`: global React contexts (cards, decklists, expansions, theme).
- `src/lib`: filesystem/network loading and download helpers.
- `src/lib/rules`: rules parsing contracts, anchor normalization, and TOC mapping logic.
- `src/styles`: theme and component styles.
- `src/constants`: layout, fields, and comparators.
- `scripts/rules`: build-time extraction/generation scripts for the rules pipeline.
- `scripts/screenshots`: release-time automation for App Store + Play Store screenshots.
- `screenshots`: plaintext scenario definitions and sizing/profile requirements.

## Rules Pipeline

1. `scripts/rules/extract-pdf.js` downloads (or reuses cached) official PDF and extracts:
- text runs with coordinates
- internal link annotations
- PDF outline/TOC entries when present
 - (planned) embedded figures/images with placement metadata for faithful in-app reproduction
2. `scripts/rules/phase3-text.js` runs multi-pass text quality processing:
- base audit (`audit-rules.js`)
- focused cleanup passes (`focused-regenerate.js`) at progressively wider thresholds
- final focused audit summary
3. `scripts/rules/generate-rules.js` parses extracted runs into mobile sections, maps TOC entries to in-app anchors, and builds a token index.
4. The app consumes generated artifacts from `src/data/rules`.

### Fidelity Requirement

Rules rendering must preserve linked structure and include rulebook imagery where present. Text-only conversion is not sufficient for the final user experience.

## Design Constraints

- Offline behavior is first-class: app should load local cached data when no connection is available.
- Search/filter correctness matters more than visual polish.
- Theme is context-driven and should stay consistent across tabs/screens.
