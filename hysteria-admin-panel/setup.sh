#!/bin/bash
set -e

if [ -z "$DOMAIN" ]; then
  read -p "Enter your domain name (e.g. vpn.example.com): " DOMAIN
fi

echo "Using domain: $DOMAIN"

if ! command -v docker >/dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
fi
if ! command -v docker-compose >/dev/null && ! command -v docker compose >/dev/null; then
  echo "Installing docker compose plugin..."
  apt-get update && apt-get install -y docker-compose-plugin
fi

REPO_DIR=$(pwd)

if [ ! -f "$REPO_DIR/.env" ]; then
  cp .env.example .env
  sed -i "s|DOMAIN=.*|DOMAIN=$DOMAIN|" .env
fi

docker compose pull || true
docker compose up -d --build

IP=$(curl -s https://api.ipify.org || echo "your-server-ip")

echo "Admin panel running on http://$IP:3000"
echo "Default login -> username: admin password: Ahmad2016"
