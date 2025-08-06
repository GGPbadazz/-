#!/usr/bin/env node

/**
 * Docker container startup snapshot system initialization script
 * Ensure snapshot tables and indexes are properly created
 */

const path = require('path');
const fs = require('fs');

// Set database path
const DATABASE_PATH = process.env.DATABASE_PATH || './database/inventory.db';

console.log('🐳 Docker container snapshot system initialization...');
console.log(`📁 Database path: ${DATABASE_PATH}`);

// Check if database file exists
if (!fs.existsSync(DATABASE_PATH)) {
    console.error('❌ Database file does not exist:', DATABASE_PATH);
    process.exit(1);
}

try {
    // Import snapshot table creation script
    require('./create-snapshot-table.js');
    console.log('✅ Snapshot system initialization completed');
} catch (error) {
    console.error('❌ Snapshot system initialization failed:', error.message);
    // Don't exit process, let main application continue startup
    console.log('⚠️  Will retry snapshot system initialization at main application startup');
}
