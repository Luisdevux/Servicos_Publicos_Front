# https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
FROM node:22-alpine AS base

ARG API_URL_SERVER_SIDED=http://api-servicos:5011
ARG NEXT_PUBLIC_API_URL=http://localhost:5011
ARG PROXY_OAUTH_CALLBACK=true
ARG NEXTAUTH_SECRET=your-secret-key-change-this-in-production-min-32-characters-long
ARG NEXTAUTH_URL=http://localhost:3000

# Estágio 1: Builder - Instalar dependências e fazer build
FROM base AS builder

ENV API_URL_SERVER_SIDED=${API_URL_SERVER_SIDED}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV PROXY_OAUTH_CALLBACK=${PROXY_OAUTH_CALLBACK}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}

# Libc6-compat necessário para compatibilidade
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar arquivos de dependência
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fonte
COPY . .

# Copiar arquivo de exemplo de env e fazer build
RUN cp .env.example .env.production && NEXT_DISABLE_ESLINT=1 npm run build

# Estágio 2: Production image - Rodar a aplicação Next.js
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV API_URL_SERVER_SIDED=${API_URL_SERVER_SIDED}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV PROXY_OAUTH_CALLBACK=${PROXY_OAUTH_CALLBACK}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}

# Criar usuário não-root por segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos públicos
COPY --from=builder /app/public ./public

# Criar diretório .next e ajustar permissões
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copiar output standalone do Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js é criado pelo Next.js build com output standalone
CMD ["node", "server.js"]
