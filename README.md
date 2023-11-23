# holo
React Native iOS app for Star Wars CCG card browsing

# Test
`npx npm run test`

# Development
`npx react-native start --reset-cache`

# Release
* `npm i && cd ios && pod install && cd ..`
* (Optional) try release build with: `npx react-native run-ios --mode Release`
* run `npm version patch|minor|major`
* (Optional): `npx react-native-version --never-amend`
* (Optional) manually change the marketing version in `ios/holo.xcodeproj`

## (Option 1) CLI
* `xcodebuild clean -workspace ios/holo.xcworkspace -scheme holo`
* `xcodebuild archive -workspace ios/holo.xcworkspace -scheme holo -archivePath ios/build/holo.xcarchive`
* `xcodebuild -exportArchive -archivePath ios/build/holo.xcarchive -exportPath ios/build/ipa -exportOptionsPlist exportOptions.plist`
* `xcrun altool --upload-app -f ios/build/holo.ipa/holo.ipa -u <APPLE_USERNAME> -p <APPLE_ONE_TIME_PASSWORD> --type ios`

## (Option 2) UI
* `open ios/holo.xcodeworkspace`
* `Product -> Archive`
* Select `Distribute App` and then `TestFlight Internal Only`
* Go to App Store Connect: [https://appstoreconnect.apple.com/apps] and select `Holo`, then click the `TestFlight` tab
* Wait for current build to finish processing and click `Manage` next to Missing Compliance
* Answer `No`, click `Start Internal Testing` and then `Save`

# Common Problems
* main.jsbundle is missing or needs rebuild: `npx npm run postinstall`
* reinstall pods: `cd ios &&  pod cache clean --all && pod install && cd ..`
