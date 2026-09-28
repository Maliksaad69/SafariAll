#!/usr/bin/env bash
# Stops the portable PostgreSQL server started by scripts/setup-db.sh
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PG="$ROOT/node_modules/@embedded-postgres/windows-x64/native/bin"
PGDATA="$ROOT/tools/pgdata"
"$PG/pg_ctl.exe" -D "$PGDATA" -m fast stop
