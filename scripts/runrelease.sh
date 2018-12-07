#!/bin/bash

# mode to root dir
cd "$(dirname "$0")" && cd ../
rm -r -f dist/
mkdir -p dist

# copy build library and examples into dist folder
cp -r src/example dist/
cp build/DroneTracer.min.js dist/
cp build/DroneTracer.min.js dist/example

# TODO: releave version/ tagging?
