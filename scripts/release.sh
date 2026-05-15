#!/bin/bash
set -e

VERSION=$1
if [ -z "$VERSION" ]; then
  echo "Usage: $0 <version>"
  echo "Example: $0 5.3.0"
  exit 1
fi

cd "$(dirname "$0")/.."

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Error: working tree has uncommitted changes. Please commit or stash them first."
  exit 1
fi

PACKAGES="packages/gl-react packages/gl-react-dom packages/gl-react-expo packages/gl-react-headless packages/gl-react-native"

for pkg in $PACKAGES; do
  node -e "
    const fs = require('fs');
    const p = '$pkg/package.json';
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    d.version = '$VERSION';
    ['dependencies', 'devDependencies'].forEach(section => {
      if (d[section]) {
        if (d[section]['gl-react']) d[section]['gl-react'] = '^$VERSION';
        if (d[section]['gl-react-expo']) d[section]['gl-react-expo'] = '^$VERSION';
      }
    });
    fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
  "
  echo "Bumped $pkg to $VERSION"
done

yarn install
git add packages/gl-react/package.json packages/gl-react-dom/package.json packages/gl-react-expo/package.json packages/gl-react-headless/package.json packages/gl-react-native/package.json yarn.lock
git commit -m "chore: release $VERSION"
git tag "v$VERSION"

echo ""
echo "Done. Now push to trigger the publish workflow:"
echo "  git push && git push --tags"
