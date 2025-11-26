#!/bin/sh
set -e

echo "🔄 Rodando Prisma migrations..."
npm run db:migrate
echo "✅ Migrations concluídas!"
echo "🔄 Rodando seed script..."
npm run db:seed
echo "✅ Seed concluído!"
echo "🚀 Iniciando aplicação..."

exec "$@"
