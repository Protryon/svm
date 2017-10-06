#!/bin/bash
mkdir build 2> /dev/null
cd compiler
node index.js ../src/*.js ../build/out.sasm
cd ..
cd optfuscator
node index.js ../build/out.sasm ../build/optimized.sasm
cd ..
cd assembler
node index.js ../build/optimized.sasm ../build/out.sobj ../build/out.smap ../build/instrs.txt
cd ..
cd preprocessor
node index.js ../build/out.sobj global ../build/instrs.txt ../client/src/index.js ../client/src/index.js
cd ..
cd client
npm run build --production
cd ..
