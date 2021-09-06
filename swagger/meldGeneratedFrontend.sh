#!/bin/bash

rm -rf swaggerGenerated/
if [ ! -f ~/Downloads/typescript-angular-client-generated.zip ]; then
	echo "typescript extract not present - cancel"
	exit 1;
fi
unzip ~/Downloads/typescript-angular-client-generated.zip -d swaggerGenerated/
meld swaggerGenerated/ ../src/app/services/swagger/ ;
rm -rf ~/Downloads/typescript-angular-client-generated.zip
rm -rf swaggerGenerated/
echo "done and typescript extract deleted in download folder"
