#!/bin/bash

set -e
cd $(dirname $0)/..

export BABEL_ENV=production

for d in ./packages/gl-react*; do
  cd $d
  rm -rf lib
  babel --root-mode upward --source-maps -d lib src
  flow-copy-source src lib
  cd - 1> /dev/null
done

lerna run build