#!/bin/bash
echo -e "var pl = '$(base64 -w 0 $1)';\n$(tail -n +2 src/index.js)" > src/index.js