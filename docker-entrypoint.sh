#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding database (skips if already seeded)..."
node prisma/seed-docker.mjs

echo "Starting application..."
exec npx next start -p 4000 -H 0.0.0.0
