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
1. Extract source document data (`rules:extract`).
2. Generate normalized app artifacts (`rules:generate`).
3. Consume generated JSON from `src/data/rules` at runtime.

## Design Constraints
- Offline-first behavior for cached content.
- Correct search/filter behavior takes precedence over cosmetic changes.
- Theme behavior must stay consistent across tabs and screens.
