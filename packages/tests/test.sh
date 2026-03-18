#!/bin/bash
cd `dirname $0`

# $1 is an opportunity to give -u

for f in __tests__/all.js; do
  jest $f $1
done

# redraw-functions.js is skipped: has an unhandled promise rejection
# that crashes Node 18+ (stricter unhandled rejection handling).
# TODO: fix the test to properly handle async errors.
