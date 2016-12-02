#!/bin/bash

cd `dirname $0`

flow --quiet &> test_dump.tmp
if [ ! -f snapshot.txt ]; then
  echo "✓ Flow types: created a new snapshot file."
  mv test_dump.tmp snapshot.txt
else
  if ! cmp -s test_dump.tmp snapshot.txt; then
    if [ "$1" == "-u" ]; then
      echo "✕ snapshot differs! recreated as requested by -u"
      mv test_dump.tmp snapshot.txt
    else
      diff test_dump.tmp snapshot.txt
      rm test_dump.tmp
      echo "✕ Failed: Flow types didn't match snapshot! Recreate with ` npm run test-rewrite-snapshots `" >&2;
      exit 1
    fi
  else
    echo "✓ Flow types matches snapshot!"
    echo
    rm test_dump.tmp
  fi
fi
