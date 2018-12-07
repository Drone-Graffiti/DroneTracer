#!/bin/bash

# start simple server
cd ${0%/*}
python3 -m http.server 8000
