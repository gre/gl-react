#!/bin/bash
echo "// This file is generated. DO NOT MODIFY"
cd $(dirname $0)
while read ex
do
  if [ ! -z $ex ] && [ -d $ex ]
  then
    echo "import ${ex}_E from './$ex';";
    echo "import * as ${ex}_m from './$ex/meta';";
    echo "export const $ex={ Main: ${ex}_E, ...${ex}_m };"
  elif [ ! -z _TODO_$ex ] && [ -d _TODO_$ex ]
  then
    echo "import * as ${ex}_m from './_TODO_$ex/meta';";
    echo "export const $ex={ Main: null, ...${ex}_m };"
  else
    echo "$ex not found" 1>&2;
  fi
done < index.txt;
