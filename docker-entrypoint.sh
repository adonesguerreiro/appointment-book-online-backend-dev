#!/bin/sh
set -e

if [ "$NODE_ENV" != "production" ]; then
  echo "======================================"
  echo "🔍 DEBUG - Informações do ambiente"
  echo "======================================"
  echo "Node version: $(node --version)"
  echo "NPM version: $(npm --version)"
  echo "Working directory: $(pwd)"
  echo "NODE_ENV: ${NODE_ENV:-not set}"
  echo ""

  echo "🔍 Verificando DATABASE_URL..."
  if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL não está definida!"
    exit 1
  else
    echo "✅ DATABASE_URL está definida"
  fi
  echo ""
else
  if [ -z "$DATABASE_URL" ]; then
    echo "DATABASE_URL não está definida!"
    exit 1
  fi
fi

if [ "$NODE_ENV" != "production" ]; then
  echo "======================================"
  echo "🔄 Rodando Prisma migrations..."
  echo "======================================"
  npx prisma migrate deploy
  echo "✅ Migrations concluídas!"
  echo ""
else
  npx prisma migrate deploy
fi

if [ "$NODE_ENV" != "production" ]; then
  echo "======================================"
  echo "🚀 Iniciando aplicação..."
  echo "======================================"
fi

exec "$@"
