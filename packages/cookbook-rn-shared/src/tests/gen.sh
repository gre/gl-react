#!/bin/bash
echo "// This file is generated. DO NOT MODIFY"
while read t
do
  if [ ! -z $t ] && [ -d $t ]
  then
    echo "import ${t}_E from './$t';";
    echo "import * as ${t}_m from './$t/meta';";
    echo "export const $t={ Main: ${t}_E, ...${t}_m };"
  elif [ ! -z _TODO_$t ] && [ -d _TODO_$t ]
  then
    echo "import * as ${t}_m from './_TODO_$t/meta';";
    echo "export const $t={ Main: null, ...${t}_m };"
  else
    echo "$t not found" 1>&2;
  fi
done < index.txt;
