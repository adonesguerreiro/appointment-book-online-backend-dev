#!/bin/sh
set -e

echo "🔄 Rodando Prisma migrations..."
npx prisma migrate deploy

echo "✅ Migrations concluídas!"
echo "🚀 Iniciando aplicação..."

exec "$@"
