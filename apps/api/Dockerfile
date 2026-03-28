# syntax=docker/dockerfile:1

# --- base ---
# Imagem mínima com pnpm instalado globalmente
FROM node:20-alpine AS base
RUN npm install -g pnpm
WORKDIR /app

# --- deps ---
# Instala dependências necessárias para build dentro do contexto do app/api
# Layer separada para cache: só rebuild quando package.json mudar
FROM base AS deps
COPY package.json ./
RUN pnpm install --no-frozen-lockfile

# --- builder ---
# Compila TypeScript e gera o Prisma Client com o schema correto
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# prisma generate precisa do schema antes do build do TS
RUN npx prisma generate
RUN pnpm build

# --- production ---
# Imagem final: apenas artefatos necessários para rodar em prod
FROM base AS production
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
# prisma/migrations necessário para `prisma migrate deploy` no startup
COPY --from=builder /app/prisma ./prisma
# prisma.config.ts configura schema path e datasource no Prisma 7
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY package.json ./

EXPOSE 3001

# Roda migrate deploy antes de iniciar: garante que o banco está atualizado
# sem downtime (operação idempotente e segura em prod)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
