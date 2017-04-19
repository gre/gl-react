#!/bin/bash
cd `dirname $0`

# $1 is an opportunity to give -u

jest $1 &&
./flow/test.sh $1
