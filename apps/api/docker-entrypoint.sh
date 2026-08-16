#!/bin/sh
set -e

if [ "${SKIP_MIGRATIONS:-}" != "true" ]; then
  echo "Running database migrations..."
  (cd /app/apps/api && npx prisma migrate deploy)
fi

exec node /app/apps/api/dist/src/main.js
