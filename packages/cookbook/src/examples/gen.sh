#!/bin/bash
cd `dirname $0`
for d in */; do
  out=$d/index.source.js
  echo -n module.exports=\` > $out
  cat ./$d/index.js | sed -e 's/\\/\\\\/g' | sed -e 's/\`/\\\`/g' >> $out
  echo \` >> $out
done
