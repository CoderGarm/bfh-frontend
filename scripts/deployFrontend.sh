#!/bin/bash

# run it at medusa
echo '1. archive old deployment'
echo '2. deploy new stuff'

# archive
date=$(date +%F)
time=$(date +%T)
mkdir -p /home/karsten/archive/"$date"/frontend/
tar -czf /home/karsten/archive/"$date"/frontend/"$time"_bfh-fe.tar.gz /var/www/html/bfh-fe/
echo 'frontend archived in ' + /home/karsten/archive/"$date"/frontend/"$time"_bfh-fe.tar.gz

## deploy
sudo rm -r /var/www/html/bfh-fe/
sudo cp -r /home/karsten/uploadTarget/bfh-frontend/bfh-fe/ /var/www/html/
sudo chown -R www-data:www-data /var/www/html/bfh-fe/
rm /home/karsten/uploadTarget/bfh-frontend/bfh-fe/*.js
rm /home/karsten/uploadTarget/bfh-frontend/bfh-fe/*.html
rm /home/karsten/uploadTarget/bfh-frontend/bfh-fe/*.css
rm /home/karsten/uploadTarget/bfh-frontend/bfh-fe/*.txt
rm /home/karsten/uploadTarget/bfh-frontend/bfh-fe/*.svg
rm /home/karsten/uploadTarget/bfh-frontend/bfh-fe/*.ico
rm /home/karsten/uploadTarget/bfh-frontend/bfh-fe/assets/i18n/*.json
rm /home/karsten/uploadTarget/bfh-frontend/bfh-fe/assets/astrography/*.json
echo 'deployment of frontend done'

