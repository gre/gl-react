#!/bin/bash
cd `dirname $0`
while read ex
do
  if [ ! -z $ex ] && [ -d $ex ]
  then
    echo "import ${ex}_E from \"./$ex\";";
    echo "import * as ${ex}_m from \"./$ex/meta\";";
    echo "const ${ex}_s = \`";
    cat ./$ex/index.js | sed 's/\\/\\\\/g' | sed 's/\`/\\\`/g';
    echo "\`;";
    echo "export const $ex={ Example: ${ex}_E, source: ${ex}_s, ...${ex}_m };"
  else
    echo "$ex not found" 1>&2;
  fi
done < index.txt;
