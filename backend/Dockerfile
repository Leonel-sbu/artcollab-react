# =============================================================================
# ARTCOLLAB Backend Dockerfile
# =============================================================================
# Multi-stage build for production optimization
# 
# Build: docker build -t artcollab-backend .
# Run: docker run -p 5000:5000 --env-file .env artcollab-backend
# =============================================================================

# Stage 1: Base image
FROM node:20-alpine AS base
WORKDIR /app

# Stage 2: Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm ci --only=production

# Stage 3: Production build
FROM base AS production
RUN apk add --no-cache libc6-compat

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

# Copy source code
COPY src ./src
COPY uploads ./uploads

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Environment
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the server
CMD ["node", "src/server.js"]
