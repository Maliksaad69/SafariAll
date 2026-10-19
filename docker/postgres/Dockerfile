# PostgreSQL 17 with the SafariAsili schema and catalog data baked in.
# On first start (empty data volume) the official entrypoint runs every
# script in /docker-entrypoint-initdb.d, which creates all tables, the
# Prisma migration history, and loads the data.
FROM postgres:17-alpine
COPY init/ /docker-entrypoint-initdb.d/
