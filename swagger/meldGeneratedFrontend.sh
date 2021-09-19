#!/bin/bash

rm -rf swaggerGenerated/

#if [ ! -f ~/Downloads/typescript-angular-client-generated.zip ]; then
#	echo "typescript extract not present - cancel"
#	exit 1;
#fi
#unzip ~/Downloads/typescript-angular-client-generated.zip -d swaggerGenerated/
#rm -rf ~/Downloads/typescript-angular-client-generated.zip

#java -jar openapi-generator-cli-5.2.1.jar generate -i /tmp/open-api3.json -o swaggerGenerated/ -g typescript-angular
java -jar swagger-codegen-cli-3.0.27.jar generate -i /tmp/open-api3.json -o swaggerGenerated/ -l typescript-angular
meld swaggerGenerated/ ../src/app/services/swagger/
rm -rf swaggerGenerated/
cp /tmp/swagger.json .
cp /tmp/open-api3.json .
echo "done and typescript extract deleted in download folder"
