# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/pelak/package.json ./apps/pelak/
COPY apps/site/package.json ./apps/site/
COPY apps/studio/package.json ./apps/studio/
COPY packages/contract/package.json ./packages/contract/
COPY packages/core/package.json ./packages/core/
COPY packages/config/package.json ./packages/config/
COPY packages/site-data/package.json ./packages/site-data/
COPY packages/studio/package.json ./packages/studio/
COPY packages/seed/package.json ./packages/seed/
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build -w @nextgen-cms/pelak

FROM node:22-alpine AS runner
RUN apk add --no-cache wget su-exec chromium nss freetype harfbuzz ca-certificates ttf-freefont
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=file:/data/pelak.sqlite
ENV MIGRATIONS_DIR=/app/packages/core/drizzle/migrations
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=build /app/apps/pelak/public ./apps/pelak/public
COPY --from=build /app/apps/pelak/lib/pdf/fonts ./apps/pelak/lib/pdf/fonts
COPY --from=build --chown=nextjs:nodejs /app/apps/pelak/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/pelak/.next/static ./apps/pelak/.next/static
COPY --from=build /app/packages/core/drizzle ./packages/core/drizzle
COPY --from=build /app/packages/core/scripts ./packages/core/scripts
COPY --from=build /app/packages/core/src ./packages/core/src
COPY --from=build /app/packages/seed/src ./packages/seed/src
COPY --from=build /app/packages/contract/src ./packages/contract/src
COPY --from=build /app/tsconfig.base.json ./tsconfig.base.json
COPY --from=deps /app/node_modules ./node_modules
COPY docker/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000
VOLUME ["/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
