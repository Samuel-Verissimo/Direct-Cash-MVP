# syntax=docker/dockerfile:1

# --- base ---
FROM node:20-alpine AS base
RUN npm install -g pnpm

# --- deps ---
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- builder ---
# NEXT_PUBLIC_* são inlined em build time pelo Next.js — precisam ser passados aqui
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:3101/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm build

# --- runner ---
# next build com output: 'standalone' gera um servidor Node.js autossuficiente
# sem precisar de next start nem de toda a node_modules em prod
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# standalone inclui o server.js e as dependências mínimas necessárias
COPY --from=builder /app/.next/standalone ./
# Assets estáticos ficam fora do standalone e precisam ser copiados manualmente
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
