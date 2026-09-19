# Graph Report - safari-ascili  (2026-09-19)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 199 nodes · 379 edges · 17 communities (13 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- next
- prisma.ts
- package.json
- compilerOptions
- auth.ts
- devDependencies
- tours/page.tsx
- dependencies
- scripts
- layout.tsx
- tours/[slug]/page.tsx
- inquiries/route.ts
- next-env.d.ts
- ImageGallery.tsx
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `next` - 36 edges
2. `lucide-react` - 23 edges
3. `prisma` - 19 edges
4. `Footer()` - 16 edges
5. `Navbar()` - 16 edges
6. `compilerOptions` - 16 edges
7. `getSession()` - 15 edges
8. `react` - 10 edges
9. `scripts` - 9 edges
10. `TourCard()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `AdminPage()` --calls--> `getSession()`  [EXTRACTED]
  app/admin/page.tsx → lib/auth.ts
- `POST()` --calls--> `getSession()`  [EXTRACTED]
  app/api/admin/verify-operator/route.ts → lib/auth.ts
- `GET()` --calls--> `getSession()`  [EXTRACTED]
  app/api/auth/me/route.ts → lib/auth.ts
- `POST()` --calls--> `getSession()`  [EXTRACTED]
  app/api/operator/tours/route.ts → lib/auth.ts
- `POST()` --calls--> `getSession()`  [EXTRACTED]
  app/api/reviews/route.ts → lib/auth.ts

## Import Cycles
- None detected.

## Communities (17 total, 4 thin omitted)

### Community 0 - "next"
Cohesion: 0.14
Nodes (14): ItineraryDay, OperatorProfilePageProps, ParkDetailPageProps, Footer(), Navbar(), SearchAutocomplete(), comfortColors, comfortLabels (+6 more)

### Community 1 - "prisma.ts"
Cohesion: 0.12
Nodes (13): AdminPage(), POST(), GET(), POST(), POST(), TravelerDashboardPage(), OperatorPortalPage(), OperatorItem (+5 more)

### Community 2 - "package.json"
Cohesion: 0.08
Nodes (22): eslintConfig, name, prisma, seed, private, version, prisma, bcryptjs (+14 more)

### Community 3 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "auth.ts"
Cohesion: 0.25
Nodes (10): POST(), POST(), POST(), createSession(), hashPassword(), JWT_SECRET, logout(), SessionPayload (+2 more)

### Community 5 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, tsx, @types/bcryptjs (+4 more)

### Community 6 - "tours/page.tsx"
Cohesion: 0.22
Nodes (4): comfortLabels, ToursPageProps, FilterSidebar(), FilterSidebarProps

### Community 7 - "dependencies"
Cohesion: 0.20
Nodes (10): dependencies, bcryptjs, clsx, jose, lucide-react, next, @prisma/client, react (+2 more)

### Community 8 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, db:push, db:seed, dev, dev:webpack, lint, start (+1 more)

### Community 9 - "layout.tsx"
Cohesion: 0.33
Nodes (4): app_globals, cormorant, dmSans, metadata

### Community 10 - "tours/[slug]/page.tsx"
Cohesion: 0.40
Nodes (4): comfortLabel, getTourImage(), TourDetailPage(), TourDetailPageProps

### Community 11 - "inquiries/route.ts"
Cohesion: 0.60
Nodes (3): POST(), LeadEmailPayload, sendLeadNotificationEmail()

### Community 12 - "next-env.d.ts"
Cohesion: 0.50
Nodes (3): next_dev_types_root_params_d, next_dev_types_routes_d, NOTE: This file should not be edited

## Knowledge Gaps
- **85 isolated node(s):** `ItineraryDay`, `OperatorProfilePageProps`, `ParkDetailPageProps`, `TourCardProps`, `OperatorItem` (+80 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 115 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `prisma.ts`, `package.json`, `auth.ts`, `tours/page.tsx`, `layout.tsx`, `tours/[slug]/page.tsx`, `inquiries/route.ts`, `robots.ts`, `next.config.ts`?**
  _High betweenness centrality (0.345) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `next` to `prisma.ts`, `package.json`, `tours/page.tsx`, `tours/[slug]/page.tsx`, `ImageGallery.tsx`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **What connects `ItineraryDay`, `OperatorProfilePageProps`, `ParkDetailPageProps` to the rest of the system?**
  _85 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.13937282229965156 - nodes in this community are weakly interconnected._
- **Should `prisma.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1225071225071225 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._