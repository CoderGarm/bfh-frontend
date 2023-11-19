#!/bin/bash

# run it on build system
cp scripts/google2cbaff394ce44864.html dist/bfh-fe/
cp scripts/htaccess dist/bfh-fe/.htaccess
scp scripts/deployFrontend.sh medusa:
rsync -a --ignore-existing --delete --progress dist/ medusa:/home/karsten/uploadTarget/bfh-frontend/
