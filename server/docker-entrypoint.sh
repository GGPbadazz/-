#!/bin/sh

# Docker container startup script
# Ensure all system components are properly initialized

echo "🐳 Starting Barcode Management System..."

# Check database directory
if [ ! -d "/app/database" ]; then
    echo "📁 Creating database directory..."
    mkdir -p /app/database
fi

# Check backup directory
if [ ! -d "/app/backups" ]; then
    echo "📁 Creating backup directory..."
    mkdir -p /app/backups
fi

# Set correct permissions
chown -R node:node /app/database /app/backups

echo "⏰ Timezone: ${TZ:-UTC}"
echo "📊 Snapshot system: ${SNAPSHOT_ENABLED:-true}"
echo "🔄 Snapshot schedule: ${SNAPSHOT_SCHEDULE:-'0 2 1 * *'}"

# Start Node.js application
echo "🚀 Starting application server..."
exec npm start
