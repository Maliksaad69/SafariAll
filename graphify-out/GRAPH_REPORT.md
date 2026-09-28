# Graph Report - safari-ascili  (2026-09-28)

## Corpus Check
- 92 files · ~564,103 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 2, .example 1, .ico 1)

## Summary
- 603 nodes · 928 edges · 38 communities (26 shown, 12 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ed370fea`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- site-data.ts
- getSession
- package.json
- compilerOptions
- SAFARIBOOKINGS_CLONE_SPEC.md
- next
- tours/page.tsx
- Module Breakdown & Development Plan
- scripts
- tours/[slug]/page.tsx
- inquiries/route.ts
- next-env.d.ts
- 126. Page-by-Page Implementation Order
- postcss.config.mjs
- 13. Homepage Sections
- 2. Integrated Skills & Design System Engineering
- 85. Component Inventory
- 150. Final Build Checklist
- 57. Required Animations
- 7.2 Header States
- 12.2 Hero Search
- seed-destination-content.ts
- 127. Exact Clone Acceptance Criteria
- SafariAsili - Master Implementation & Verification Checklist
- README.md
- 50. Responsive Rules
- ReviewModerationQueue
- AGENTS.md
- rules/graphify.md
- workflows/graphify.md
- SafariBookings — Full Site Reverse-Engineering & Clone Specification
- 3. Existing Project Constraints
- 8. Navigation Rules
- setup-db.sh
- stop-db.sh
- next_dev_types_root_params_d
- next_dev_types_routes_d

## God Nodes (most connected - your core abstractions)
1. `next` - 59 edges
2. `lucide-react` - 43 edges
3. `Footer()` - 29 edges
4. `Navbar()` - 29 edges
5. `getSession()` - 25 edges
6. `prisma` - 23 edges
7. `react` - 20 edges
8. `compilerOptions` - 16 edges
9. `scripts` - 12 edges
10. `Module Breakdown & Development Plan` - 11 edges

## Surprising Connections (you probably didn't know these)
- `AdminPage()` --calls--> `getSession()`  [EXTRACTED]
  app/admin/page.tsx → lib/auth.ts
- `AdminReviewsPage()` --calls--> `getSession()`  [EXTRACTED]
  app/admin/reviews/page.tsx → lib/auth.ts
- `GET()` --calls--> `getSession()`  [EXTRACTED]
  app/api/admin/reviews/route.ts → lib/auth.ts
- `POST()` --calls--> `getSession()`  [EXTRACTED]
  app/api/admin/verify-operator/route.ts → lib/auth.ts
- `GET()` --calls--> `getSession()`  [EXTRACTED]
  app/api/auth/me/route.ts → lib/auth.ts

## Import Cycles
- None detected.

## Communities (38 total, 12 thin omitted)

### Community 0 - "site-data.ts"
Cohesion: 0.06
Nodes (32): siteDestinations, dynamic, ExpertPageProps, app_globals, metadata, RootLayout(), dynamic, OperatorProfilePage() (+24 more)

### Community 1 - "getSession"
Cohesion: 0.06
Nodes (34): AdminPage(), AdminReviewsPage(), GET(), POST(), recalculateOperatorRating(), POST(), POST(), POST() (+26 more)

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (43): eslintConfig, dependencies, bcryptjs, clsx, jose, lucide-react, next, @prisma/client (+35 more)

### Community 3 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "SAFARIBOOKINGS_CLONE_SPEC.md"
Cohesion: 0.01
Nodes (146): 100. Dynamic Homepage, 101. Dynamic Country Page, 102. Dynamic Park Page, 103. Dynamic Tour Detail, 104. Dynamic Operator Detail, 105. Route Registry, 106. Important Routing Collision Rule, 107. SEO Slugs (+138 more)

### Community 5 - "next"
Cohesion: 0.05
Nodes (32): posts, faqs, steps, demoAccounts, dynamic, ItineraryDay, dynamic, dynamic (+24 more)

### Community 6 - "tours/page.tsx"
Cohesion: 0.19
Nodes (10): durationBucket(), dynamic, ToursPage(), ToursPageProps, durationOptions, FilterSidebar(), FilterSidebarProps, safariCountries (+2 more)

### Community 7 - "Module Breakdown & Development Plan"
Cohesion: 0.13
Nodes (14): Executive Summary & System Architecture, Module 10: Performance Optimization & SEO Standards, Module 1: Database Setup & Prisma ORM Migration, Module 2: Authentication, User Roles & Sessions, Module 3: Tour Search & Faceted Filtering Engine, Module 4: Tour Detail, Interactive Itinerary & Maps, Module 5: National Park & Destination Guides (SEO Engine), Module 6: Custom Multi-Operator Quote Request Wizard (+6 more)

### Community 8 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:push, db:seed, db:seed:extracted, db:start, db:stop, dev (+4 more)

### Community 10 - "tours/[slug]/page.tsx"
Cohesion: 0.14
Nodes (14): comfortLabel, dynamic, getTourImage(), TourDetailPage(), TourDetailPageProps, BookingBox(), BookingBoxProps, generateDepartures() (+6 more)

### Community 11 - "inquiries/route.ts"
Cohesion: 0.60
Nodes (3): POST(), LeadEmailPayload, sendLeadNotificationEmail()

### Community 12 - "next-env.d.ts"
Cohesion: 0.50
Nodes (3): NOTE: This file should not be edited, next_types_root_params_d, next_types_routes_d

### Community 15 - "126. Page-by-Page Implementation Order"
Cohesion: 0.18
Nodes (11): 126. Page-by-Page Implementation Order, Phase 1, Phase 10, Phase 2, Phase 3, Phase 4, Phase 5, Phase 6 (+3 more)

### Community 17 - "13. Homepage Sections"
Cohesion: 0.18
Nodes (11): 13. Homepage Sections, A. Trust / value strip, B. Top-rated Safari Countries, C. Popular Safari Tours, D. All Tours CTA, E. Top Rated Tour Operators, F. Latest Blog Posts, G. SafariBookings Experts (+3 more)

### Community 18 - "2. Integrated Skills & Design System Engineering"
Cohesion: 0.18
Nodes (10): 1. Executive Summary & Architecture Overview, 1. `frontend-design` (Distinctive, Production-Grade UI), 2. Integrated Skills & Design System Engineering, 2. `nextjs-app-router-patterns` (Full-Stack Architecture), 3. Docker Self-Hosted Setup (PostgreSQL 17), 3. `typescript-pro` (Strict Type Safety), 4. `design-to-code` (Responsive Systems & WCAG Accessibility), 4. Master Checklist (+2 more)

### Community 19 - "85. Component Inventory"
Cohesion: 0.20
Nodes (10): 85. Component Inventory, Blog, Common, Destinations, Experts, Navigation, Operators, Reviews (+2 more)

### Community 20 - "150. Final Build Checklist"
Cohesion: 0.22
Nodes (9): 150. Final Build Checklist, Architecture, Content, Destinations, Engineering, Homepage, Operators, Tours (+1 more)

### Community 21 - "57. Required Animations"
Cohesion: 0.22
Nodes (9): 57. Required Animations, Buttons, Cards, Filters, Image gallery, Mobile menu, Modals, Navigation (+1 more)

### Community 22 - "7.2 Header States"
Cohesion: 0.25
Nodes (8): 7.1 Desktop Header, 7.2 Header States, 7. Header / Navigation, Active, Default, Hover, Mobile, Search Open

### Community 23 - "12.2 Hero Search"
Cohesion: 0.29
Nodes (7): 12.1 Hero, 12.2 Hero Search, 12. Home Page, Date picker, Destination field, Submit, Travelers

### Community 24 - "seed-destination-content.ts"
Cohesion: 0.29
Nodes (5): DATA, prisma, SectionKey, SECTIONS, SeedDestination

### Community 27 - "127. Exact Clone Acceptance Criteria"
Cohesion: 0.33
Nodes (6): 127. Exact Clone Acceptance Criteria, Dynamic, Functional, Quality, Responsive, Visual

### Community 29 - "SafariAsili - Master Implementation & Verification Checklist"
Cohesion: 0.40
Nodes (4): 📊 Overall Progress Summary, 🚦 Production Build Status, SafariAsili - Master Implementation & Verification Checklist, 🎨 UI Refinement & Craft Summary (`frontend-design` & `design-to-code`)

### Community 30 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 31 - "50. Responsive Rules"
Cohesion: 0.50
Nodes (4): 50. Responsive Rules, Desktop, Mobile, Tablet

### Community 34 - "ReviewModerationQueue"
Cohesion: 1.00
Nodes (3): ReviewModerationQueue(), handleDecision(), loadReviews()

## Knowledge Gaps
- **374 isolated node(s):** `siteDestinations`, `posts`, `dynamic`, `dynamic`, `ExpertPageProps` (+369 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 429 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `site-data.ts`, `getSession`, `package.json`, `tours/page.tsx`, `tours/[slug]/page.tsx`, `inquiries/route.ts`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `next` to `site-data.ts`, `tours/[slug]/page.tsx`, `package.json`, `tours/page.tsx`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `@prisma/client` connect `getSession` to `seed-destination-content.ts`, `package.json`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `siteDestinations`, `posts`, `dynamic` to the rest of the system?**
  _374 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `site-data.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0647342995169082 - nodes in this community are weakly interconnected._
- **Should `getSession` be split into smaller, more focused modules?**
  _Cohesion score 0.060655737704918035 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._