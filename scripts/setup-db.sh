#!/usr/bin/env bash
# Sets up and starts a local portable PostgreSQL server for SafariAsili
# using the binaries shipped in @embedded-postgres/windows-x64 (no Docker / admin rights needed).
# Usage:
#   npm run db:start              # start server + ensure DB exists
#   npm run db:start -- --reinit  # wipe and re-create the data directory first
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PG="$ROOT/node_modules/@embedded-postgres/windows-x64/native/bin"
PGDATA="$ROOT/tools/pgdata"
LOG="$ROOT/tools/pg.log"
PORT=5432

DB_USER="${POSTGRES_USER:-safari_admin}"
DB_NAME="${POSTGRES_DB:-safaribookings_db}"

if [ ! -d "$PG" ]; then
  echo "Installing portable PostgreSQL binaries..."
  npm install --no-save @embedded-postgres/windows-x64@17.5.0-beta.15
fi

# Stop an already-running instance from a previous run
"$PG/pg_ctl.exe" -D "$PGDATA" -m fast stop >/dev/null 2>&1 || true

if [ "$1" = "--reinit" ] || [ ! -f "$PGDATA/PG_VERSION" ]; then
  echo "Initializing data directory at $PGDATA..."
  rm -rf "$PGDATA"
  "$PG/initdb.exe" -D "$PGDATA" -U "$DB_USER" -A trust -E UTF8 --locale=C >/dev/null
fi

echo "Starting PostgreSQL on port $PORT..."
"$PG/pg_ctl.exe" -D "$PGDATA" \
  -o "-p $PORT -c autovacuum=off -c max_connections=50 -c max_worker_processes=2 -c max_parallel_workers=0" \
  -l "$LOG" start

echo "Done. PostgreSQL is running at localhost:$PORT (user: $DB_USER)."
echo "Run 'npx prisma db push' (creates the DB if missing) then 'npm run db:seed' if the database is empty."
echo "Logs: $LOG   Stop with: npm run db:stop"
