
# Etapa 1: Build da aplicação
FROM node:20.16.0-slim AS builder

WORKDIR /app

# Copia apenas os arquivos necessários para instalar as dependências
COPY package*.json ./

# Instala todas as dependências (incluindo as de desenvolvimento)
RUN npm install

# Copia o restante do código da aplicação
COPY . .

# Gera os Prisma Client (se estiver usando Prisma)
RUN npx prisma generate

# Etapa 2: Imagem final para produção
FROM node:20.16.0-slim AS production

WORKDIR /app

# Copia apenas os arquivos necessários da etapa de build
COPY --from=builder /app ./

# Instala apenas as dependências de produção
RUN npm install --omit=dev

# Expõe a porta (caso a sua API use a 3000)
EXPOSE 3000

# Comando padrão para iniciar a API
CMD ["npm", "run", "start"]
