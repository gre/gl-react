#!/bin/bash
set -e
cd `dirname $0`/..

cd packages/gl-react
flow --quiet
cd -
