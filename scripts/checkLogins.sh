#!/bin/bash

if [ "$1" == 'time' ];
  then grep -s EOL spacebattle/log/*;
  exit 0;
fi

grep -s EOL spacebattle/log/* | grep -oP '(?<="username": ")[^"]*';
