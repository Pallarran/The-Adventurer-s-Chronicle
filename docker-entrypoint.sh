#!/bin/sh
set -e

echo "Running database migrations..."
node node_modules/prisma/build/index.js migrate deploy

echo "Seeding database (skips if already seeded)..."
node prisma/seed-docker.mjs

echo "Starting application..."
exec node server.js
