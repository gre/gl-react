#!/bin/bash
set -e
cd `dirname $0`/..

packages=`ls packages`
projs="cookbook cookbook-rn cookbook-exp tests"

for pkg in $packages; do
  echo "Building $pkg..."
  cd packages/$pkg
  npm link
  rm -rf lib &&
  babel --source-maps -d lib src &&
  flow-copy-source -v src lib;
  cd - 1> /dev/null
  echo
done

# until i figure out better, we'll do this!!!
echo "Copying the new builds into projects..."
for pkg in $packages; do
  pack=`npm pack packages/$pkg`
  if [ -z $pack ]; then
    exit 1;
  fi;
  for proj in $projs; do
    mkdir -p ./$proj/node_modules
    node_module=./$proj/node_modules/$pkg/
    if [ -d $node_module ] && [ ! -L $node_module ]; then
      echo "$pkg -> $proj"
      tar -xf $pack -C ./$proj/node_modules &&
      rm -rf $node_module &&
      mv ./$proj/node_modules/package $node_module
    fi
  done
  rm $pack
done
echo "Done."
echo

echo "Generating standalone builds..."
cd packages/gl-react
browserify lib/index.js \
-t [ browserify-shim ] \
--standalone GLReact > gl-react.js
cd -

cd packages/gl-react-dom
npm link gl-react
browserify lib/index.js \
-t [ browserify-shim ] \
--standalone GLReactDOM > gl-react-dom.js
cd -
echo "Done."
echo

./scripts/generate-doc.sh

cd cookbook
npm run generate-examples
cd -
