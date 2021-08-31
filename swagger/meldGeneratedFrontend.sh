#!/bin/bash

unzip ~/Downloads/typescript-angular-client-generated.zip -d swaggerGenerated/
meld swaggerGenerated/ ~/vs_workspace/bfh-fe/src/app/services/swagger/
echo "done"
