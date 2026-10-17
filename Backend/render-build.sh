#!/usr/bin/env bash
# Exit on error
set -o errexit

npm install

# Store Puppeteer cache in Render's persistent cache directory
export PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer

# Install Chrome for Puppeteer
npx puppeteer browsers install chrome
