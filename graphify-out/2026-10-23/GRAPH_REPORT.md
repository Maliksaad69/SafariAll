# Graph Report - safari-ascili  (2026-10-21)

## Corpus Check
- 152 files · ~659,835 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: (none) 4, .css 2, .example 1)

## Summary
- 714 nodes · 1453 edges · 60 communities (44 shown, 16 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `772302d2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- tours/page.tsx
- prisma.ts
- package.json
- compilerOptions
- Navbar.tsx
- Footer.tsx
- SortSelect.tsx
- Module Breakdown & Development Plan
- 6. Core Focus Area 5: Operator Portal & Agency CMS Gaps
- getSession
- tours/[slug]/page.tsx
- 2.2 Proposed Solution & Architecture
- next-env.d.ts
- lucide-react
- dependencies
- SafariAsili — Platform Audit, Gap Analysis & Comprehensive Implementation Roadmap
- postcss.config.mjs
- 9. Prioritized Phased Implementation Plan
- 2. Integrated Skills & Design System Engineering
- admin/reviews/page.tsx
- tours/new/page.tsx
- ReservationChat.tsx
- scripts
- app/page.tsx
- seed.ts
- catalog.ts
- layout.tsx
- operators/[slug]/page.tsx
- next
- SafariAsili - Master Implementation & Verification Checklist
- README.md
- seed-destination-content.ts
- experts/[id]/page.tsx
- 7. Core Focus Area 6: Platform Trust, Moderation & Admin Panel
- postgres/README.md
- AGENTS.md
- rules/graphify.md
- workflows/graphify.md
- SOURCES.md
- next_dev_types_root_params_d
- next_dev_types_routes_d
- setup-db.sh
- stop-db.sh
- 7. Core Focus Area 6: Platform Trust, Moderation & Admin Panel
- operators/page.tsx
- app/blog/page.tsx
- blogs/page.tsx
- my-trips/page.tsx
- search/page.tsx
- app/reviews/page.tsx
- chat.ts
- blogs/[slug]/page.tsx
- Reservation
- 4. Core Focus Area 3: Bidirectional Two-Way Communication System
- 2.2 Proposed Solution & Architecture
- 3. Core Focus Area 2: Payment Gateway Architecture (Stripe)
- SafariAsili — Platform Audit, Gap Analysis & Comprehensive Implementation Roadmap
- images/page.tsx
- messages/page.tsx

## God Nodes (most connected - your core abstractions)
1. `next` - 94 edges
2. `getSession()` - 60 edges
3. `lucide-react` - 55 edges
4. `prisma` - 51 edges
5. `Footer()` - 35 edges
6. `Navbar()` - 35 edges
7. `react` - 31 edges
8. `notifyChange()` - 16 edges
9. `scripts` - 16 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `4.3 Actionable Technical Upgrades` --references--> `Reservation`  [INFERRED]
  SAFARIASILI_COMPREHENSIVE_AUDIT_AND_ROADMAP.md → app/operator-portal/reservations/[id]/page.tsx
- `5.2 Key Traveler UX Upgrades` --references--> `BookingBox()`  [INFERRED]
  ROADMAP.md → components/BookingBox.tsx
- `5.2 Key Traveler UX Upgrades` --references--> `BookingBox()`  [INFERRED]
  SAFARIASILI_COMPREHENSIVE_AUDIT_AND_ROADMAP.md → components/BookingBox.tsx
- `4.3 Actionable Technical Upgrades` --references--> `Reservation`  [INFERRED]
  ROADMAP.md → app/operator-portal/reservations/[id]/page.tsx
- `8. Core Focus Area 7: Technical Infrastructure, Security & SEO` --references--> `FAQPage()`  [INFERRED]
  ROADMAP.md → app/faq/page.tsx

## Import Cycles
- None detected.

## Communities (60 total, 16 thin omitted)

### Community 0 - "tours/page.tsx"
Cohesion: 0.19
Nodes (11): durationBucket(), dynamic, ToursPage(), ToursPageProps, durationOptions, FilterSidebar(), FilterSidebarProps, safariCountries (+3 more)

### Community 1 - "prisma.ts"
Cohesion: 0.05
Nodes (50): GET(), POST, POST(), dynamic, maxDuration, POST(), DELETE(), PATCH() (+42 more)

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (40): BlogPostForm(), BlogPostFormProps, TAGS, RichTextEditor(), RichTextEditorProps, eslintConfig, devDependencies, eslint (+32 more)

### Community 3 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "Navbar.tsx"
Cohesion: 0.22
Nodes (5): steps, EMPTY, NavbarSearch(), NavbarSearchProps, SearchResults

### Community 5 - "Footer.tsx"
Cohesion: 0.14
Nodes (7): faqs, dynamic, dynamic, dynamic, ParkDetailPageProps, Footer(), Navbar()

### Community 7 - "Module Breakdown & Development Plan"
Cohesion: 0.14
Nodes (13): Executive Summary & System Architecture, Module 10: Performance Optimization & SEO Standards, Module 2: Authentication, User Roles & Sessions, Module 3: Tour Search & Faceted Filtering Engine, Module 4: Tour Detail, Interactive Itinerary & Maps, Module 5: National Park & Destination Guides (SEO Engine), Module 6: Custom Multi-Operator Quote Request Wizard, Module 7: Operator Portal & Proposal Manager (+5 more)

### Community 8 - "6. Core Focus Area 5: Operator Portal & Agency CMS Gaps"
Cohesion: 0.50
Nodes (4): 6.1 Missing Agency Profile & Licensing CMS, 6.2 Tour Package Builder Enhancements, 6.3 Quote Proposal Generator, 6. Core Focus Area 5: Operator Portal & Agency CMS Gaps

### Community 9 - "getSession"
Cohesion: 0.06
Nodes (43): AdminPage(), AdminReviewsPage(), GET(), POST(), recalculateOperatorRating(), POST(), POST(), POST() (+35 more)

### Community 10 - "tours/[slug]/page.tsx"
Cohesion: 0.19
Nodes (10): comfortLabel, dynamic, getTourImage(), TourDetailPage(), TourDetailPageProps, FavoriteHeartButton(), FavoriteHeartButtonProps, TourReviewsWidget() (+2 more)

### Community 11 - "2.2 Proposed Solution & Architecture"
Cohesion: 0.40
Nodes (5): 2.1 The Problem with the Current Architecture, 2.2 Proposed Solution & Architecture, 2. Core Focus Area 1: Agency-Wide Slot & Fleet Inventory Management, A. Database Schema Enhancements (`prisma/schema.prisma`), B. Operator Portal: Unified Departure Matrix (`/operator-portal/slots`)

### Community 12 - "next-env.d.ts"
Cohesion: 0.50
Nodes (3): NOTE: This file should not be edited, next_types_root_params_d, next_types_routes_d

### Community 13 - "lucide-react"
Cohesion: 0.14
Nodes (8): demoAccounts, Props, Slot, ImageGalleryProps, OperatorItem, OperatorVerificationTable(), lucide-react, react

### Community 14 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, bcryptjs, clsx, jose, lucide-react, next, @prisma/client, react (+9 more)

### Community 15 - "SafariAsili — Platform Audit, Gap Analysis & Comprehensive Implementation Roadmap"
Cohesion: 0.15
Nodes (12): FAQPage(), 8. Core Focus Area 7: Technical Infrastructure, Security & SEO, 3.1 Current Status & Gap, 3.2 Marketplace Monetization & Payment Flow, 3.3 Database Models for Payments (`prisma/schema.prisma`), 3.4 Key Implementation Deliverables, 3. Core Focus Area 2: Payment Gateway Architecture (Stripe), 5.1 Critical UX Bug Identified During Code Audit (+4 more)

### Community 17 - "9. Prioritized Phased Implementation Plan"
Cohesion: 0.40
Nodes (5): 9. Prioritized Phased Implementation Plan, Phase 1: High Priority Core Foundations & UX Fixes, Phase 2: Stripe Payment Gateway & Escrow, Phase 3: Operator CMS & Traveler Experience, Phase 4: Production Scaling, Cloud Storage & SEO

### Community 18 - "2. Integrated Skills & Design System Engineering"
Cohesion: 0.18
Nodes (10): 1. Executive Summary & Architecture Overview, 1. `frontend-design` (Distinctive, Production-Grade UI), 2. Integrated Skills & Design System Engineering, 2. `nextjs-app-router-patterns` (Full-Stack Architecture), 3. Docker Self-Hosted Setup (PostgreSQL 17), 3. `typescript-pro` (Strict Type Safety), 4. `design-to-code` (Responsive Systems & WCAG Accessibility), 4. Master Checklist (+2 more)

### Community 19 - "admin/reviews/page.tsx"
Cohesion: 0.47
Nodes (4): ReviewItem, ReviewModerationQueue(), handleDecision(), loadReviews()

### Community 21 - "ReservationChat.tsx"
Cohesion: 0.12
Nodes (21): Attachment, ChatMessage, compressImage(), dayOf(), EMOJI, Handlers, httpControls(), loadPusherScript() (+13 more)

### Community 22 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, db:dump, db:migrate, db:push, db:reset, db:setup, db:start (+8 more)

### Community 23 - "app/page.tsx"
Cohesion: 0.31
Nodes (8): dynamic, getRealStats(), HomePage(), ParksPage(), HeroSearchForm(), getCountries(), getExperts(), getLatestBlogPosts()

### Community 24 - "seed.ts"
Cohesion: 0.12
Nodes (15): AGENCIES, CORE_EXCL, CORE_INCL, DESTINATIONS, extractedDestinations, extractedOperators, extractedTours, prisma (+7 more)

### Community 25 - "catalog.ts"
Cohesion: 0.28
Nodes (7): toTourCard(), tourCardInclude, TourCardRow, SiteOperator, SiteTour, TourComfortLevel, TourTypeValue

### Community 26 - "layout.tsx"
Cohesion: 0.33
Nodes (6): app_globals, bodyFont, displayFont, metadata, RootLayout(), buildOrganizationSchema()

### Community 27 - "operators/[slug]/page.tsx"
Cohesion: 0.38
Nodes (6): dynamic, OperatorProfilePage(), OperatorProfilePageProps, ParkDetailPage(), getTourCards(), buildOperatorSchema()

### Community 28 - "next"
Cohesion: 0.15
Nodes (4): dynamic, BlogPostActions(), nextConfig, next

### Community 29 - "SafariAsili - Master Implementation & Verification Checklist"
Cohesion: 0.40
Nodes (4): 📊 Overall Progress Summary, 🚦 Production Build Status, SafariAsili - Master Implementation & Verification Checklist, 🎨 UI Refinement & Craft Summary (`frontend-design` & `design-to-code`)

### Community 30 - "README.md"
Cohesion: 0.29
Nodes (6): Database (PostgreSQL in Docker), Deploy on Vercel, Deploying to Vercel (or Netlify), Getting Started, Learn More, Real-time reservation chat

### Community 31 - "seed-destination-content.ts"
Cohesion: 0.29
Nodes (5): DATA, prisma, SectionKey, SECTIONS, SeedDestination

### Community 33 - "7. Core Focus Area 6: Platform Trust, Moderation & Admin Panel"
Cohesion: 0.50
Nodes (4): 7.1 Review Moderation Queue (`/admin/reviews`), 7.2 Operator KYC & Verification Desk (`/admin/operators`), 7.3 Financial Reporting & Commission Desk, 7. Core Focus Area 6: Platform Trust, Moderation & Admin Panel

### Community 44 - "7. Core Focus Area 6: Platform Trust, Moderation & Admin Panel"
Cohesion: 0.50
Nodes (4): 7.1 Review Moderation Queue (`/admin/reviews`), 7.2 Operator KYC & Verification Desk (`/admin/operators`), 7.3 Financial Reporting & Commission Desk, 7. Core Focus Area 6: Platform Trust, Moderation & Admin Panel

### Community 45 - "operators/page.tsx"
Cohesion: 0.32
Nodes (6): dynamic, OperatorsPage(), OperatorFilterSidebar(), OperatorFilterSidebarProps, getOperatorCards(), usd()

### Community 49 - "app/blog/page.tsx"
Cohesion: 0.50
Nodes (4): BlogPage(), dynamic, getPosts(), Post

### Community 50 - "blogs/page.tsx"
Cohesion: 0.50
Nodes (4): BlogPage(), dynamic, getPosts(), Post

### Community 51 - "my-trips/page.tsx"
Cohesion: 0.10
Nodes (23): MyTripsPage(), STATUS_BADGE, STATUS_LABEL, statusBadge(), statusLabel(), ReservationDetailPage(), Departure, fmtDate() (+15 more)

### Community 52 - "search/page.tsx"
Cohesion: 0.40
Nodes (3): featuredDestinations, suggestedSearches, SearchAutocomplete()

### Community 58 - "chat.ts"
Cohesion: 0.07
Nodes (48): GET(), dynamic, GET(), POST(), GET(), POST(), POST(), dynamic (+40 more)

### Community 59 - "blogs/[slug]/page.tsx"
Cohesion: 0.67
Nodes (3): BlogPostPage(), dynamic, getPost()

### Community 60 - "Reservation"
Cohesion: 0.20
Nodes (11): Reservation, Module 1: Database Setup & Prisma ORM Migration, 1. Executive Summary & Codebase State, 4.1 Current Limitations, 4.2 Comprehensive Messaging Redesign, 4.3 Actionable Technical Upgrades, 4. Core Focus Area 3: Bidirectional Two-Way Communication System, 1. Executive Summary & Codebase State (+3 more)

### Community 62 - "4. Core Focus Area 3: Bidirectional Two-Way Communication System"
Cohesion: 0.50
Nodes (4): 4.1 Current Limitations, 4.2 Comprehensive Messaging Redesign, 4.3 Actionable Technical Upgrades, 4. Core Focus Area 3: Bidirectional Two-Way Communication System

### Community 63 - "2.2 Proposed Solution & Architecture"
Cohesion: 0.40
Nodes (5): 2.1 The Problem with the Current Architecture, 2.2 Proposed Solution & Architecture, 2. Core Focus Area 1: Agency-Wide Slot & Fleet Inventory Management, A. Database Schema Enhancements (`prisma/schema.prisma`), B. Operator Portal: Unified Departure Matrix (`/operator-portal/slots`)

### Community 64 - "3. Core Focus Area 2: Payment Gateway Architecture (Stripe)"
Cohesion: 0.40
Nodes (5): 3.1 Current Status & Gap, 3.2 Marketplace Monetization & Payment Flow, 3.3 Database Models for Payments (`prisma/schema.prisma`), 3.4 Key Implementation Deliverables, 3. Core Focus Area 2: Payment Gateway Architecture (Stripe)

### Community 65 - "SafariAsili — Platform Audit, Gap Analysis & Comprehensive Implementation Roadmap"
Cohesion: 0.14
Nodes (13): 5.1 Critical UX Bug Identified During Code Audit, 5.2 Key Traveler UX Upgrades, 5. Core Focus Area 4: Traveler Userflow & UX Improvements, 6.1 Missing Agency Profile & Licensing CMS, 6.2 Tour Package Builder Enhancements, 6.3 Quote Proposal Generator, 6. Core Focus Area 5: Operator Portal & Agency CMS Gaps, 9. Prioritized Phased Implementation Plan (+5 more)

### Community 66 - "images/page.tsx"
Cohesion: 0.67
Nodes (3): ImageRow, kb(), TourImagesPage()

## Knowledge Gaps
- **278 isolated node(s):** `dynamic`, `POST`, `dynamic`, `maxDuration`, `dynamic` (+273 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 354 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `tours/page.tsx`, `prisma.ts`, `package.json`, `Navbar.tsx`, `Footer.tsx`, `SortSelect.tsx`, `getSession`, `tours/[slug]/page.tsx`, `lucide-react`, `admin/reviews/page.tsx`, `tours/new/page.tsx`, `app/page.tsx`, `layout.tsx`, `operators/[slug]/page.tsx`, `experts/[id]/page.tsx`, `operators/page.tsx`, `app/blog/page.tsx`, `blogs/page.tsx`, `my-trips/page.tsx`, `search/page.tsx`, `app/reviews/page.tsx`, `chat.ts`, `blogs/[slug]/page.tsx`, `images/page.tsx`, `messages/page.tsx`?**
  _High betweenness centrality (0.364) - this node is a cross-community bridge._
- **Why does `Reservation` connect `Reservation` to `lucide-react`, `4. Core Focus Area 3: Bidirectional Two-Way Communication System`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `lucide-react` to `tours/page.tsx`, `package.json`, `Navbar.tsx`, `Footer.tsx`, `tours/[slug]/page.tsx`, `admin/reviews/page.tsx`, `tours/new/page.tsx`, `ReservationChat.tsx`, `app/page.tsx`, `operators/[slug]/page.tsx`, `next`, `experts/[id]/page.tsx`, `operators/page.tsx`, `app/blog/page.tsx`, `blogs/page.tsx`, `my-trips/page.tsx`, `search/page.tsx`, `app/reviews/page.tsx`, `blogs/[slug]/page.tsx`, `images/page.tsx`, `messages/page.tsx`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **What connects `dynamic`, `POST`, `dynamic` to the rest of the system?**
  _278 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `prisma.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05049088359046283 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.04717853839037928 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._