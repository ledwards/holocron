# holocron
React Native iOS app for Star Wars CCG card browsing

## Test
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
