#!/bin/sh
set -e

echo "======================================"
echo "🔍 DEBUG - Informações do ambiente"
echo "======================================"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Working directory: $(pwd)"
echo ""

echo "🔍 Verificando DATABASE_URL..."
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL não está definida!"
  exit 1
else
  echo "✅ DATABASE_URL está definida"
fi
echo ""

echo "======================================"
echo "🔄 Rodando Prisma migrations..."
echo "======================================"
npx prisma migrate deploy
echo "✅ Migrations concluídas!"
echo ""

echo "======================================"
echo "🔄 Rodando seed script..."
echo "======================================"
npm run db:seed
echo "✅ Seed concluído!"
echo ""

echo "======================================"
echo "🚀 Iniciando aplicação..."
echo "======================================"

exec "$@"
