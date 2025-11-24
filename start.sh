#!/bin/sh
set -e
cd server
if [ -f package-lock.json ]; then
  npm ci --only=production
else
  npm install --production
fi
npm run start