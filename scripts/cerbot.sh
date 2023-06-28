#!/bin/bash

echo "Stopping apache"
sudo systemctl stop apache2.service;
if sudo certbot certonly --standalone -d battleforhonor.de -d www.battleforhonor.de -d map.battleforhonor.de; then
  echo "certificates updated - please check all sites enabled"
  sudo systemctl start apache2.service;
  echo "Apache restarted"
  exit 0
else
  echo "error updating certificates"
  exit 1
fi
