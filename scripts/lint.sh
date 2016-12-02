#!/bin/bash
set -e
cd `dirname $0`/..

eslint packages/gl-react/src/
eslint packages/gl-react-dom/src/
eslint packages/gl-react-native/src/
eslint packages/gl-react-headless/src/
