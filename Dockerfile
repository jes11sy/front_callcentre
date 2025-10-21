# Используем официальный Node.js образ как базовый
FROM node:18-alpine AS base

# Устанавливаем зависимости только при необходимости
FROM base AS deps
# Проверяем https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine чтобы понять, почему может понадобиться libc6-compat.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Устанавливаем зависимости на основе предпочитаемого менеджера пакетов
COPY package.json package-lock.json* ./
RUN npm ci

# Пересобираем исходный код только при необходимости
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Следующая строка отключает telemetry во время сборки.
# https://nextjs.org/docs/advanced-features/telemetry
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production образ, копируем все файлы и запускаем next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Следующая строка отключает telemetry во время выполнения.
# https://nextjs.org/docs/advanced-features/telemetry
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Автоматически используем output traces для уменьшения размера образа
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT=3001
# Устанавливаем hostname на localhost
ENV HOSTNAME="0.0.0.0"

# server.js создается автоматически из output: 'standalone'
CMD ["node", "server.js"]
