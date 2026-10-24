# Graph Report - safari-ascili  (2026-10-17)

## Corpus Check
- 125 files · ~597,056 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 2, .css 2, .example 1)

## Summary
- 582 nodes · 1088 edges · 62 communities (45 shown, 17 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2a4ca03c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app/page.tsx
- prisma.ts
- package.json
- compilerOptions
- Navbar.tsx
- Footer.tsx
- SortSelect.tsx
- Module Breakdown & Development Plan
- SafariAsili — Platform Audit, Gap Analysis & Comprehensive Implementation Roadmap
- getSession
- tours/[slug]/page.tsx
- 2.2 Proposed Solution & Architecture
- next-env.d.ts
- lucide-react
- dependencies
- 3. Core Focus Area 2: Payment Gateway Architecture (Stripe)
- postcss.config.mjs
- 9. Prioritized Phased Implementation Plan
- 2. Integrated Skills & Design System Engineering
- admin/reviews/page.tsx
- tours/new/page.tsx
- seed.ts
- auth.ts
- next
- SafariAsili - Master Implementation & Verification Checklist
- README.md
- devDependencies
- ReviewModerationQueue
- AGENTS.md
- rules/graphify.md
- workflows/graphify.md
- setup-db.sh
- stop-db.sh
- SafariAsili — Platform Audit, Gap Analysis & Comprehensive Implementation Roadmap
- operators/page.tsx
- images/route.ts
- complete-trips/route.ts
- operator-portal/page.tsx
- app/blog/page.tsx
- blogs/page.tsx
- my-trips/page.tsx
- search/page.tsx
- slots.ts
- blog/[id]/route.ts
- slots/route.ts
- app/reviews/page.tsx
- messages/route.ts
- blogs/[slug]/page.tsx
- Module 1: Database Setup & Prisma ORM Migration
- Reservation
- 2.2 Proposed Solution & Architecture
- 3. Core Focus Area 2: Payment Gateway Architecture (Stripe)
- 9. Prioritized Phased Implementation Plan
- images/page.tsx
- 6. Core Focus Area 5: Operator Portal & Agency CMS Gaps
- api/reviews/route.ts
- messages/page.tsx
- next_types_root_params_d
- next_types_routes_d

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
- `4.3 Actionable Technical Upgrades` --references--> `Reservation`  [INFERRED]
  ROADMAP.md → app/operator-portal/reservations/[id]/page.tsx
- `1. Executive Summary & Codebase State` --references--> `Reservation`  [INFERRED]
  SAFARIASILI_COMPREHENSIVE_AUDIT_AND_ROADMAP.md → app/operator-portal/reservations/[id]/page.tsx
- `4.3 Actionable Technical Upgrades` --references--> `Reservation`  [INFERRED]
  SAFARIASILI_COMPREHENSIVE_AUDIT_AND_ROADMAP.md → app/operator-portal/reservations/[id]/page.tsx
- `5.2 Key Traveler UX Upgrades` --references--> `BookingBox()`  [INFERRED]
  ROADMAP.md → components/BookingBox.tsx
- `5.2 Key Traveler UX Upgrades` --references--> `BookingBox()`  [INFERRED]
  SAFARIASILI_COMPREHENSIVE_AUDIT_AND_ROADMAP.md → components/BookingBox.tsx

## Import Cycles
- None detected.

## Communities (62 total, 17 thin omitted)

### Community 0 - "app/page.tsx"
Cohesion: 0.06
Nodes (35): siteDestinations, dynamic, ExpertPageProps, dynamic, OperatorProfilePage(), OperatorProfilePageProps, dynamic, getRealStats() (+27 more)

### Community 1 - "prisma.ts"
Cohesion: 0.12
Nodes (3): POST(), globalForPrisma, prisma

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (42): BlogPostForm(), BlogPostFormProps, TAGS, RichTextEditor(), RichTextEditorProps, eslintConfig, name, prisma (+34 more)

### Community 3 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "Navbar.tsx"
Cohesion: 0.22
Nodes (5): steps, EMPTY, NavbarSearch(), NavbarSearchProps, SearchResults

### Community 5 - "Footer.tsx"
Cohesion: 0.14
Nodes (3): faqs, Footer(), Navbar()

### Community 7 - "Module Breakdown & Development Plan"
Cohesion: 0.14
Nodes (13): Executive Summary & System Architecture, Module 10: Performance Optimization & SEO Standards, Module 2: Authentication, User Roles & Sessions, Module 3: Tour Search & Faceted Filtering Engine, Module 4: Tour Detail, Interactive Itinerary & Maps, Module 5: National Park & Destination Guides (SEO Engine), Module 6: Custom Multi-Operator Quote Request Wizard, Module 7: Operator Portal & Proposal Manager (+5 more)

### Community 8 - "SafariAsili — Platform Audit, Gap Analysis & Comprehensive Implementation Roadmap"
Cohesion: 0.20
Nodes (9): 6.1 Missing Agency Profile & Licensing CMS, 6.2 Tour Package Builder Enhancements, 6.3 Quote Proposal Generator, 6. Core Focus Area 5: Operator Portal & Agency CMS Gaps, 7.1 Review Moderation Queue (`/admin/reviews`), 7.2 Operator KYC & Verification Desk (`/admin/operators`), 7.3 Financial Reporting & Commission Desk, 7. Core Focus Area 6: Platform Trust, Moderation & Admin Panel (+1 more)

### Community 9 - "getSession"
Cohesion: 0.11
Nodes (20): AdminPage(), AdminReviewsPage(), GET(), POST(), recalculateOperatorRating(), GET(), GET(), POST() (+12 more)

### Community 10 - "tours/[slug]/page.tsx"
Cohesion: 0.07
Nodes (30): app_globals, bodyFont, displayFont, metadata, RootLayout(), comfortLabel, dynamic, getTourImage() (+22 more)

### Community 11 - "2.2 Proposed Solution & Architecture"
Cohesion: 0.40
Nodes (5): 2.1 The Problem with the Current Architecture, 2.2 Proposed Solution & Architecture, 2. Core Focus Area 1: Agency-Wide Slot & Fleet Inventory Management, A. Database Schema Enhancements (`prisma/schema.prisma`), B. Operator Portal: Unified Departure Matrix (`/operator-portal/slots`)

### Community 12 - "next-env.d.ts"
Cohesion: 0.50
Nodes (3): next_dev_types_root_params_d, next_dev_types_routes_d, NOTE: This file should not be edited

### Community 13 - "lucide-react"
Cohesion: 0.13
Nodes (8): demoAccounts, Props, Slot, ImageGalleryProps, OperatorItem, OperatorVerificationTable(), lucide-react, react

### Community 14 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, bcryptjs, clsx, jose, lucide-react, next, @prisma/client, react (+7 more)

### Community 15 - "3. Core Focus Area 2: Payment Gateway Architecture (Stripe)"
Cohesion: 0.40
Nodes (5): 3.1 Current Status & Gap, 3.2 Marketplace Monetization & Payment Flow, 3.3 Database Models for Payments (`prisma/schema.prisma`), 3.4 Key Implementation Deliverables, 3. Core Focus Area 2: Payment Gateway Architecture (Stripe)

### Community 17 - "9. Prioritized Phased Implementation Plan"
Cohesion: 0.40
Nodes (5): 9. Prioritized Phased Implementation Plan, Phase 1: High Priority Core Foundations & UX Fixes, Phase 2: Stripe Payment Gateway & Escrow, Phase 3: Operator CMS & Traveler Experience, Phase 4: Production Scaling, Cloud Storage & SEO

### Community 18 - "2. Integrated Skills & Design System Engineering"
Cohesion: 0.18
Nodes (10): 1. Executive Summary & Architecture Overview, 1. `frontend-design` (Distinctive, Production-Grade UI), 2. Integrated Skills & Design System Engineering, 2. `nextjs-app-router-patterns` (Full-Stack Architecture), 3. Docker Self-Hosted Setup (PostgreSQL 17), 3. `typescript-pro` (Strict Type Safety), 4. `design-to-code` (Responsive Systems & WCAG Accessibility), 4. Master Checklist (+2 more)

### Community 24 - "seed.ts"
Cohesion: 0.08
Nodes (21): AGENCIES, CORE_EXCL, CORE_INCL, DESTINATIONS, extractedDestinations, extractedOperators, extractedTours, prisma (+13 more)

### Community 25 - "auth.ts"
Cohesion: 0.25
Nodes (10): POST(), POST(), POST(), createSession(), hashPassword(), JWT_SECRET, logout(), SessionPayload (+2 more)

### Community 28 - "next"
Cohesion: 0.18
Nodes (6): dynamic, dynamic, fallbackCountries, BlogPostActions(), nextConfig, next

### Community 29 - "SafariAsili - Master Implementation & Verification Checklist"
Cohesion: 0.40
Nodes (4): 📊 Overall Progress Summary, 🚦 Production Build Status, SafariAsili - Master Implementation & Verification Checklist, 🎨 UI Refinement & Craft Summary (`frontend-design` & `design-to-code`)

### Community 30 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 33 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, tsx, @types/bcryptjs (+4 more)

### Community 34 - "ReviewModerationQueue"
Cohesion: 1.00
Nodes (3): ReviewModerationQueue(), handleDecision(), loadReviews()

### Community 44 - "SafariAsili — Platform Audit, Gap Analysis & Comprehensive Implementation Roadmap"
Cohesion: 0.22
Nodes (8): FAQPage(), 7.1 Review Moderation Queue (`/admin/reviews`), 7.2 Operator KYC & Verification Desk (`/admin/operators`), 7.3 Financial Reporting & Commission Desk, 7. Core Focus Area 6: Platform Trust, Moderation & Admin Panel, 8. Core Focus Area 7: Technical Infrastructure, Security & SEO, SafariAsili — Platform Audit, Gap Analysis & Comprehensive Implementation Roadmap, 8. Core Focus Area 7: Technical Infrastructure, Security & SEO

### Community 45 - "operators/page.tsx"
Cohesion: 0.40
Nodes (3): dynamic, OperatorFilterSidebar(), OperatorFilterSidebarProps

### Community 46 - "images/route.ts"
Cohesion: 0.36
Nodes (8): ALLOWED, assertOwnership(), DELETE(), dynamic, GET(), PATCH(), POST(), resolveOperatorId()

### Community 47 - "complete-trips/route.ts"
Cohesion: 0.60
Nodes (3): GET(), POST, completeElapsedTrips()

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
Cohesion: 0.24
Nodes (8): POST(), LeadEmailPayload, sendLeadNotificationEmail(), ACTIVE_STATUSES, bookedTravelersForSlot(), getTourAvailability(), resolveSlotForBooking(), SlotAvailability

### Community 54 - "blog/[id]/route.ts"
Cohesion: 0.60
Nodes (3): DELETE(), PATCH(), resolveOperatorId()

### Community 55 - "slots/route.ts"
Cohesion: 0.60
Nodes (3): DELETE(), POST(), resolveOperatorId()

### Community 58 - "messages/route.ts"
Cohesion: 0.83
Nodes (3): GET(), POST(), resolveOperatorId()

### Community 59 - "blogs/[slug]/page.tsx"
Cohesion: 0.67
Nodes (3): BlogPostPage(), dynamic, getPost()

### Community 60 - "Module 1: Database Setup & Prisma ORM Migration"
Cohesion: 0.33
Nodes (6): Message, Module 1: Database Setup & Prisma ORM Migration, 1. Executive Summary & Codebase State, Tour, TourDay, TourDestination

### Community 62 - "Reservation"
Cohesion: 0.20
Nodes (10): Reservation, 1. Executive Summary & Codebase State, 4.1 Current Limitations, 4.2 Comprehensive Messaging Redesign, 4.3 Actionable Technical Upgrades, 4. Core Focus Area 3: Bidirectional Two-Way Communication System, 4.1 Current Limitations, 4.2 Comprehensive Messaging Redesign (+2 more)

### Community 63 - "2.2 Proposed Solution & Architecture"
Cohesion: 0.40
Nodes (5): 2.1 The Problem with the Current Architecture, 2.2 Proposed Solution & Architecture, 2. Core Focus Area 1: Agency-Wide Slot & Fleet Inventory Management, A. Database Schema Enhancements (`prisma/schema.prisma`), B. Operator Portal: Unified Departure Matrix (`/operator-portal/slots`)

### Community 64 - "3. Core Focus Area 2: Payment Gateway Architecture (Stripe)"
Cohesion: 0.40
Nodes (5): 3.1 Current Status & Gap, 3.2 Marketplace Monetization & Payment Flow, 3.3 Database Models for Payments (`prisma/schema.prisma`), 3.4 Key Implementation Deliverables, 3. Core Focus Area 2: Payment Gateway Architecture (Stripe)

### Community 65 - "9. Prioritized Phased Implementation Plan"
Cohesion: 0.40
Nodes (5): 9. Prioritized Phased Implementation Plan, Phase 1: High Priority Core Foundations & UX Fixes, Phase 2: Stripe Payment Gateway & Escrow, Phase 3: Operator CMS & Traveler Experience, Phase 4: Production Scaling, Cloud Storage & SEO

### Community 66 - "images/page.tsx"
Cohesion: 0.67
Nodes (3): ImageRow, kb(), TourImagesPage()

### Community 68 - "6. Core Focus Area 5: Operator Portal & Agency CMS Gaps"
Cohesion: 0.50
Nodes (4): 6.1 Missing Agency Profile & Licensing CMS, 6.2 Tour Package Builder Enhancements, 6.3 Quote Proposal Generator, 6. Core Focus Area 5: Operator Portal & Agency CMS Gaps

## Knowledge Gaps
- **240 isolated node(s):** `POST`, `dynamic`, `ALLOWED`, `siteDestinations`, `dynamic` (+235 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 313 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `app/page.tsx`, `prisma.ts`, `package.json`, `Navbar.tsx`, `Footer.tsx`, `SortSelect.tsx`, `getSession`, `tours/[slug]/page.tsx`, `lucide-react`, `admin/reviews/page.tsx`, `tours/new/page.tsx`, `register/page.tsx`, `auth.ts`, `operators/page.tsx`, `images/route.ts`, `complete-trips/route.ts`, `operator-portal/page.tsx`, `app/blog/page.tsx`, `blogs/page.tsx`, `my-trips/page.tsx`, `search/page.tsx`, `slots.ts`, `blog/[id]/route.ts`, `slots/route.ts`, `request/page.tsx`, `app/reviews/page.tsx`, `messages/route.ts`, `blogs/[slug]/page.tsx`, `images/page.tsx`, `api/reviews/route.ts`, `messages/page.tsx`?**
  _High betweenness centrality (0.323) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `lucide-react` to `app/page.tsx`, `package.json`, `Navbar.tsx`, `Footer.tsx`, `tours/[slug]/page.tsx`, `admin/reviews/page.tsx`, `tours/new/page.tsx`, `register/page.tsx`, `next`, `operators/page.tsx`, `operator-portal/page.tsx`, `app/blog/page.tsx`, `blogs/page.tsx`, `my-trips/page.tsx`, `search/page.tsx`, `request/page.tsx`, `app/reviews/page.tsx`, `blogs/[slug]/page.tsx`, `images/page.tsx`, `messages/page.tsx`?**
  _High betweenness centrality (0.138) - this node is a cross-community bridge._
- **Why does `Reservation` connect `Reservation` to `Module 1: Database Setup & Prisma ORM Migration`, `lucide-react`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **What connects `POST`, `dynamic`, `ALLOWED` to the rest of the system?**
  _240 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06207482993197279 - nodes in this community are weakly interconnected._
- **Should `prisma.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11956521739130435 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.045068027210884355 - nodes in this community are weakly interconnected._