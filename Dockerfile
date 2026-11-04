# Usa a imagem base do Node.js 20
FROM node:20

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependência primeiro (melhora o cache)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o Prisma schema
COPY prisma ./prisma/

# Gera o Prisma Client
RUN npx prisma generate

# Copia o restante do código da aplicação
COPY . .

# Exponha a porta padrão
EXPOSE 3000

CMD ["npm", "run", "dev"]
