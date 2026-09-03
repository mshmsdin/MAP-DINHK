# ==============================================================================
# Multi-Stage Production Dockerfile for Ansab & Buldan (MAP-DINHK)
# Target: Coolify / Traefik / Cloudflare Tunnel on Ubuntu 24.04 LTS
# Node.js: 24.19.0 LTS (Debian Bookworm Slim)
# Internal Port: 3000 | Non-root user: node
# ==============================================================================

# Stage 1: Install dependencies deterministically
FROM node:24.19.0-bookworm-slim AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Stage 2: Build the production bundle
FROM node:24.19.0-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
RUN npm run build

# Stage 3: Minimal production runner
FROM node:24.19.0-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy package descriptors and install only production dependencies if needed
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy static build output and production server
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --chown=node:node server.js ./

# Run as non-root user
USER node

EXPOSE 3000

# Docker Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
