
# ─── Stage 1: Base ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
FROM base AS deps

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN --mount=type=cache,target=/root/.npm \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000 && \
    npm ci --legacy-peer-deps

# ─── Stage 3: Builder ──────────────────────────────────────────────────────────
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Provide build-time fallback for Prisma schema validation during Next.js build
ARG DATABASE_URL="postgresql://postgres:postgres@localhost:5432/safaribookings_db?schema=public"
ENV DATABASE_URL=${DATABASE_URL}

RUN npx prisma generate
RUN npm run build

# Bundle database seed scripts into standalone JavaScript for runner
RUN mkdir -p dist-seed && \
    npx esbuild prisma/seed.ts --bundle --platform=node --target=node22 --outfile=dist-seed/seed-base.js --external:@prisma/client --external:bcryptjs && \
    npx esbuild scripts/seed-complete-dummy-data.ts --bundle --platform=node --target=node22 --outfile=dist-seed/seed-dummy.js --external:@prisma/client --external:bcryptjs

# ─── Stage 4: Production Runner ────────────────────────────────────────────────
FROM base AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PRISMA_TELEMETRY_INFORMATION_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install Prisma CLI globally with all runtime dependencies for entrypoint migrations
RUN --mount=type=cache,target=/root/.npm \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000 && \
    npm install -g prisma@6.19.3

# Non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Public assets (if public directory exists)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma schema, migrations, seed bundles, and runtime dependencies
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/dist-seed ./dist-seed
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs

USER nextjs

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
