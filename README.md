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
```bash
npm run rules:download
npm run rules:extract
npm run rules:generate
npm run rules:phase3:text
npm run rules:quality-gate
```

Generated files:
- `src/data/rules/rules.document.json`
- `src/data/rules/rules.index.json`
- `src/data/rules/rules.meta.json`

## Release (iOS)
```bash
npx pod-install ios
npx expo run:ios --configuration Release
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
