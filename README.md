# holocron
Star Wars CCG browser app built with React Native + Expo dev client.

## Documentation
- Architecture: `docs/ARCHITECTURE.md`
- Testing: `docs/TESTING.md`
- AI/LLM contributor rules: `AGENTS.md`

## Quick Start (iOS)
1. Install dependencies:
```bash
npm install --legacy-peer-deps
```
2. Install iOS pods:
```bash
npx pod-install ios
```
3. Build/install the dev client once:
```bash
npm run ios
```
4. Daily development run:
```bash
npm run expo:ios
```

## Isolated Simulator Setup (recommended if you run another app)
Use a dedicated simulator and dedicated Metro port for Holocron.

1. Create a dedicated simulator once (example):
```bash
xcrun simctl create "Holocron Expo" "com.apple.CoreSimulator.SimDeviceType.iPhone-17-Pro-Max" "com.apple.CoreSimulator.SimRuntime.iOS-26-2"
```
2. Boot it:
```bash
xcrun simctl boot "Holocron Expo"
open -a Simulator
```
3. Install Holocron into that simulator:
```bash
npx expo run:ios --device "Holocron Expo" --no-bundler
```
4. Run Holocron on its own lane:
```bash
npm run ios:8082
```

If your other app uses `8081`, keep Holocron on `8082`.

## Development Commands
```bash
npm run expo:start         # Start Expo dev server (dev client)
npm run expo:start:clear   # Start Expo dev server with cleared cache
npm run expo:ios           # Start Expo + open iOS simulator
npm run ios:8081           # iOS on port 8081
npm run ios:8082           # iOS on port 8082
npm run dev:ios            # Convenience wrapper for iOS launch flow
```

## Test Commands
```bash
npm run test:unit
npm run test:e2e
npm run rules:test
npm run test:all
```

## Rules Pipeline
The current extractor follows Wayfinder iOS's PyMuPDF span approach, adapted to the SWCCG rulebook's two-column layout. It preserves source headings, bold/italic spans, bullets, diagrams, and maintenance symbols; it does not use LLM text rewriting.

```bash
python3 -m pip install -r scripts/rules/requirements.txt
npm run rules:download
npm run rules:extract
npm run rules:generate
npm run rules:test:extraction
npm run rules:test
npm run rules:quality-gate
```

Extraction writes `scripts/rules/input/structured.document.json` and a per-page coverage report. Generation writes `src/data/rules/rules.document.json`, `rules.index.json`, and `rules.meta.json`. Only generated app artifacts are committed; the downloaded PDF and intermediate extraction files stay local.

The old PDF.js extraction and heuristic regeneration remain available as `rules:extract:legacy` and `rules:generate:legacy` for investigation. `rules:phase3:text` also belongs to the legacy pipeline; do not run it on the structured artifact. See [rules extraction](docs/RULES_EXTRACTION.md) for the source checks and update workflow.

## Release (iOS)
```bash
npx pod-install ios
npx expo run:ios --configuration Release
```

TestFlight: bump `MARKETING_VERSION`/`CURRENT_PROJECT_VERSION` in the Xcode project and `CFBundleShortVersionString`/`CFBundleVersion` in `ios/holocron/Info.plist` (a version App Store Connect has already approved is closed to new builds), sign in under Xcode > Settings > Accounts, then:
```bash
ios/create-archive.sh --upload
```

Optional screenshot automation:
```bash
cp screenshots/devices.example.json screenshots/devices.json
npm run screenshots:dry-run
npm run screenshots:release -- --platform both --continue-on-error
```

## Troubleshooting
- Port conflict:
```bash
kill -9 $(lsof -ti :8081) 2>/dev/null || true
kill -9 $(lsof -ti :8082) 2>/dev/null || true
```
- Reinstall pods:
```bash
cd ios && pod cache clean --all && pod install && cd ..
```

## Adaptive Layout and Duo
This repository ships **SW:CCG Holocron** (`com.ledwards.holocron`, App Store ID `6473052017`).

The interactive Duo design preview covers Cards, Decklists, and Rules in light/dark and compact/wide layouts:
```bash
python3 -m http.server 8769 --bind 127.0.0.1 --directory docs/layout-comps
```
Open `http://127.0.0.1:8769` for the original design comps. The native app now uses adaptive browsing/detail panes for Cards, Decklists, and Rules, with compact navigation on narrower screens. See [layout ownership and compatibility guidance](docs/ADAPTIVE_LAYOUT.md).
