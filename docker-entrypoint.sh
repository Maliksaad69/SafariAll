#!/bin/sh
set -e

# Run Prisma schema migration on startup if DATABASE_URL is provided
if [ -n "$DATABASE_URL" ] && [ "$SKIP_PRISMA_MIGRATION" != "true" ]; then
  echo "==> Preparing database connection..."

  # Locate Prisma CLI
  if command -v prisma >/dev/null 2>&1; then
    PRISMA_CLI="prisma"
  elif [ -f "./node_modules/prisma/build/index.js" ]; then
    PRISMA_CLI="node ./node_modules/prisma/build/index.js"
  elif [ -x "./node_modules/.bin/prisma" ]; then
    PRISMA_CLI="./node_modules/.bin/prisma"
  else
    PRISMA_CLI="npx prisma"
  fi

  # Retry loop to allow database service to become ready
  MAX_RETRIES=8
  RETRY_COUNT=0
  MIGRATION_SUCCESS=false

  until [ "$MIGRATION_SUCCESS" = "true" ] || [ $RETRY_COUNT -ge $MAX_RETRIES ]; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "==> Running Prisma migration / schema push (attempt $RETRY_COUNT of $MAX_RETRIES)..."

    if [ -d "./prisma/migrations" ] && [ -n "$(ls -A ./prisma/migrations 2>/dev/null)" ]; then
      if $PRISMA_CLI migrate deploy; then
        MIGRATION_SUCCESS=true
        echo "==> Prisma migrations deployed successfully."
      fi
    else
      if $PRISMA_CLI db push --skip-generate; then
        MIGRATION_SUCCESS=true
        echo "==> Prisma database schema synchronized successfully."
      fi
    fi

    if [ "$MIGRATION_SUCCESS" != "true" ]; then
      if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
        echo "==> Database not ready or migration failed. Waiting 3 seconds before retrying..."
        sleep 3
      else
        echo ""
        echo "================================================================================"
        echo "[ERROR] Could not connect to database or run Prisma migrations after $MAX_RETRIES attempts."
        echo "================================================================================"
        echo "Check the following common causes:"
        echo " 1. Is PostgreSQL active on your VPS host or container?"
        echo "    Run: systemctl status postgresql"
        echo " 2. Is your DATABASE_URL correct in .env?"
        echo "    If running PostgreSQL on the VPS host with Docker:"
        echo "    - Recommended: Enable 'network_mode: host' in docker-compose.yml"
        echo "      and set DATABASE_URL='postgresql://<user>:<password>@127.0.0.1:5432/<dbname>?schema=public'"
        echo "    - Or with bridge mode: Use host.docker.internal and verify pg_hba.conf allows incoming docker subnet."
        echo " 3. Does the target database exist? (e.g. 'CREATE DATABASE lead_crm;')"
        echo "================================================================================"
        exit 1
      fi
    fi
  done

  # Initialize default demo/admin user if database has no users
  if [ -f "./prisma/seed-init.js" ]; then
    node ./prisma/seed-init.js || true
  fi
fi

exec "$@"
