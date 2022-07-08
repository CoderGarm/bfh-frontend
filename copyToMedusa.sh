#!/bin/bash

rm -f dist.tar.gz
tar -czf dist.tar.gz dist/
scp dist.tar.gz medusa:
