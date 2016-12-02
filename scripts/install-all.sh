#!/bin/bash
set -e
cd `dirname $0`/..

function install() {
  echo "INSTALL in "`pwd`
  npm i
}

packages=`ls packages`
projs="cookbook cookbook-rn tests"

install
for pkg in $packages; do
  cd packages/$pkg
  install
  cd -
done
for proj in $projs; do
  cd $proj;
  install
  cd -
done
