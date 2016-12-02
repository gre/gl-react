#!/bin/bash
cd `dirname $0`

rm -rf node_modules_to_test
mkdir node_modules_to_test
cp -R node_modules/gl-react node_modules_to_test/gl-react
rm node_modules_to_test/gl-react/package.json
echo 'module.exports=require("./src")' > node_modules_to_test/gl-react/index.js

# $1 is an opportunity to give -u

jest $1 &&
./flow/test.sh $1
