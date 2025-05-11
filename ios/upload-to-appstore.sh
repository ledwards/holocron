#!/bin/bash

# Exit on first error
set -e

# Current directory where script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Path to the root directory (parent of ios)
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Path to the .env file in the root directory
ENV_FILE="${ROOT_DIR}/.env"

# Path to the IPA file
IPA_FILE="build/ipa/holocron.ipa"

# Check if IPA file exists
if [ ! -f "$IPA_FILE" ]; then
  echo "❌ Error: IPA file not found at $IPA_FILE"
  echo "Please run the build script first to generate the IPA file."
  exit 1
fi

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Error: .env file not found at $ENV_FILE"
  echo "Please create a .env file with APPLE_USERNAME and APP_SPECIFIC_PASSWORD variables."
  exit 1
fi

# Load environment variables from .env file
echo "Loading environment variables from $ENV_FILE..."
source "$ENV_FILE"

# Check for required environment variables
if [ -z "$APPLE_USERNAME" ]; then
  echo "❌ Error: APPLE_USERNAME is not set in .env file"
  echo "Please add your Apple ID to the .env file: APPLE_USERNAME=your-apple-id@example.com"
  exit 1
fi

if [ -z "$APP_SPECIFIC_PASSWORD" ]; then
  echo "❌ Error: APP_SPECIFIC_PASSWORD is not set in .env file"
  echo "Please generate an app-specific password at https://appleid.apple.com and add it to the .env file: APP_SPECIFIC_PASSWORD=your-app-specific-password"
  exit 1
fi

# Upload the IPA file to App Store Connect
echo "Uploading IPA to App Store Connect..."
echo "Using Apple ID: $APPLE_USERNAME"
echo "IPA file: $IPA_FILE"

xcrun altool --upload-app -f "$IPA_FILE" -t ios -u "$APPLE_USERNAME" -p "$APP_SPECIFIC_PASSWORD"

echo "✅ Upload process completed!"
echo "Note: It may take some time for the build to appear in App Store Connect/TestFlight."
echo "You can check the status at https://appstoreconnect.apple.com"
echo "Remember to check compliance and review the build before releasing it."
