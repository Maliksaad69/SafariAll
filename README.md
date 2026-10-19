This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Database (PostgreSQL in Docker)

All site data (countries, parks, operators, tours, itineraries, reviews, blog posts,
experts and demo accounts) lives in PostgreSQL. The database image in
`docker/postgres` ships a full SQL dump (`docker/postgres/init/01-safaribookings.sql`)
that creates the schema and loads the data the first time the container starts.
It is exposed on host port **5433** (5432 is often taken by a locally installed
PostgreSQL). Connection settings live in `.env` (copy `.env.example`).

```bash
npm install
npm run db:start     # build the image and start Postgres (loads the data on first run)
npm run dev
```

Other scripts: `db:stop`, `db:migrate` (apply new `prisma/migrations` to the running DB),
`db:dump` (write the running DB back to the init SQL so it can be committed), and
`db:reset` (**deletes the volume** and reloads from the SQL dump). pgAdmin is optional:
`docker compose --profile tools up -d`. Demo logins are listed in `docker/postgres/README.md`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
