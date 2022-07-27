#!/bin/bash

rm -rf swaggerGenerated/

java -jar swagger-codegen-cli-3.0.34.jar generate --additional-properties stringEnums=true ngVersion=13 -i /tmp/open-api3.json -o swaggerGenerated/ -l typescript-angular
meld swaggerGenerated/ ../src/app/services/swagger/
rm -rf swaggerGenerated/
cp /tmp/open-api3.json .
echo "done and typescript extract deleted in download folder"
