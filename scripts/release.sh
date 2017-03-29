#!/bin/bash
set -e
cd `dirname $0`/..

for pkg in packages/*/; do
  echo "Publishing $pkg..."
  cd $pkg;
  npm publish --tag=next
  cd -;
done;

npm run deploy-cookbook
