#!/bin/bash

grep -s '>>>Login:' spacebattle/log/* | grep -oP '(?<=>>>Login: )[^\n]*';
