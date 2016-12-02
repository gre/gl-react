#!/bin/bash
set -e
cd `dirname $0`/..

packages=`ls packages`
projs="cookbook cookbook-rn tests"

rm -rf node_modules/
for pkg in $packages; do
  toRm=packages/$pkg/node_modules/
  if [ -d $toRm ]; then
    rm -rf $toRm;
  fi
done
for proj in $projs; do
  toRm=$proj/node_modules/
  if [ -d $toRm ]; then
    rm -rf $toRm;
  fi
done
