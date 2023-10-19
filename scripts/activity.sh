#!/bin/bash

if [ "$1" == 'hit' ];
  then sudo apachetop -f /var/log/apache2/access-bfh.log -H -r
  exit 0;
fi

sudo tail -f /var/log/apache2/access-bfh.log
