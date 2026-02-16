# Expo Dev-Client Migration Plan (holocron)

> Historical planning document. Current shipped runtime is Expo dev client (`expo@50`) with lane-based commands documented in `README.md`.

## 1. Current Snapshot

- App is a React Native CLI app (`react-native@0.73.2`) with custom scripts and simulator-specific workflows.
- Dev flow currently mixes multiple launch methods (`react-native start`, `run-ios`, custom scripts), causing frequent Metro/port mismatch.
- Team is concurrently running another Expo app, increasing likelihood of port/bundler cross-talk.
- Existing iOS/Android native projects must be preserved.

Known blockers:
- npm dependency resolution requires `--legacy-peer-deps` due an unrelated `react-scripts` + TypeScript peer conflict.

## 2. Goal And Scope

### Goal

Adopt Expo tooling for this repo so the default development flow is Expo dev-client based and consistent with the other app.

### In scope

- Add Expo runtime/tooling packages compatible with RN 0.73.
- Update Metro/Babel configuration for Expo.
- Add Expo app config fields required for dev client.
- Update npm scripts to expose a clear Expo-first workflow on pinned ports.
- Update README/developer docs to describe the new default run path.

### Out of scope

- Full Expo Router rewrite.
- Feature-level UI refactors.
- Native module replacement/removal.

## 3. Ordered Execution Phases

### Phase 1: Tooling bootstrap

- Install Expo packages compatible with current RN version.
- Add/adjust config files (`app.json`, `babel.config.js`, `metro.config.js`).

Exit criteria:
- `npx expo config --json` succeeds.

### Phase 2: Script and workflow unification

- Add Expo-centric scripts for Metro + iOS run with fixed ports.
- Keep legacy RN scripts available as fallback during transition.

Exit criteria:
- Script list clearly separates Expo flow and legacy flow.

### Phase 3: Validation

- Validate Expo config.
- Run unit tests relevant to app bootstrap/navigation.
- Smoke-check iOS launch command path command-level (build invocation).

Exit criteria:
- Config validation passes and tests pass.

### Phase 4: Documentation promotion

- Update `README.md` with default Expo workflow and porting guidance.
- Update `docs/ARCHITECTURE.md` for build/runtime architecture changes.
- Update `docs/TESTING.md` if test/run commands changed.

Exit criteria:
- Permanent docs reflect shipped workflow.

## 4. Human-Required Steps

- Install Xcode CLI tools/CocoaPods if missing.
- First launch after migration may require one clean rebuild of iOS app.
- If both apps run simultaneously, developer chooses distinct ports.

## 5. Validation Strategy

- `npx expo config --json`
- `npm run test:unit -- --watchman=false`
- `npm run test:e2e -- --watchman=false` (if environment supports)
- Manual smoke: start Metro + run iOS via Expo scripts.

## 6. Risks/Open Questions

- Expo SDK/RN compatibility drift if versions are misaligned.
  - Mitigation: pin Expo SDK matching RN 0.73 line.
- Existing native packages may need additional Expo plugin config.
  - Mitigation: keep current native projects and fallback RN scripts.
- Peer dependency noise from unrelated web deps (`react-scripts`).
  - Mitigation: use `--legacy-peer-deps` for now and keep changes scoped.

## 7. Source Links

- Expo install for existing RN apps: https://docs.expo.dev/bare/installing-expo-modules/
- Expo SDK compatibility guidance: https://docs.expo.dev/versions/latest/

## Closure Note

1. What shipped
- Expo modules were integrated for iOS/Android native projects.
- Runtime tooling now uses Expo dev client by default.
- Lane-based iOS commands (`ios:8081|ios:8082`) are available for multi-app development on one machine.

2. Permanent docs updated
- `README.md` documents a simplified Expo-first quick start and isolated simulator workflow.
- `docs/ARCHITECTURE.md` reflects Expo dev-client runtime/tooling.
- `docs/TESTING.md` runtime notes now reference Expo commands.

3. Follow-up work that remains
- Reduce residual peer-dependency friction from legacy `react-scripts` usage.
