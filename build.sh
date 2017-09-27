#!/bin/bash
mkdir build 2&> /dev/null
cd compiler
node index.js ../src/*.js ../build/out.sasm
cd ..
cd optimizer
node index.js ../build/out.sasm ../build/optimized.sasm
cd ..
cd assembler
node index.js ../build/optimized.sasm ../build/out.sobj
cd ..
