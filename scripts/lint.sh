#!/bin/bash
set -e
cd `dirname $0`/..

eslint packages/*/src/
