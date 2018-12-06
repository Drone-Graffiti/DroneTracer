#!/bin/bash

# link library inside server range
rm -f DroneTracer.js && ln -s ../DroneTracer.js .


# start simple server
python3 -m http.server 8000
