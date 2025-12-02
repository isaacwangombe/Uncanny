#!/bin/bash

cd /root/Uncanny || exit 1

git reset --hard
git pull origin main

chmod +x deploy.sh

docker-compose down
docker system prune -af
docker-compose build
docker-compose up -d

