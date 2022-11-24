#!/bin/bash

rm -rf swaggerGenerated/

java -jar swagger-codegen-cli-3.0.34.jar generate --additional-properties stringEnums=true ngVersion=13 -i /tmp/open-api3.json -o swaggerGenerated/ -l typescript-angular

echo 'inserting environment'
cd swaggerGenerated/api/ || exit 1
for filename in ./*; do
  lineNo=$(awk "/import { Configuration }/{ print NR+1; exit }" $filename)
  if [[ ! -z "$lineNo" ]]; then
    sed -i "$lineNo i import {environment} from '../../../../environments/environment';" $filename
  fi
done

cd ../..
echo 'using environment'
find . -name '*Api.service.ts' -exec sed -i -E "s|protected basePath = 'http://localhost:8080';|protected basePath = environment.backendServer;|g" {} \;


echo 'removing unnecessary files'
find . -name .gitignore -exec rm {} \;
find . -name .npmignore -exec rm {} \;
find . -name .swagger-codegen-ignore -exec rm {} \;

echo 'removing unnecessary folders'
find . -type d -name '.swagger-codegen' -exec rm -rf {} \; 2>/dev/null

meld swaggerGenerated/ ../src/app/services/swagger/
rm -rf swaggerGenerated/
cp /tmp/open-api3.json .
echo "done and typescript extract deleted in download folder"
