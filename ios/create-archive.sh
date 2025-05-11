#!/bin/bash

# Exit on first error
set -e

cd "$(dirname "$0")"

# Clean up
echo "Cleaning build artifacts..."
rm -rf build DerivedData
rm -rf Pods/Podfile.lock 

# Install pods
echo "Installing pods..."
pod install

# Build archive
echo "Building archive..."
xcodebuild clean archive \
  -workspace holocron.xcworkspace \
  -scheme holocron \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath build/holocron.xcarchive \
  CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM=6NW646Y6R5 \
  PRODUCT_BUNDLE_IDENTIFIER="com.ledwards.holocron" \
  CURRENT_PROJECT_VERSION=4 \
  MARKETING_VERSION=1.1.0 \
  ONLY_ACTIVE_ARCH=NO \
  OTHER_CFLAGS="-DNS_BLOCK_ASSERTIONS=1" \
  RCT_NO_LAUNCH_PACKAGER=1

# Create export options
cat > ExportOptionsSimple.plist << EOL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>6NW646Y6R5</string>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>stripSwiftSymbols</key>
    <true/>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
</dict>
</plist>
EOL

# Export archive
echo "Exporting archive to IPA..."
xcodebuild -exportArchive \
  -archivePath build/holocron.xcarchive \
  -exportOptionsPlist ExportOptionsSimple.plist \
  -exportPath build/ipa \
  -allowProvisioningUpdates

echo "✅ Archive complete. IPA at: $(pwd)/build/ipa/holocron.ipa"