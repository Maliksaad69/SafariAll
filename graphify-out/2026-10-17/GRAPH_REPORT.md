# Graph Report - safari-ascili  (2026-10-17)

## Corpus Check
- 125 files · ~602,783 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 2, .css 2, .example 1)

## Summary
- 776 nodes · 1277 edges · 75 communities (57 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2a4ca03c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- site-data.ts
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
- app/page.tsx
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
- SafariAsili — Platform Audit, Gap Analysis & Comprehensive Implementation Roadmap
- operators/page.tsx
- images/route.ts
- reservations/route.ts
- operator-portal/page.tsx
- app/blog/page.tsx
- blogs/page.tsx
- my-trips/page.tsx
- lucide-react
- slots.ts
- blog/[id]/route.ts
- slots/route.ts
- parks/[slug]/page.tsx
- app/reviews/page.tsx
- messages/route.ts
- blogs/[slug]/page.tsx
- Module 1: Database Setup & Prisma ORM Migration
- eslint.config.mjs
- 4. Core Focus Area 3: Bidirectional Two-Way Communication System
- 2.2 Proposed Solution & Architecture
- 3. Core Focus Area 2: Payment Gateway Architecture (Stripe)
- 9. Prioritized Phased Implementation Plan
- images/page.tsx
- SafariAsili (SafariBookings Clone) - Master Modular Technical Documentation
- 6. Core Focus Area 5: Operator Portal & Agency CMS Gaps
- api/reviews/route.ts
- messages/page.tsx
- ImageGallery.tsx
- next.config.ts
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
- `1. Executive Summary & Codebase State` --references--> `Tour`  [INFERRED]
  ROADMAP.md → types/tour.ts
- `8. Core Focus Area 7: Technical Infrastructure, Security & SEO` --references--> `FAQPage()`  [INFERRED]
  ROADMAP.md → app/faq/page.tsx
- `Module 1: Database Setup & Prisma ORM Migration` --references--> `Message`  [INFERRED]
  FINAL_TECHNICAL_DOCUMENTATION.md → app/operator-portal/reservations/[id]/page.tsx
- `1. Executive Summary & Codebase State` --references--> `Reservation`  [INFERRED]
  ROADMAP.md → app/operator-portal/reservations/[id]/page.tsx
- `4.3 Actionable Technical Upgrades` --references--> `Reservation`  [INFERRED]
  ROADMAP.md → app/operator-portal/reservations/[id]/page.tsx

## Import Cycles
- None detected.

## Communities (75 total, 18 thin omitted)

### Community 0 - "site-data.ts"
Cohesion: 0.08
Nodes (18): siteDestinations, dynamic, ExpertPageProps, durationBucket(), dynamic, ToursPage(), ToursPageProps, durationOptions (+10 more)

### Community 1 - "prisma.ts"
Cohesion: 0.12
Nodes (3): POST(), globalForPrisma, prisma

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
Cohesion: 0.20
Nodes (10): Module 10: Performance Optimization & SEO Standards, Module 2: Authentication, User Roles & Sessions, Module 3: Tour Search & Faceted Filtering Engine, Module 4: Tour Detail, Interactive Itinerary & Maps, Module 5: National Park & Destination Guides (SEO Engine), Module 6: Custom Multi-Operator Quote Request Wizard, Module 7: Operator Portal & Proposal Manager, Module 8: Admin Verification & Moderation Panel (+2 more)

### Community 8 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:push, db:seed, db:seed:extracted, db:start, db:stop, dev (+4 more)

### Community 9 - "getSession"
Cohesion: 0.12
Nodes (18): AdminPage(), AdminReviewsPage(), GET(), POST(), recalculateOperatorRating(), GET(), GET(), POST() (+10 more)

### Community 10 - "tours/[slug]/page.tsx"
Cohesion: 0.07
Nodes (29): app_globals, bodyFont, displayFont, metadata, RootLayout(), OperatorProfilePage(), comfortLabel, dynamic (+21 more)

### Community 11 - "inquiries/route.ts"
Cohesion: 0.60
Nodes (3): POST(), LeadEmailPayload, sendLeadNotificationEmail()

### Community 12 - "next-env.d.ts"
Cohesion: 0.50
Nodes (3): next_dev_types_root_params_d, next_dev_types_routes_d, NOTE: This file should not be edited

### Community 13 - "Navbar.tsx"
Cohesion: 0.11
Nodes (8): demoAccounts, ItineraryDay, EMPTY, NavbarSearch(), NavbarSearchProps, SearchResults, ReviewItem, react

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
Cohesion: 0.15
Nodes (7): dynamic, dynamic, fallbackCountries, Props, Slot, BlogPostActions(), next

### Community 29 - "SafariAsili - Master Implementation & Verification Checklist"
Cohesion: 0.40
Nodes (4): 📊 Overall Progress Summary, 🚦 Production Build Status, SafariAsili - Master Implementation & Verification Checklist, 🎨 UI Refinement & Craft Summary (`frontend-design` & `design-to-code`)

### Community 30 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 31 - "50. Responsive Rules"
Cohesion: 0.50
Nodes (4): 50. Responsive Rules, Desktop, Mobile, Tablet

### Community 32 - "app/page.tsx"
Cohesion: 0.19
Nodes (9): dynamic, OperatorProfilePageProps, dynamic, getRealStats(), HomePage(), HeroSearchForm(), getTourImage(), TourCard() (+1 more)

### Community 33 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, tsx, @types/bcryptjs (+4 more)

### Community 34 - "ReviewModerationQueue"
Cohesion: 1.00
Nodes (3): ReviewModerationQueue(), handleDecision(), loadReviews()

### Community 44 - "SafariAsili — Platform Audit, Gap Analysis & Comprehensive Implementation Roadmap"
Cohesion: 0.25
Nodes (7): FAQPage(), 7.1 Review Moderation Queue (`/admin/reviews`), 7.2 Operator KYC & Verification Desk (`/admin/operators`), 7.3 Financial Reporting & Commission Desk, 7. Core Focus Area 6: Platform Trust, Moderation & Admin Panel, 8. Core Focus Area 7: Technical Infrastructure, Security & SEO, SafariAsili — Platform Audit, Gap Analysis & Comprehensive Implementation Roadmap

### Community 45 - "operators/page.tsx"
Cohesion: 0.33
Nodes (4): dynamic, OperatorFilterSidebar(), OperatorFilterSidebarProps, safariOperators

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

### Community 52 - "lucide-react"
Cohesion: 0.25
Nodes (6): featuredDestinations, suggestedSearches, OperatorItem, OperatorVerificationTable(), SearchAutocomplete(), lucide-react

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
Cohesion: 0.25
Nodes (5): countryName(), dynamic, ParkDetailPage(), ParkDetailPageProps, safariTours

### Community 58 - "messages/route.ts"
Cohesion: 0.83
Nodes (3): GET(), POST(), resolveOperatorId()

### Community 59 - "blogs/[slug]/page.tsx"
Cohesion: 0.67
Nodes (3): BlogPostPage(), dynamic, getPost()

### Community 60 - "Module 1: Database Setup & Prisma ORM Migration"
Cohesion: 0.40
Nodes (5): Message, Module 1: Database Setup & Prisma ORM Migration, Tour, TourDay, TourDestination

### Community 61 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 62 - "4. Core Focus Area 3: Bidirectional Two-Way Communication System"
Cohesion: 0.33
Nodes (6): Reservation, 1. Executive Summary & Codebase State, 4.1 Current Limitations, 4.2 Comprehensive Messaging Redesign, 4.3 Actionable Technical Upgrades, 4. Core Focus Area 3: Bidirectional Two-Way Communication System

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

### Community 67 - "SafariAsili (SafariBookings Clone) - Master Modular Technical Documentation"
Cohesion: 0.50
Nodes (3): Executive Summary & System Architecture, SafariAsili (SafariBookings Clone) - Master Modular Technical Documentation, Workspace Directory Blueprint

### Community 68 - "6. Core Focus Area 5: Operator Portal & Agency CMS Gaps"
Cohesion: 0.50
Nodes (4): 6.1 Missing Agency Profile & Licensing CMS, 6.2 Tour Package Builder Enhancements, 6.3 Quote Proposal Generator, 6. Core Focus Area 5: Operator Portal & Agency CMS Gaps

## Knowledge Gaps
- **433 isolated node(s):** `POST`, `dynamic`, `ALLOWED`, `siteDestinations`, `dynamic` (+428 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 505 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `site-data.ts`, `prisma.ts`, `package.json`, `Footer.tsx`, `SortSelect.tsx`, `getSession`, `tours/[slug]/page.tsx`, `inquiries/route.ts`, `Navbar.tsx`, `auth.ts`, `BlogPostForm.tsx`, `app/page.tsx`, `operators/page.tsx`, `images/route.ts`, `reservations/route.ts`, `operator-portal/page.tsx`, `app/blog/page.tsx`, `blogs/page.tsx`, `my-trips/page.tsx`, `lucide-react`, `blog/[id]/route.ts`, `slots/route.ts`, `parks/[slug]/page.tsx`, `app/reviews/page.tsx`, `messages/route.ts`, `blogs/[slug]/page.tsx`, `images/page.tsx`, `api/reviews/route.ts`, `messages/page.tsx`, `next.config.ts`?**
  _High betweenness centrality (0.164) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `lucide-react` to `site-data.ts`, `package.json`, `Footer.tsx`, `tours/[slug]/page.tsx`, `Navbar.tsx`, `BlogPostForm.tsx`, `next`, `app/page.tsx`, `operators/page.tsx`, `operator-portal/page.tsx`, `app/blog/page.tsx`, `blogs/page.tsx`, `my-trips/page.tsx`, `parks/[slug]/page.tsx`, `app/reviews/page.tsx`, `blogs/[slug]/page.tsx`, `images/page.tsx`, `messages/page.tsx`, `ImageGallery.tsx`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `SafariAsili — Platform Audit, Gap Analysis & Comprehensive Implementation Roadmap` connect `SafariAsili — Platform Audit, Gap Analysis & Comprehensive Implementation Roadmap` to `3. Core Focus Area 2: Payment Gateway Architecture (Stripe)`, `9. Prioritized Phased Implementation Plan`, `6. Core Focus Area 5: Operator Portal & Agency CMS Gaps`, `tours/[slug]/page.tsx`, `4. Core Focus Area 3: Bidirectional Two-Way Communication System`, `2.2 Proposed Solution & Architecture`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `POST`, `dynamic`, `ALLOWED` to the rest of the system?**
  _433 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `site-data.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08262108262108261 - nodes in this community are weakly interconnected._
- **Should `prisma.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11956521739130435 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._