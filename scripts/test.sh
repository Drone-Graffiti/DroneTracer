#!/bin/bash
windows() { [[ -n "$WINDIR" ]]; }

# mode to root dir
cd "$(dirname "$0")" && cd ../

# link assets and source
if windows; then 
    cmd <<< "mklink /D \"../node_modules\" \"test\"" > /dev/null
    cmd <<< "mklink /D \"../src\" \"test\"" > /dev/null
else
    ln -s -f ../node_modules test/
    ln -s -f ../src test/
fi

#cd test && python3 -m http.server 8000
#python3 -m http.server 8000
# use node instead
node ./scripts/server.js ./test 8000

