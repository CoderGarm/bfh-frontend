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

# deployment
## extract
cd /home/karsten/uploadTarget/ || exit
rm -rf /home/karsten/uploadTarget/dist/
tar -xf /home/karsten/uploadTarget/dist.tar.gz -C /home/karsten/uploadTarget/

## deploy
sudo rm -r /var/www/html/bfh-fe/
sudo cp -r /home/karsten/uploadTarget/dist/bfh-fe/ /var/www/html/
sudo cp /home/karsten/uploadTarget/htaccess /var/www/html/bfh-fe/.htaccess
sudo chown -R www-data:www-data /var/www/html/bfh-fe/
echo 'deployment of frontend done'