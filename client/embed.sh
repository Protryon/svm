#!/bin/bash
echo -e "var pl = '$(base64 -w 0 $1)';\nvar glob = $2;\n$(tail -n +3 src/index.js)" > src/index.js