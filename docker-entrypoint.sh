#!/bin/sh
set -e

echo "🔄 Rodando Prisma migrations..."
npx prisma migrate deploy


echo "✅ Migrations concluídas!"
echo "🔄 Rodando seed script..."
npx prisma db seed
echo "✅ Seed concluído!"
echo "🚀 Iniciando aplicação..."

exec "$@"
