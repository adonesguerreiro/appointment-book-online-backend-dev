# Usa a imagem base do Node.js 20
FROM node:20

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependência primeiro (melhora o cache)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código da aplicação
COPY . .

# Instala o Prisma
RUN npx prisma generate

# Executa as migrations
RUN npx prisma migrate deploy

# Exponha a porta padrão
EXPOSE 3000

# # Variáveis padrão (podem ser sobrescritas via docker-compose)
# ENV NODE_ENV=development
# ENV DATABASE_URL=postgresql://postgres:postgres@postgres:5432/postgres

# Comando padrão (pode ser sobrescrito no docker-compose)
CMD ["npm", "run", "dev"]
