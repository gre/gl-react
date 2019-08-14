#!/bin/bash

set -e
cd $(dirname $0)/..

for d in ./packages/gl-react*; do
  cd $d
  rm -rf lib
  babel --root-mode upward --watch --source-maps -d lib src &
  cd - 1> /dev/null
done

wait