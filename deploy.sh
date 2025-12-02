#!/bin/bash

echo "📦 Starting deployment..."

cd /root/Uncanny || exit 1

echo "⬇️ Pulling latest changes from Git..."
git pull origin main

echo "🔄 Restarting Gunicorn..."
sudo systemctl restart gunicorn

echo "🚀 Deployment complete."
