#!/bin/bash

# run it on build system


if [ -z "$1" ];
	then echo 'Should it be build for production, staging or development? Add argument please'; exit
fi

rm -r dist/
if [ "$1" == 'production' ] || [ "$1" == 'staging' ] || [ "$1" == 'development' ];
	then echo "build started for $1";  ng build --aot --output-hashing=all --configuration="$1";
fi

check=$?
if [ "$check" -eq 0 ]; then
    echo 'build successful'
else
    echo 'build failure'; exit 1;
fi


