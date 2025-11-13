#!/usr/bin/env bash
# Script to create a protected production env file on the server.
# This script prompts for secrets interactively and writes /opt/kiosk-app/.env.prod
# Run this on the AWS host as the deploy user (not root) and then secure the file.

set -euo pipefail

TARGET_PATH="/opt/kiosk-app/.env.prod"
echo "This will create $TARGET_PATH with secrets you enter."
read -p "Proceed? [y/N] " proceed
if [[ "$proceed" != "y" && "$proceed" != "Y" ]]; then
  echo "Aborted."
  exit 1
fi

read -p "ENTER DATABASE HOST (e.g. csce-315-db.engr.tamu.edu): " DB_HOST
read -p "ENTER DATABASE PORT (default 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}
read -p "ENTER DATABASE NAME: " DB_NAME
read -p "ENTER DATABASE USER: " DB_USER
read -s -p "ENTER DATABASE PASSWORD: " DB_PASSWORD
echo
read -p "ENTER WEATHER DEFAULT CITY (default: College Station): " WEATHER_DEFAULT_CITY
WEATHER_DEFAULT_CITY=${WEATHER_DEFAULT_CITY:-"College Station"}
read -s -p "ENTER WEATHER_API_KEY: " WEATHER_API_KEY
echo

sudo mkdir -p $(dirname "$TARGET_PATH")
sudo tee "$TARGET_PATH" > /dev/null <<EOF
# Production env for kiosk-api
PORT=3001
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require"
WEATHER_API_KEY=${WEATHER_API_KEY}
WEATHER_DEFAULT_CITY="${WEATHER_DEFAULT_CITY}"
PG_MAX_CLIENTS=10
PG_SSL=true
EOF

sudo chmod 600 "$TARGET_PATH"
echo "Wrote $TARGET_PATH with restricted permissions (600)."
echo "Remember to export the vars or configure your process manager (pm2/systemd) to load them." 
