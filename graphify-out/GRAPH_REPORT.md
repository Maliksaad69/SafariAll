# Graph Report - safari-ascili  (2026-10-17)

## Corpus Check
- 124 files · ~600,052 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 2, .css 2, .example 1)

## Summary
- 742 nodes · 1239 edges · 65 communities (47 shown, 18 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f22f9ea5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app/page.tsx
- prisma.ts
- package.json
- compilerOptions
- SAFARIBOOKINGS_CLONE_SPEC.md
- Footer.tsx
- SortSelect.tsx
- Module Breakdown & Development Plan
- scripts
- getSession
- tours/[slug]/page.tsx
- inquiries/route.ts
- next-env.d.ts
- Navbar.tsx
- dependencies
- 126. Page-by-Page Implementation Order
- postcss.config.mjs
- 13. Homepage Sections
- 2. Integrated Skills & Design System Engineering
- 85. Component Inventory
- 150. Final Build Checklist
- 57. Required Animations
- 7.2 Header States
- 12.2 Hero Search
- seed.ts
- auth.ts
- BlogPostForm.tsx
- 127. Exact Clone Acceptance Criteria
- next
- SafariAsili - Master Implementation & Verification Checklist
- README.md
- 50. Responsive Rules
- lucide-react
- devDependencies
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
- images/route.ts
- reservations/route.ts
- operator-portal/page.tsx
- app/blog/page.tsx
- blogs/page.tsx
- my-trips/page.tsx
- search/page.tsx
- slots.ts
- blog/[id]/route.ts
- slots/route.ts
- parks/[slug]/page.tsx
- app/reviews/page.tsx
- messages/route.ts
- blogs/[slug]/page.tsx
- parks/page.tsx
- eslint.config.mjs
- reservations/[id]/page.tsx
- tours/new/page.tsx

## God Nodes (most connected - your core abstractions)
1. `next` - 87 edges
2. `lucide-react` - 60 edges
3. `getSession()` - 46 edges
4. `Footer()` - 41 edges
5. `Navbar()` - 41 edges
6. `prisma` - 41 edges
7. `react` - 29 edges
8. `compilerOptions` - 16 edges
9. `scripts` - 12 edges
10. `Module Breakdown & Development Plan` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Module 1: Database Setup & Prisma ORM Migration` --references--> `Message`  [INFERRED]
  FINAL_TECHNICAL_DOCUMENTATION.md → app/operator-portal/reservations/[id]/page.tsx
- `Module 1: Database Setup & Prisma ORM Migration` --references--> `Tour`  [INFERRED]
  FINAL_TECHNICAL_DOCUMENTATION.md → types/tour.ts
- `Module 1: Database Setup & Prisma ORM Migration` --references--> `TourDestination`  [INFERRED]
  FINAL_TECHNICAL_DOCUMENTATION.md → types/tour.ts
- `POST()` --calls--> `getSession()`  [EXTRACTED]
  app/api/admin/verify-operator/route.ts → lib/auth.ts
- `POST()` --calls--> `getSession()`  [EXTRACTED]
  app/api/reservations/route.ts → lib/auth.ts

## Import Cycles
- None detected.

## Communities (65 total, 18 thin omitted)

### Community 0 - "app/page.tsx"
Cohesion: 0.06
Nodes (34): siteDestinations, dynamic, ExpertPageProps, dynamic, dynamic, OperatorProfilePage(), OperatorProfilePageProps, dynamic (+26 more)

### Community 1 - "prisma.ts"
Cohesion: 0.11
Nodes (4): POST(), POST(), globalForPrisma, prisma

### Community 2 - "package.json"
Cohesion: 0.10
Nodes (19): name, prisma, seed, private, version, clsx, prisma, react-dom (+11 more)

### Community 3 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "SAFARIBOOKINGS_CLONE_SPEC.md"
Cohesion: 0.01
Nodes (146): 100. Dynamic Homepage, 101. Dynamic Country Page, 102. Dynamic Park Page, 103. Dynamic Tour Detail, 104. Dynamic Operator Detail, 105. Route Registry, 106. Important Routing Collision Rule, 107. SEO Slugs (+138 more)

### Community 5 - "Footer.tsx"
Cohesion: 0.12
Nodes (4): faqs, steps, Footer(), Navbar()

### Community 7 - "Module Breakdown & Development Plan"
Cohesion: 0.11
Nodes (18): Message, Executive Summary & System Architecture, Module 10: Performance Optimization & SEO Standards, Module 1: Database Setup & Prisma ORM Migration, Module 2: Authentication, User Roles & Sessions, Module 3: Tour Search & Faceted Filtering Engine, Module 4: Tour Detail, Interactive Itinerary & Maps, Module 5: National Park & Destination Guides (SEO Engine) (+10 more)

### Community 8 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:push, db:seed, db:seed:extracted, db:start, db:stop, dev (+4 more)

### Community 9 - "getSession"
Cohesion: 0.12
Nodes (18): AdminPage(), AdminReviewsPage(), GET(), POST(), recalculateOperatorRating(), GET(), GET(), POST() (+10 more)

### Community 10 - "tours/[slug]/page.tsx"
Cohesion: 0.08
Nodes (24): app_globals, bodyFont, displayFont, metadata, RootLayout(), comfortLabel, dynamic, getTourImage() (+16 more)

### Community 11 - "inquiries/route.ts"
Cohesion: 0.60
Nodes (3): POST(), LeadEmailPayload, sendLeadNotificationEmail()

### Community 12 - "next-env.d.ts"
Cohesion: 0.50
Nodes (3): NOTE: This file should not be edited, next_types_root_params_d, next_types_routes_d

### Community 13 - "Navbar.tsx"
Cohesion: 0.11
Nodes (8): Thread, ImageGalleryProps, EMPTY, NavbarSearch(), NavbarSearchProps, SearchResults, ReviewItem, react

### Community 14 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, bcryptjs, clsx, jose, lucide-react, next, @prisma/client, react (+7 more)

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

### Community 24 - "seed.ts"
Cohesion: 0.08
Nodes (21): AGENCIES, CORE_EXCL, CORE_INCL, DESTINATIONS, extractedDestinations, extractedOperators, extractedTours, prisma (+13 more)

### Community 25 - "auth.ts"
Cohesion: 0.25
Nodes (10): POST(), POST(), POST(), createSession(), hashPassword(), JWT_SECRET, logout(), SessionPayload (+2 more)

### Community 26 - "BlogPostForm.tsx"
Cohesion: 0.18
Nodes (8): BlogPostForm(), BlogPostFormProps, TAGS, RichTextEditor(), RichTextEditorProps, @tiptap/extension-image, @tiptap/react, @tiptap/starter-kit

### Community 27 - "127. Exact Clone Acceptance Criteria"
Cohesion: 0.33
Nodes (6): 127. Exact Clone Acceptance Criteria, Dynamic, Functional, Quality, Responsive, Visual

### Community 28 - "next"
Cohesion: 0.19
Nodes (7): dynamic, ImageRow, kb(), TourImagesPage(), BlogPostActions(), nextConfig, next

### Community 29 - "SafariAsili - Master Implementation & Verification Checklist"
Cohesion: 0.40
Nodes (4): 📊 Overall Progress Summary, 🚦 Production Build Status, SafariAsili - Master Implementation & Verification Checklist, 🎨 UI Refinement & Craft Summary (`frontend-design` & `design-to-code`)

### Community 30 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 31 - "50. Responsive Rules"
Cohesion: 0.50
Nodes (4): 50. Responsive Rules, Desktop, Mobile, Tablet

### Community 32 - "lucide-react"
Cohesion: 0.20
Nodes (6): demoAccounts, Props, Slot, OperatorItem, OperatorVerificationTable(), lucide-react

### Community 33 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, tsx, @types/bcryptjs (+4 more)

### Community 34 - "ReviewModerationQueue"
Cohesion: 1.00
Nodes (3): ReviewModerationQueue(), handleDecision(), loadReviews()

### Community 46 - "images/route.ts"
Cohesion: 0.36
Nodes (8): ALLOWED, assertOwnership(), DELETE(), dynamic, GET(), PATCH(), POST(), resolveOperatorId()

### Community 47 - "reservations/route.ts"
Cohesion: 0.39
Nodes (5): GET(), POST, GET(), POST(), completeElapsedTrips()

### Community 48 - "operator-portal/page.tsx"
Cohesion: 0.33
Nodes (4): dynamic, OperatorPortalPage(), AgencyReservationsTable(), ReservationItem

### Community 49 - "app/blog/page.tsx"
Cohesion: 0.40
Nodes (5): BlogPage(), dynamic, evergreenPosts, getPosts(), Post

### Community 50 - "blogs/page.tsx"
Cohesion: 0.40
Nodes (5): BlogPage(), dynamic, evergreenPosts, getPosts(), Post

### Community 51 - "my-trips/page.tsx"
Cohesion: 0.47
Nodes (5): MyTripsPage(), STATUS_BADGE, STATUS_LABEL, statusBadge(), statusLabel()

### Community 52 - "search/page.tsx"
Cohesion: 0.40
Nodes (3): featuredDestinations, suggestedSearches, SearchAutocomplete()

### Community 53 - "slots.ts"
Cohesion: 0.47
Nodes (5): ACTIVE_STATUSES, bookedTravelersForSlot(), getTourAvailability(), resolveSlotForBooking(), SlotAvailability

### Community 54 - "blog/[id]/route.ts"
Cohesion: 0.60
Nodes (3): DELETE(), PATCH(), resolveOperatorId()

### Community 55 - "slots/route.ts"
Cohesion: 0.60
Nodes (3): DELETE(), POST(), resolveOperatorId()

### Community 56 - "parks/[slug]/page.tsx"
Cohesion: 0.50
Nodes (4): countryName(), dynamic, ParkDetailPage(), ParkDetailPageProps

### Community 58 - "messages/route.ts"
Cohesion: 0.83
Nodes (3): GET(), POST(), resolveOperatorId()

### Community 59 - "blogs/[slug]/page.tsx"
Cohesion: 0.67
Nodes (3): BlogPostPage(), dynamic, getPost()

### Community 61 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

## Knowledge Gaps
- **414 isolated node(s):** `POST`, `dynamic`, `ALLOWED`, `siteDestinations`, `dynamic` (+409 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 486 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `app/page.tsx`, `prisma.ts`, `package.json`, `Footer.tsx`, `SortSelect.tsx`, `getSession`, `tours/[slug]/page.tsx`, `inquiries/route.ts`, `Navbar.tsx`, `auth.ts`, `BlogPostForm.tsx`, `lucide-react`, `images/route.ts`, `reservations/route.ts`, `operator-portal/page.tsx`, `app/blog/page.tsx`, `blogs/page.tsx`, `my-trips/page.tsx`, `search/page.tsx`, `blog/[id]/route.ts`, `slots/route.ts`, `parks/[slug]/page.tsx`, `app/reviews/page.tsx`, `messages/route.ts`, `blogs/[slug]/page.tsx`, `parks/page.tsx`, `reservations/[id]/page.tsx`, `tours/new/page.tsx`, `register/page.tsx`?**
  _High betweenness centrality (0.161) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `lucide-react` to `app/page.tsx`, `package.json`, `Footer.tsx`, `tours/[slug]/page.tsx`, `Navbar.tsx`, `BlogPostForm.tsx`, `next`, `operator-portal/page.tsx`, `app/blog/page.tsx`, `blogs/page.tsx`, `my-trips/page.tsx`, `search/page.tsx`, `parks/[slug]/page.tsx`, `app/reviews/page.tsx`, `blogs/[slug]/page.tsx`, `parks/page.tsx`, `reservations/[id]/page.tsx`, `tours/new/page.tsx`, `register/page.tsx`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `Message` connect `Module Breakdown & Development Plan` to `reservations/[id]/page.tsx`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `POST`, `dynamic`, `ALLOWED` to the rest of the system?**
  _414 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05877551020408163 - nodes in this community are weakly interconnected._
- **Should `prisma.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10541310541310542 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._