# holocron
React Native iOS app for Star Wars CCG card browsing

## Documentation

- Architecture: `docs/ARCHITECTURE.md`
- Testing strategy: `docs/TESTING.md`
- AI/LLM contributor rules: `AGENTS.md`

## Tests

This project uses Jest for unit and component testing.

### Test Organization

The tests are organized by type and component:

- `models/`: Tests for data models (Card, Decklist, Player, etc.)
- `presenters/`: Tests for presenter classes that transform models for view
- `components/`: Tests for React Native UI components
- `lib/`: Tests for utility functions and library code

### Running Tests

To run the tests:

```bash
# Run unit + component tests
npm test

# Run e2e startup/integration tests
npm run test:e2e

# Run rules parser/TOC mapping tests
npm run rules:test

# Run everything
npm run test:all

# Run tests with coverage report
npm run test:unit -- --coverage

# Run specific test file
npm run test:unit -- Card.test.ts

# Run tests in watch mode
npm run test:unit -- --watch
```

### Test Structure

Each test file follows this general pattern:

1. Import the module being tested and its dependencies
2. Mock any external dependencies
3. Create test data
4. Write test cases using Jest's `describe` and `it` functions
5. Make assertions using Jest's `expect` functions

### Mocking Strategy

- React Native components are mocked to avoid native dependencies
- Complex UI components like FastImage are replaced with simpler versions
- Context values are provided directly to components for predictable testing

### Coverage Goals

- Models: 90%+ coverage
- Presenters: 80%+ coverage
- Components: 70%+ coverage
- Utility functions: 80%+ coverage

### Adding New Tests

When adding new functionality to the app:

1. Create corresponding test files following the naming convention `*.test.ts` or `*.test.tsx`
2. Start with simple unit tests for core functionality
3. Add more complex tests for edge cases and integrations
4. Ensure tests are isolated and don't depend on external state

### Troubleshooting

- If tests fail with React Native errors, check the mock implementations
- For UI component tests, ensure all required props are provided
- For context-dependent components, provide test contexts with minimal required values

To run all tests:
`npm run test:all`

## Development

Default workflow (Expo dev client):

```bash
# Start Expo dev server + open iOS simulator
npm run expo:ios
```

If you run another app at the same time, use a fixed port lane:

```bash
# Lane 1
npm run ios:8081

# Lane 2
npm run ios:8082
```

Single-command launch on port 8081:
`npm run dev:ios`

## Rules Document Pipeline

The rules viewer pipeline is split into extraction and generation:

```bash
# 1) Download the official rulebook PDF (kept out of git)
npm run rules:download

# 2) Extract text runs, internal links, and TOC metadata from the official PDF
npm run rules:extract

# 3) Build mobile-ready rules artifacts used by the app
npm run rules:generate
```

For the phase-3 text extraction workflow (multi-pass audit + focused cleanup), run:

```bash
npm run rules:phase3:text
```

To apply optional LLM cleanup on top of extracted artifacts:

```bash
OPENAI_API_KEY=... npm run rules:phase3:text -- --llm-clean
```

Run the text quality gate directly:

```bash
npm run rules:quality-gate
```

Optional flags:
- `--skip-download` reuse the cached local PDF
- `--skip-extract` reuse existing extracted runs
- `--skip-generate` run audit/cleanup analysis without regenerating app artifacts
- `--llm-clean` run LLM post-correction on noisy paragraph blocks (requires `OPENAI_API_KEY`)
- `--changed-pages-only` (with `--llm-clean`) clean only pages listed by focused comparison output
- `--changed-pages=1,2,3` explicitly select pages for LLM cleanup
- `--changed-pages-file=<path>` file containing changed pages (defaults to `scripts/rules/input/focused-compare.json`)
- `--images=<path>` (for `rules:generate`) inject image blocks from a JSON manifest, default `scripts/rules/input/extracted-images.json`

Generated files:

- `src/data/rules/rules.document.json`
- `src/data/rules/rules.index.json`
- `src/data/rules/rules.meta.json`

Note: final rules fidelity requires both text and embedded rulebook images. The pipeline is structured to support image blocks in addition to text blocks.

## Release
* `npx pod-install ios`
* (Optional) try release build with: `npx expo run:ios --configuration Release`
* Generate listing screenshots before store upload:
  * `cp screenshots/devices.example.json screenshots/devices.json` and set simulator/emulator IDs
  * `npm run screenshots:dry-run` (generates flows/report without launching app)
  * `npm run screenshots:release -- --platform both --continue-on-error` (captures iOS + Android)
* run `npm version patch|minor|major`
* (Optional): `npx react-native-version --never-amend`
* (Optional) manually change the marketing version in `ios/holocron.xcodeproj`

### (Option 1) CLI
* `./create-archive.sh`
* `./upload-to-appstore.sh`

### (Option 2) UI
* `open ios/holocron.xcodeworkspace`
* `Product -> Archive`
* Select `Distribute App` and then `TestFlight Internal Only`
* Go to App Store Connect: [https://appstoreconnect.apple.com/apps] and select `Holo`, then click the `TestFlight` tab
* Wait for current build to finish processing and click `Manage` next to Missing Compliance
* Answer `No`, click `Start Internal Testing` and then `Save`

## Common Problems
* main.jsbundle is missing or needs rebuild: `npm run bundle:ios`
* reinstall pods: `cd ios &&  pod cache clean --all && pod install && cd ..`
* Metro port is in use:
  * `kill -9 $(lsof -ti :8081) 2>/dev/null || true`
  * use the alternate lane: `npm run ios:8082`
* screenshot command fails with missing tools:
  * install Maestro CLI (`maestro`) for UI automation
  * iOS capture requires `xcrun simctl`
  * Android capture requires `adb`
