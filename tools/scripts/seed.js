#!/usr/bin/env node

/**
 * Seed script — populates the database with demo product data.
 *
 * Usage:
 *   npm run seed                     # Seed using backend/.env (skips if data exists)
 *   npm run seed -- --force          # Drop existing products and re-seed
 *   npm run seed -- --env=.env.prod  # Use a specific env file
 */

const { execSync } = require('child_process');
const path = require('path');

const backendDir = path.resolve(__dirname, '../../backend');

// Forward CLI args
const args = process.argv.slice(2).join(' ');

try {
    execSync(`npx ts-node src/scripts/seed.ts ${args}`, {
        cwd: backendDir,
        stdio: 'inherit',
    });
} catch (err) {
    process.exit(1);
}
