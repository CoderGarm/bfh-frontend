#!/bin/bash

# run it on build system

# fixme schnellstens
echo 'bitte lade es manuell hoch, der Prozess funktioniert momentan nicht'
echo 'cp scripts/htaccess dist/bfh-fe/.htaccess'
echo 'scp -r dist/ medusa:uploadTarget/bfh-frontend/'
echo 'Und dann natürlich deployen'
exit 1

scp scripts/deployFrontend.sh medusa:
cp scripts/google2cbaff394ce44864.html dist/bfh-fe/
cp scripts/htaccess dist/bfh-fe/.htaccess
rsync -a --ignore-existing --delete --progress dist/ medusa:/home/karsten/uploadTarget/bfh-frontend/
#rm -rf dist/
