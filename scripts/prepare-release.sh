#!/bin/bash
set -e
cd `dirname $0`/..

v=$1

if [ -z $v ]; then
  echo "Usage: $0 <exact_version>" 1>&2;
  exit 1;
fi;

echo "Setting cookbook version..."
cd cookbook
npm version $v
cd -

for pkg in packages/*/; do
  echo "Setting $pkg version..."
  cd $pkg;
  npm version $v
  cd -;
done;

npm run build
npm run flow
npm run test

echo "If you are happy with these changes, commit 'Prepare $v' and run:"
echo
echo "npm version $v && git push && git push --tags"
echo
echo "and publish each library"
