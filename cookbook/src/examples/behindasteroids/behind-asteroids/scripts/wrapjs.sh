#!/bin/bash

# usage: cat glslfile | ./wrapjs.sh varname

echo -n "var $1 ='"
perl -p -e 's/\n/\\n/';
echo -ne "';"
