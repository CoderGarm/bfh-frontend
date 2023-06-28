#!/bin/bash

# run it on build system

rm -f bfh-fe.tar.gz
tar -czf bfh-fe.tar.gz dist/
scp bfh-fe.tar.gz scripts/htaccess medusa:uploadTarget/
scp scripts/deployFrontend.sh medusa:
rm -rf dist/
rm -f bfh-fe.tar.gz
