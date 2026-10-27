# Multi-stage Dockerfile untuk MiQR Production (Non-Root User)
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Builder Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Dummy build-time environment variables for Next.js and Prisma Client compilation
ENV DATABASE_URL="postgresql://app_user:strong_password@localhost:5432/miqr_db?schema=public"
ENV AUTH_SECRET="miqr_super_secret_jwt_key_random_32_characters_long_string_2026"
ENV NEXT_PUBLIC_APP_NAME="MiQR"
ENV NEXT_PUBLIC_APP_URL="http://localhost:3001"

# Generate Prisma Client & Build Next.js
RUN npx prisma generate
RUN npm run build

# Runner Stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Siapkan direktori storage dengan hak akses user nextjs
RUN mkdir -p /var/lib/miqr && chown -R nextjs:nodejs /var/lib/miqr

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
