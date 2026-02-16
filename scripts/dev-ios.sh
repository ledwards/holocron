#!/usr/bin/env bash
set -euo pipefail

SIMULATOR_NAME="${IOS_SIMULATOR:-iPhone 17 Pro}"
PORT="${RCT_METRO_PORT:-8081}"

echo "Starting Expo dev server and opening iOS simulator (preferred: $SIMULATOR_NAME, port: $PORT)"
EXPO_DEV_SERVER_PORT="$PORT" npx expo start --dev-client --ios --port "$PORT"
