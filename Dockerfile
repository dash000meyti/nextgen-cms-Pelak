# syntax=docker/dockerfile:1
# bookworm-slim: avoids Alpine APK DNS/CDN failures on some build hosts (e.g. Hamdocker).

FROM node:22-bookworm-slim AS deps
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/pelak/package.json ./apps/pelak/
COPY packages/contract/package.json ./packages/contract/
COPY packages/core/package.json ./packages/core/
COPY packages/config/package.json ./packages/config/
COPY packages/site-data/package.json ./packages/site-data/
COPY packages/studio/package.json ./packages/studio/
COPY packages/seed/package.json ./packages/seed/
RUN npm ci

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build -w @nextgen-cms/pelak

FROM node:22-bookworm-slim AS runner
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    wget gosu chromium ca-certificates fonts-freefont-ttf \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=file:/data/pelak.sqlite
ENV MIGRATIONS_DIR=/app/packages/core/drizzle/migrations
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs --shell /usr/sbin/nologin nextjs

COPY --from=build /app/apps/pelak/public ./apps/pelak/public
COPY --from=build /app/apps/pelak/lib/pdf/fonts ./apps/pelak/lib/pdf/fonts
COPY --from=build --chown=nextjs:nodejs /app/apps/pelak/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/pelak/.next/static ./apps/pelak/.next/static
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/packages/core/package.json ./packages/core/package.json
COPY --from=build /app/packages/core/drizzle ./packages/core/drizzle
COPY --from=build /app/packages/core/scripts ./packages/core/scripts
COPY --from=build /app/packages/core/src ./packages/core/src
COPY --from=build /app/packages/config/package.json ./packages/config/package.json
COPY --from=build /app/packages/config/src ./packages/config/src
COPY --from=build /app/packages/contract/package.json ./packages/contract/package.json
COPY --from=build /app/packages/contract/src ./packages/contract/src
COPY --from=build /app/packages/seed/package.json ./packages/seed/package.json
COPY --from=build /app/packages/seed/src ./packages/seed/src
COPY --from=build /app/tsconfig.base.json ./tsconfig.base.json
COPY --from=deps /app/node_modules ./node_modules
COPY docker/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000
VOLUME ["/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
