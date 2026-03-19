#!/bin/bash

set -e
cd $(dirname $0)/..

export BABEL_ENV=production

for d in ./packages/gl-react*; do
  cd $d
  rm -rf lib
  babel --root-mode upward --source-maps --extensions '.ts,.tsx' -d lib src
  cd - 1> /dev/null
done

# Generate TypeScript declaration files
tsc -b --emitDeclarationOnly
