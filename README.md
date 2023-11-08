# holo
React Native iOS app for Star Wars CCG card browsing

# Test
`npx npm run test`

# Development
`npx react-native run-ios --mode Release` # only mode that works

# Release
* manually change version number every place it appears
* `open ios/holo.xcodeworkspace`
* `Product -> Archive`
* Select `Distribute App` and then `TestFlight Internal Only`
* Go to App Store Connect: [https://appstoreconnect.apple.com/apps] and select `Holo`, then click the `TestFlight` tab
* Wait for current build to finish processing and click `Manage` next to Missing Compliance
* Answer `No`, click `Start Internal Testing` and then `Save`

# Common Problems
* main.jsbundle is missing or needs rebuild: `npx npm run postinstall`
* reinstall pods: `cd ios &&  pod cache clean --all && pod install && cd ..`
