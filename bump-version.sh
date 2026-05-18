#!/usr/bin/env bash
set -euo pipefail

NEW_VERSION="${1:-}"
if [ -z "$NEW_VERSION" ]; then
  echo "Usage: ./bump-version.sh <new-version>"
  echo "Example: ./bump-version.sh 0.3.0"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Update root package.json (Plasmo extension)
node -e "
  const fs = require('fs');
  const p = '$ROOT/package.json';
  const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
  pkg.version = '$NEW_VERSION';
  fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n');
"

# Update website/package.json
node -e "
  const fs = require('fs');
  const p = '$ROOT/website/package.json';
  const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
  pkg.version = '$NEW_VERSION';
  fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n');
"

# Update lib/version.ts (extension popup)
sed -i '' "s/^export const VERSION = \".*\";/export const VERSION = \"$NEW_VERSION\";/" \
  "$ROOT/lib/version.ts"

# Update website/src/lib/version.ts (website UI)
sed -i '' "s/^export const VERSION = \".*\";/export const VERSION = \"$NEW_VERSION\";/" \
  "$ROOT/website/src/lib/version.ts"

# Update contents/bridge.ts (MAIN-world content script)
sed -i '' "s/^export const VERSION = \".*\";/export const VERSION = \"$NEW_VERSION\";/" \
  "$ROOT/contents/bridge.ts"

echo "✓ Bumped to v$NEW_VERSION"
echo "  → package.json"
echo "  → website/package.json"
echo "  → lib/version.ts"
echo "  → website/src/lib/version.ts"
echo "  → contents/bridge.ts"
