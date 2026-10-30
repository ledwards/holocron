#!/bin/bash
#
# Archives Holocron for the App Store and exports it.
#   ./create-archive.sh           build build/ipa/holocron.ipa
#   ./create-archive.sh --upload  also upload it to App Store Connect (TestFlight)
#
# The version and build number live only in the Xcode project
# (MARKETING_VERSION, CURRENT_PROJECT_VERSION); Info.plist reads them from
# there. --upload bumps the build number first, since App Store Connect never
# takes the same one twice; commit the change. Bump MARKETING_VERSION yourself
# once a version is approved (its train then closes to new builds).
# Uploading uses the Apple account signed in under Xcode > Settings > Accounts.

# Exit on first error
set -e

cd "$(dirname "$0")"

PROJECT=holocron.xcodeproj/project.pbxproj
DESTINATION=export
if [ "$1" == "--upload" ]; then
  DESTINATION=upload
  BUILD=$(sed -n 's/.*CURRENT_PROJECT_VERSION = \([0-9]*\);.*/\1/p' "$PROJECT" | sort -n | tail -1)
  sed -i '' "s/CURRENT_PROJECT_VERSION = [0-9]*;/CURRENT_PROJECT_VERSION = $((BUILD + 1));/" "$PROJECT"
fi
VERSION=$(sed -n 's/.*MARKETING_VERSION = \(.*\);.*/\1/p' "$PROJECT" | head -1)
BUILD=$(sed -n 's/.*CURRENT_PROJECT_VERSION = \([0-9]*\);.*/\1/p' "$PROJECT" | head -1)
echo "Holocron ${VERSION} (${BUILD})"

# Clean up
echo "Cleaning build artifacts..."
rm -rf build DerivedData

# Install pods (CocoaPods needs a UTF-8 locale)
echo "Installing pods..."
LANG=en_US.UTF-8 pod install

# Build archive. Don't pass OTHER_CFLAGS here: a command-line value replaces
# every pod's own flags and breaks ExpoModulesCore ("module 'React' not found").
echo "Building archive..."
xcodebuild clean archive \
  -workspace holocron.xcworkspace \
  -scheme holocron \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath build/holocron.xcarchive \
  -allowProvisioningUpdates \
  CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM=6NW646Y6R5 \
  PRODUCT_BUNDLE_IDENTIFIER="com.ledwards.holocron" \
  ONLY_ACTIVE_ARCH=NO \
  RCT_NO_LAUNCH_PACKAGER=1

# Hermes ships prebuilt without its dSYM; add React Native's published one so
# App Store Connect can symbolicate crashes inside the JS engine.
echo "Adding the Hermes dSYM..."
RN_VERSION=$(node -p "require('../node_modules/react-native/package.json').version")
HERMES_DSYM_URL="https://repo1.maven.org/maven2/com/facebook/react/react-native-artifacts/${RN_VERSION}/react-native-artifacts-${RN_VERSION}-hermes-framework-dSYM-release.tar.gz"
mkdir -p build/hermes-dsym
curl -sfL "$HERMES_DSYM_URL" | tar -xz -C build/hermes-dsym ./iphoneos/hermes.framework.dSYM
cp -R build/hermes-dsym/iphoneos/hermes.framework.dSYM build/holocron.xcarchive/dSYMs/

# Create export options
cat > ExportOptionsSimple.plist << EOL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store-connect</string>
    <key>destination</key>
    <string>${DESTINATION}</string>
    <key>teamID</key>
    <string>6NW646Y6R5</string>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>stripSwiftSymbols</key>
    <true/>
    <key>uploadSymbols</key>
    <true/>
</dict>
</plist>
EOL

# Export archive
echo "Exporting archive (${DESTINATION})..."
xcodebuild -exportArchive \
  -archivePath build/holocron.xcarchive \
  -exportOptionsPlist ExportOptionsSimple.plist \
  -exportPath build/ipa \
  -allowProvisioningUpdates

if [ "$DESTINATION" == "upload" ]; then
  echo "✅ Uploaded to App Store Connect. It appears in TestFlight after processing."
else
  echo "✅ Archive complete. IPA at: $(pwd)/build/ipa/holocron.ipa"
fi
