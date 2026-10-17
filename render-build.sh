#!/usr/bin/env bash
# Exit on error
set -o errexit

if [ -d "Backend" ]; then
  cd Backend
  ./render-build.sh
else
  npm install
  export PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
  npx puppeteer browsers install chrome
fi
