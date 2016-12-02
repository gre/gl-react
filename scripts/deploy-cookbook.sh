#!/bin/bash
set -e
cd `dirname $0`/..

cd cookbook
npm run build
cp build/index.html build/200.html
surge -p build -d gl-react-cookbook.surge.sh
