#!/bin/bash

# run it on build system

scp scripts/deployFrontend.sh medusa:
cp scripts/google2cbaff394ce44864.html dist/bfh-fe/
cp scripts/htaccess dist/bfh-fe/.htaccess
rsync -a --ignore-existing --delete --progress dist/ medusa:/home/karsten/uploadTarget/bhf-frontend/
rm -rf dist/
