#!/bin/bash
SH_DIR=$(cd "$(dirname "$0")";pwd)

if [ -f ${SH_DIR}/ZeroTierForKSU.zip ];then
    rm ${SH_DIR}/ZeroTierForKSU.zip
fi
cd ${SH_DIR}/ui-src
npm i
npm audit fix
npm run build
mv -f build ${SH_DIR}/webroot
cd ${SH_DIR}
zip -r -o -X -ll ZeroTierForKSU.zip ./ -x '.git/*' -x '.gitignore' -x '.github/*' -x '.vscode/*' -x 'ui-src' -x 'build.sh' -x 'update.json'
