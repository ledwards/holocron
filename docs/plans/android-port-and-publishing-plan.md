# Android Port and Google Play Publishing Plan

## Current Snapshot (from this repo)

- Android project already exists, so this is a stabilization/release effort, not a fresh port.
- `react-native-vector-icons` is already wired for Android fonts; `Ionicons` concern is likely fine (`android/app/build.gradle`, `react-native.config.js`).
- Biggest blocker right now is Android compile failure from dependency mismatch: `BaseReactPackage` unresolved in `safe-area-context`, `gesture-handler`, `screens` during `./gradlew assembleDebug`.
- App is on `react-native 0.73.2` (`package.json`) with newer nav/native libs.
- Android SDK targets are still 33 (`android/build.gradle`), which is below current Play submission requirement.
- Release build is currently signed with debug keystore (`android/app/build.gradle`), which must be fixed before publishing.

## Detailed Plan To Port + Ship on Google Play

## 1. Unblock Android Build (critical path)

- Decide strategy:
  1. Upgrade React Native to a version compatible with current native libs.
  2. Or pin/downgrade native libs (`screens`, `gesture-handler`, `safe-area-context`) to RN 0.73-compatible versions.
- Recommendation: prefer RN upgrade path unless zero-risk short-term is needed.
- Exit criteria: `cd android && ./gradlew assembleDebug` passes.

## 2. Tooling + Device Runtime Setup

- Ensure emulator/device path works end-to-end:
  1. Start emulator from Android Studio Device Manager (or connect physical phone with USB debugging).
  2. Confirm `adb devices` shows at least one target.
  3. Run `npm run android`.
- Fix local ADB daemon permission/start issues before moving on.

## 3. Android UX/Behavior Parity Pass

- Validate every screen on Android for:
  1. Blur surfaces (`@react-native-community/blur`) render acceptably and perform well.
  2. Safe area/layout/status bar correctness.
  3. Font/icon rendering for all icon sets in use.
  4. Keyboard, navigation transitions, and list performance.
- Add Android-specific fallback styling where blur or visual effects look weak.
- Exit criteria: no P1/P2 visual or navigation regressions on at least one emulator and one physical device.

## 4. Release Hardening in Android Gradle

- Update SDK levels:
  1. Set `compileSdkVersion` and `targetSdkVersion` to current Play requirement baseline.
- Configure real release signing:
  1. Generate upload keystore.
  2. Add `signingConfigs.release` via gradle properties/env vars.
  3. Switch release signing off debug key.
- Turn on and verify minification/resource shrinking if desired (`minifyEnabled`, R8/proguard rules) and test thoroughly.
- Exit criteria: `./gradlew bundleRelease` succeeds and produces `.aab`.

## 5. Play Console Account + Compliance Setup (human-required)

- Create/verify Play developer account.
- Complete app setup and **App content** declarations:
  1. Privacy policy URL.
  2. Ads declaration.
  3. App access instructions (if login-gated areas exist).
  4. Target audience/content and content rating.
  5. Data safety form.
  6. Any sensitive-permission declarations if applicable.
- Prepare store listing assets/text, support contact, category.

## 6. Testing Tracks + Production Eligibility (human-required)

- Run internal test first for fast sanity.
- Run closed testing track with real testers.
- If account is a **personal account created after November 13, 2023**, meet current production-access testing requirements before production.
- Collect feedback, fix issues, then apply for production access in Play Console when eligible.

## 7. Production Rollout

- Upload signed `.aab` to production track.
- Use staged rollout (for example 5% -> 20% -> 50% -> 100%) while monitoring crashes/ANRs/reviews.
- Keep rollback plan: previous production artifact ready.

## 8. Post-Launch Operations

- Set routine update cadence for target API deadlines, RN updates, and policy changes.
- Monitor Android vitals, crash-free users, startup time, ANRs, store conversion.
- Add Android release section to docs (README is currently iOS-centric).

## Human Checklist (Play Store)

- Legal/business:
  1. Developer account identity/verification complete.
  2. Privacy policy published and accurate.
  3. Support email set.
- Listing:
  1. Final app title/short + full description.
  2. Screenshots + feature graphic.
  3. Category + tags.
- Policy:
  1. App content forms complete.
  2. Data safety complete.
  3. Ads + audience declarations correct.
- Release:
  1. Closed testing done.
  2. Production access approved (if required).
  3. Staged rollout plan ready.

## Suggested Execution Order (this week)

1. Fix dependency/RN mismatch until `assembleDebug` passes.
2. Get emulator/physical-device run path stable.
3. Add release signing + produce first `.aab`.
4. Create Play Console app + complete App content.
5. Start closed test and gather feedback.

## Sources

- [Google Play target API requirement](https://developer.android.com/google/play/requirements/target-sdk)
- [App testing requirements for new personal accounts](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
- [Set up internal/closed/open testing tracks](https://support.google.com/googleplay/android-developer/answer/9845334)
- [Prepare your app for review (App content)](https://support.google.com/googleplay/android-developer/answer/9859455)
- [Android app signing + Play App Signing](https://developer.android.com/guide/publishing/app-signing.html)
- [React Native: Publishing to Google Play Store](https://reactnative.dev/docs/signed-apk-android.html)
