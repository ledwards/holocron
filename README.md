# holocron
React Native iOS app for Star Wars CCG card browsing

## Test

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
# Run all tests
npm test

# Run tests with coverage report
npm test -- --coverage

# Run specific test file
npm test -- Card.test.ts

# Run tests in watch mode
npm test -- --watch
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
`npx npm run test`

## Development
`npx react-native start --reset-cache`

## Release
* `npx pod-install ios`
* (Optional) try release build with: `npx react-native run-ios --mode Release`
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
* main.jsbundle is missing or needs rebuild: `npx npm run postinstall`
* reinstall pods: `cd ios &&  pod cache clean --all && pod install && cd ..`
