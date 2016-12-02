#!/bin/bash
set -e
cd `dirname $0`/..

echo "Generate API doc..."
documentation build \
  --shallow packages/gl-react/flow/*.js packages/gl-react/src/**.js \
  -c documentation.yml \
  -g --name gl-react \
  -o ./cookbook/API.json -f json
echo "Done."
echo
