# Dockerfile - Produção (Kubernetes)
# 
# Este Dockerfile é otimizado para deploy em Kubernetes.
# 
# Para desenvolvimento local, use:
#   - Dockerfile.dev
#   - docker-compose-dev.yml

FROM node:22-alpine AS base

# Estágio 1: Dependências - Instalar dependências de produção
FROM base AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar apenas package files para cache de camadas
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Estágio 2: Builder - Build da aplicação
FROM base AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar dependências do estágio anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fonte
COPY . .

# Build-time args para variáveis NEXT_PUBLIC_*
ARG NEXT_PUBLIC_API_URL=https://servicospublicos-api.app.fslab.dev
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build do Next.js (standalone mode)
RUN npm run build

# Estágio 3: Runner - Imagem final de produção
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

# Desabilitar telemetria do Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Criar usuário não-root (uid/gid 1001 para compatibilidade com Kubernetes)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos públicos
COPY --from=builder /app/public ./public

# Copiar output standalone do Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js é criado pelo Next.js build com output standalone
CMD ["node", "server.js"]
