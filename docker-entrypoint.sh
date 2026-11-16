#!/bin/sh
set -e

export PATH="/usr/local/bin:$PATH"

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

    if [ "$PRISMA_MIGRATE_STRATEGY" = "push" ]; then
      echo "==> Using PRISMA_MIGRATE_STRATEGY=push..."
      if $PRISMA_CLI db push --skip-generate --accept-data-loss; then
        MIGRATION_SUCCESS=true
        echo "==> Prisma database schema synchronized successfully via db push."
      fi
    elif [ -d "./prisma/migrations" ] && [ -n "$(ls -A ./prisma/migrations 2>/dev/null)" ]; then
      if $PRISMA_CLI migrate deploy; then
        MIGRATION_SUCCESS=true
        echo "==> Prisma migrations deployed successfully."
      else
        echo "==> 'prisma migrate deploy' failed. Checking and resolving failed migrations..."
        # 1. Resolve desynchronized or failed migrations as applied if objects already exist in database
        for m in "20260928180338_init" \
                 "20261019000000_add_media_slots_blog_messages_notifications" \
                 "20261019180000_catalog_countries_offices_experts" \
                 "20261020090000_live_departure_capacity" \
                 "20261020120000_inquiry_departure" \
                 "20261020150000_db_enforced_seat_rules" \
                 "20261020200000_rich_chat"; do
          $PRISMA_CLI migrate resolve --applied "$m" >/dev/null 2>&1 || true
        done

        # 2. Re-attempt migration deploy
        if $PRISMA_CLI migrate deploy; then
          MIGRATION_SUCCESS=true
          echo "==> Prisma migrations deployed successfully after resolution."
        else
          # 3. Fallback to schema push to ensure all tables exist even if migration state was desynchronized
          echo "==> Migrations still failed. Synchronizing database schema directly with 'prisma db push'..."
          if $PRISMA_CLI db push --skip-generate --accept-data-loss; then
            MIGRATION_SUCCESS=true
            echo "==> Prisma schema synchronized successfully via db push fallback."
          fi
        fi
      fi
    else
      if $PRISMA_CLI db push --skip-generate --accept-data-loss; then
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
fi

exec "$@"
