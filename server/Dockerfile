# Production-stable Dockerfile for server
FROM node:20.18.0-alpine

# Install python and make to support better-sqlite3 compilation, add curl for health checks
RUN apk add --no-cache python3 make g++ curl py3-pip

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (use specific version to ensure stability)
RUN npm ci --only=production

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/database /app/backups /app/data /app/jobs /app/scripts

# Initialize database (if not exists)
RUN npm run init-db || echo "Database already exists or init failed"

# Create snapshot tables and indexes (ensure snapshot system works properly)
RUN node scripts/docker-init-snapshots.js || echo "Will initialize snapshots at runtime"

# Copy Docker startup script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 3003

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3003
ENV DATABASE_PATH=/app/database/inventory.db

# Health check - check if product API and snapshot API are working
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=5 \
  CMD sh -c "wget --quiet --tries=1 --spider http://localhost:3003/api/products && wget --quiet --tries=1 --spider http://localhost:3003/api/snapshots/stats" || exit 1

# Start application
ENTRYPOINT ["docker-entrypoint.sh"]
