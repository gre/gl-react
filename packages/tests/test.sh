#!/bin/bash
cd `dirname $0`

# $1 is an opportunity to give -u

for f in __tests__/*.js; do
  jest $f $1
done