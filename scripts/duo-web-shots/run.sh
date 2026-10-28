#!/usr/bin/env bash
# Render Holocron's real UI in Chromium at iPhone Duo sizes and poses.
#
#   scripts/duo-web-shots/run.sh [OUT_DIR]              # this checkout
#   BEFORE_REF=<git ref> scripts/duo-web-shots/run.sh   # also render <ref>, for before/after pairs
#   REAL_ART=1 ...                                      # load card art from res.starwarsccg.org
#
# Builds a web bundle in a TEMPORARY copy of the repo, with react-native-web
# installed there only (the app's package.json is untouched), stand-ins for
# native modules (shims/), and iPhone Duo safe-area insets and fold supplied
# per scene. These are web renders of the app's components, not iOS
# screenshots: verify on the iPhone Duo simulator before release.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
OUT="${1:-$REPO/artifacts/duo-web-shots}"
WORK="$(mktemp -d)"
SERVERS=()
cleanup() { for pid in "${SERVERS[@]:-}"; do kill "$pid" 2>/dev/null || true; done; rm -rf "$WORK"; }
trap cleanup EXIT

# build NAME SOURCE_TREE_COMMAND: prepare $WORK/NAME and export its web bundle
build() {
  local name="$1" dir="$WORK/$1"
  mkdir -p "$dir"
  (cd "$REPO" && tar --exclude=./.git --exclude=./.jest-cache --exclude=./coverage --exclude=./artifacts -cf - .) | (cd "$dir" && tar -xf -)
  if [ "$name" = before ]; then
    rm -rf "$dir/src" "$dir/App.tsx"
    (cd "$REPO" && git archive "$BEFORE_REF" src App.tsx) | tar -x -C "$dir"
  fi
  mkdir -p "$dir/shots/data"
  cp -r "$HERE/shims" "$dir/shots/shims"
  cp "$HERE/entry.js" "$dir/shots/entry.js"
  cp "$HERE/metro.config.js" "$dir/metro.config.js"
  echo "import './shots/entry';" > "$dir/index.js"
  python3 "$HERE/make-data.py" "$dir"
  (cd "$dir" && npm install --no-save --legacy-peer-deps --no-audit --no-fund --loglevel=error \
      react-native-web@0.19.10 react-dom@18.2.0 @expo/metro-runtime@3.1.3 >/dev/null)
  (cd "$dir" && CI=1 npx expo export --platform web --output-dir shots/dist >"$WORK/$name-export.log" 2>&1) \
    || { tail -30 "$WORK/$name-export.log"; exit 1; }
}

# serve NAME PORT, then shoot into OUT_SUBDIR
shoot() {
  local name="$1" port="$2" dest="$3" only="${4:-}"
  (cd "$WORK/$name/shots/dist" && exec python3 -m http.server "$port" --bind 127.0.0.1 >/dev/null 2>&1) &
  SERVERS+=("$!")
  sleep 1
  (cd "$HERE" && node shoot.js "$dest" "http://127.0.0.1:$port/" $only)
}

mkdir -p "$OUT"
build after
shoot after 8790 "$OUT/raw"
if [ -n "${BEFORE_REF:-}" ]; then
  build before
  shoot before 8791 "$OUT/before" 01-closed-cards-search,02-closed-deck-gallery,04-closed-landscape-cards,10-book-cards,13-table-cards
  python3 "$HERE/frame.py" "$OUT/raw" "$OUT" "$OUT/before"
else
  python3 "$HERE/frame.py" "$OUT/raw" "$OUT"
fi
