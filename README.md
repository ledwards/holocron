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
(Currently not working)
* `xcodebuild clean -workspace ios/holocron.xcworkspace -scheme holocron \
 && xcodebuild archive -workspace ios/holocron.xcworkspace -scheme holocron -archivePath ios/build/holocron.xcarchive -destination 'generic/platform=iOS' \
 && xcodebuild -exportArchive -archivePath ios/build/holocron.xcarchive -exportPath ios/build/ipa -exportOptionsPlist exportOptions.plist \
 && source .env && xcrun altool --upload-app -f ios/build/ipa/holocron.ipa -u $APPLE_USERNAME -p $APP_SPECIFIC_PASSWORD --type ios`

### (Option 2) UI
* `open ios/holocron.xcodeworkspace`
* `Product -> Archive`
* Select `Distribute App` and then `TestFlight Internal Only`
* Go to App Store Connect: [https://appstoreconnect.apple.com/apps] and select `Holocron`, then click the `TestFlight` tab
* Wait for current build to finish processing and click `Manage` next to Missing Compliance
* Answer `No`, click `Start Internal Testing` and then `Save`

## Common Problems
* main.jsbundle is missing or needs rebuild: `npx npm run postinstall`
* reinstall pods: `cd ios && pod cache clean --all && pod install && cd ..`
