#!/bin/bash

# mode to root dir
cd "$(dirname "$0")" && cd ../

# link assets and source
ln -s -f ../node_modules test/
ln -s -f ../src test/

cd test && python3 -m http.server 8000
#python3 -m http.server 8000

