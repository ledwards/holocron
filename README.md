# holo
React Native iOS app for Star Wars CCG card browsing

# Test
`npx npm run test`

# Development
`npx react-native start --reset-cache`

# Release
* TODO: Try automating with https://stackoverflow.com/questions/2664885/xcode-build-and-archive-from-command-line
* (Optional) try release build with: `npx react-native run-ios --mode Release`
* run `npm version patch|minor|major`
* (may not be necessary, but if needed): `npx react-native-version --never-amend`
* manually change the marketing version in `holo.xcproj` if desired
* `open ios/holo.xcodeworkspace`
* `Product -> Archive`
* Select `Distribute App` and then `TestFlight Internal Only`
* Go to App Store Connect: [https://appstoreconnect.apple.com/apps] and select `Holo`, then click the `TestFlight` tab
* Wait for current build to finish processing and click `Manage` next to Missing Compliance
* Answer `No`, click `Start Internal Testing` and then `Save`

# Common Problems
* main.jsbundle is missing or needs rebuild: `npx npm run postinstall`
* reinstall pods: `cd ios &&  pod cache clean --all && pod install && cd ..`
