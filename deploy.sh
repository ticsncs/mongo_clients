#!/bin/bash

# Obtén los últimos cambios
git fetch origin main
git reset --hard origin/main

# Instala dependencias y construye
npm ci
npm run build

# Reinicia la aplicación con PM2
if command -v pm2 &> /dev/null; then
  pm2 reload ecosystem.config.js || pm2 start ecosystem.config.js
else
  echo "PM2 no está instalado, instalándolo..."
  npm install -g pm2
  pm2 start ecosystem.config.js
fi

# Muestra estado de la aplicación
pm2 status
