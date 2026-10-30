# SafariAsili database image

`init/01-safaribookings.sql` is a full `pg_dump` of the app database: schema,
Prisma migration history and all catalog data (countries, parks, operators,
tours, itineraries, reviews, blog posts, experts and demo accounts).

`docker compose up -d` builds this image and, on the first start with an empty
volume, loads the dump. To reload from scratch: `docker compose down -v` then
`docker compose up -d`.

After changing data in the running database, regenerate the dump with
`npm run db:dump` and commit the updated SQL file.

Demo accounts (local testing only): `admin@safariasili.com` / `AdminPass123!`,
operators use `OperatorPass123!`, travelers use `TravelerPass123!`.
