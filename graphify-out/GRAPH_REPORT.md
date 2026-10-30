# Graph Report - safari-ascili  (2026-10-24)

## Corpus Check
- 159 files · ~667,978 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: (none) 4, .css 2, .example 1)

## Summary
- 746 nodes · 1534 edges · 60 communities (48 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f41b0b7e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- operators/[slug]/page.tsx
- slots/route.ts
- package.json
- compilerOptions
- booking.ts
- Footer.tsx
- SortSelect.tsx
- Module Breakdown & Development Plan
- 6. Core Focus Area 5: Operator Portal & Agency CMS Gaps
- getSession
- tours/[slug]/page.tsx
- 2.2 Proposed Solution & Architecture
- next-env.d.ts
- Navbar.tsx
- dependencies
- SafariAsili — Platform Audit, Gap Analysis & Comprehensive Implementation Roadmap
- postcss.config.mjs
- live.ts
- 2. Integrated Skills & Design System Engineering
- ReviewModerationQueue
- prisma.ts
- ReservationChat.tsx
- scripts
- fleet.ts
- seed.ts
- tours/page.tsx
- notifyChange
- devDependencies
- next
- SafariAsili - Master Implementation & Verification Checklist
- README.md
- inquiries/route.ts
- BlogPostForm.tsx
- 9. Prioritized Phased Implementation Plan
- postgres/README.md
- AGENTS.md
- rules/graphify.md
- workflows/graphify.md
- SOURCES.md
- next_dev_types_root_params_d
- next_dev_types_routes_d
- setup-db.sh
- stop-db.sh
- 3. Core Focus Area 2: Payment Gateway Architecture (Stripe)
- lucide-react
- 6. Core Focus Area 5: Operator Portal & Agency CMS Gaps
- eslint.config.mjs
- app/blog/page.tsx
- blogs/page.tsx
- operator-portal/page.tsx
- search/page.tsx
- experts/[id]/page.tsx
- chat.ts
- blogs/[slug]/page.tsx
- Reservation
- 2.2 Proposed Solution & Architecture
- 3. Core Focus Area 2: Payment Gateway Architecture (Stripe)
- SafariAsili — Platform Audit, Gap Analysis & Comprehensive Implementation Roadmap
- images/page.tsx

## God Nodes (most connected - your core abstractions)
1. `next` - 100 edges
2. `getSession()` - 64 edges
3. `lucide-react` - 60 edges
4. `prisma` - 53 edges
5. `Footer()` - 36 edges
6. `Navbar()` - 36 edges
7. `react` - 36 edges
8. `notifyChange()` - 19 edges
9. `useLiveRefresh()` - 17 edges
10. `scripts` - 17 edges

## Surprising Connections (you probably didn't know these)
- `5.2 Key Traveler UX Upgrades` --references--> `BookingBox()`  [INFERRED]
  ROADMAP.md → components/BookingBox.tsx
- `5.2 Key Traveler UX Upgrades` --references--> `BookingBox()`  [INFERRED]
  SAFARIASILI_COMPREHENSIVE_AUDIT_AND_ROADMAP.md → components/BookingBox.tsx
- `4.3 Actionable Technical Upgrades` --references--> `Reservation`  [INFERRED]
  ROADMAP.md → app/operator-portal/reservations/[id]/page.tsx
- `4.3 Actionable Technical Upgrades` --references--> `Reservation`  [INFERRED]
  SAFARIASILI_COMPREHENSIVE_AUDIT_AND_ROADMAP.md → app/operator-portal/reservations/[id]/page.tsx
- `8. Core Focus Area 7: Technical Infrastructure, Security & SEO` --references--> `FAQPage()`  [INFERRED]
  ROADMAP.md → app/faq/page.tsx

## Import Cycles
- None detected.

## Communities (60 total, 12 thin omitted)

### Community 0 - "operators/[slug]/page.tsx"
Cohesion: 0.23
Nodes (7): dynamic, OperatorProfilePageProps, dynamic, ParkDetailPageProps, getTourImage(), TourCard(), TourCardProps

### Community 1 - "slots/route.ts"
Cohesion: 0.27
Nodes (16): POST(), authorizeManager(), DELETE(), GET(), PATCH(), POST(), resolveOperatorId(), slotErrorResponse() (+8 more)

### Community 2 - "package.json"
Cohesion: 0.11
Nodes (18): name, prisma, seed, private, version, clsx, prisma, tailwind-merge (+10 more)

### Community 3 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "booking.ts"
Cohesion: 0.20
Nodes (12): GET(), POST, GET(), POST(), BookingError, BookingErrorCode, isSeatRuleViolation(), plural() (+4 more)

### Community 5 - "Footer.tsx"
Cohesion: 0.10
Nodes (8): faqs, steps, ItineraryDay, dynamic, dynamic, Footer(), Navbar(), ReviewItem

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
Cohesion: 0.06
Nodes (40): app_globals, bodyFont, displayFont, metadata, RootLayout(), OperatorsPage(), OperatorProfilePage(), dynamic (+32 more)

### Community 11 - "2.2 Proposed Solution & Architecture"
Cohesion: 0.40
Nodes (5): 2.1 The Problem with the Current Architecture, 2.2 Proposed Solution & Architecture, 2. Core Focus Area 1: Agency-Wide Slot & Fleet Inventory Management, A. Database Schema Enhancements (`prisma/schema.prisma`), B. Operator Portal: Unified Departure Matrix (`/operator-portal/slots`)

### Community 12 - "next-env.d.ts"
Cohesion: 0.50
Nodes (3): NOTE: This file should not be edited, next_types_root_params_d, next_types_routes_d

### Community 13 - "Navbar.tsx"
Cohesion: 0.12
Nodes (10): STATUS_BADGE, STATUS_LABEL, Departure, Vehicle, ItineraryDay, EMPTY, NavbarSearch(), NavbarSearchProps (+2 more)

### Community 14 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, bcryptjs, clsx, jose, lucide-react, next, @prisma/client, react (+9 more)

### Community 15 - "SafariAsili — Platform Audit, Gap Analysis & Comprehensive Implementation Roadmap"
Cohesion: 0.14
Nodes (13): 5.1 Critical UX Bug Identified During Code Audit, 5.2 Key Traveler UX Upgrades, 5. Core Focus Area 4: Traveler Userflow & UX Improvements, 7.1 Review Moderation Queue (`/admin/reviews`), 7.2 Operator KYC & Verification Desk (`/admin/operators`), 7.3 Financial Reporting & Commission Desk, 7. Core Focus Area 6: Platform Trust, Moderation & Admin Panel, 9. Prioritized Phased Implementation Plan (+5 more)

### Community 17 - "live.ts"
Cohesion: 0.24
Nodes (8): dynamic, GET(), maxDuration, fingerprint(), g, liveBus, Row, ref_events

### Community 18 - "2. Integrated Skills & Design System Engineering"
Cohesion: 0.18
Nodes (10): 1. Executive Summary & Architecture Overview, 1. `frontend-design` (Distinctive, Production-Grade UI), 2. Integrated Skills & Design System Engineering, 2. `nextjs-app-router-patterns` (Full-Stack Architecture), 3. Docker Self-Hosted Setup (PostgreSQL 17), 3. `typescript-pro` (Strict Type Safety), 4. `design-to-code` (Responsive Systems & WCAG Accessibility), 4. Master Checklist (+2 more)

### Community 19 - "ReviewModerationQueue"
Cohesion: 1.00
Nodes (3): ReviewModerationQueue(), handleDecision(), loadReviews()

### Community 20 - "prisma.ts"
Cohesion: 0.09
Nodes (4): dynamic, maxDuration, globalForPrisma, prisma

### Community 21 - "ReservationChat.tsx"
Cohesion: 0.08
Nodes (30): ChatLauncher(), ChatWorkspace(), Conversation, Details(), fmtDate(), STATUS, useConversations(), when() (+22 more)

### Community 22 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, db:dump, db:migrate, db:push, db:reset, db:seed, db:setup (+9 more)

### Community 23 - "fleet.ts"
Cohesion: 0.50
Nodes (6): DELETE(), PATCH(), GET(), POST(), operatorForSession(), parseVehicle()

### Community 24 - "seed.ts"
Cohesion: 0.08
Nodes (21): AGENCIES, CORE_EXCL, CORE_INCL, DESTINATIONS, extractedDestinations, extractedOperators, extractedTours, prisma (+13 more)

### Community 25 - "tours/page.tsx"
Cohesion: 0.29
Nodes (6): dynamic, ToursPageProps, durationOptions, FilterSidebar(), FilterSidebarProps, safariCountries

### Community 26 - "notifyChange"
Cohesion: 0.52
Nodes (6): DELETE(), GET(), getOperatorContext(), PATCH(), RouteContext, notifyChange()

### Community 27 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, tsx, @types/bcryptjs (+4 more)

### Community 28 - "next"
Cohesion: 0.12
Nodes (6): dynamic, Props, Slot, BlogPostActions(), nextConfig, next

### Community 29 - "SafariAsili - Master Implementation & Verification Checklist"
Cohesion: 0.40
Nodes (4): 📊 Overall Progress Summary, 🚦 Production Build Status, SafariAsili - Master Implementation & Verification Checklist, 🎨 UI Refinement & Craft Summary (`frontend-design` & `design-to-code`)

### Community 30 - "README.md"
Cohesion: 0.29
Nodes (6): Database (PostgreSQL in Docker), Deploy on Vercel, Deploying to Vercel (or Netlify), Getting Started, Learn More, Real-time reservation chat

### Community 31 - "inquiries/route.ts"
Cohesion: 0.53
Nodes (4): POST(), getTourAvailability(), LeadEmailPayload, sendLeadNotificationEmail()

### Community 32 - "BlogPostForm.tsx"
Cohesion: 0.18
Nodes (8): BlogPostForm(), BlogPostFormProps, TAGS, RichTextEditor(), RichTextEditorProps, @tiptap/extension-image, @tiptap/react, @tiptap/starter-kit

### Community 33 - "9. Prioritized Phased Implementation Plan"
Cohesion: 0.40
Nodes (5): 9. Prioritized Phased Implementation Plan, Phase 1: High Priority Core Foundations & UX Fixes, Phase 2: Stripe Payment Gateway & Escrow, Phase 3: Operator CMS & Traveler Experience, Phase 4: Production Scaling, Cloud Storage & SEO

### Community 44 - "3. Core Focus Area 2: Payment Gateway Architecture (Stripe)"
Cohesion: 0.40
Nodes (5): 3.1 Current Status & Gap, 3.2 Marketplace Monetization & Payment Flow, 3.3 Database Models for Payments (`prisma/schema.prisma`), 3.4 Key Implementation Deliverables, 3. Core Focus Area 2: Payment Gateway Architecture (Stripe)

### Community 45 - "lucide-react"
Cohesion: 0.21
Nodes (7): dynamic, ImageGalleryProps, OperatorFilterSidebar(), OperatorFilterSidebarProps, OperatorItem, OperatorVerificationTable(), lucide-react

### Community 46 - "6. Core Focus Area 5: Operator Portal & Agency CMS Gaps"
Cohesion: 0.50
Nodes (4): 6.1 Missing Agency Profile & Licensing CMS, 6.2 Tour Package Builder Enhancements, 6.3 Quote Proposal Generator, 6. Core Focus Area 5: Operator Portal & Agency CMS Gaps

### Community 48 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 49 - "app/blog/page.tsx"
Cohesion: 0.50
Nodes (4): BlogPage(), dynamic, getPosts(), Post

### Community 50 - "blogs/page.tsx"
Cohesion: 0.50
Nodes (4): BlogPage(), dynamic, getPosts(), Post

### Community 51 - "operator-portal/page.tsx"
Cohesion: 0.08
Nodes (24): computeTripProgress(), MyTripsPage(), dynamic, OperatorPortalPage(), ReservationDetailPage(), fmtDate(), send(), SlotManagerPage() (+16 more)

### Community 52 - "search/page.tsx"
Cohesion: 0.40
Nodes (3): featuredDestinations, suggestedSearches, SearchAutocomplete()

### Community 53 - "experts/[id]/page.tsx"
Cohesion: 0.24
Nodes (3): dynamic, ExpertPageProps, demoAccounts

### Community 58 - "chat.ts"
Cohesion: 0.07
Nodes (48): GET(), dynamic, GET(), POST(), GET(), POST(), POST(), GET() (+40 more)

### Community 59 - "blogs/[slug]/page.tsx"
Cohesion: 0.67
Nodes (3): BlogPostPage(), dynamic, getPost()

### Community 60 - "Reservation"
Cohesion: 0.14
Nodes (15): Reservation, Module 1: Database Setup & Prisma ORM Migration, 1. Executive Summary & Codebase State, 4.1 Current Limitations, 4.2 Comprehensive Messaging Redesign, 4.3 Actionable Technical Upgrades, 4. Core Focus Area 3: Bidirectional Two-Way Communication System, 1. Executive Summary & Codebase State (+7 more)

### Community 63 - "2.2 Proposed Solution & Architecture"
Cohesion: 0.40
Nodes (5): 2.1 The Problem with the Current Architecture, 2.2 Proposed Solution & Architecture, 2. Core Focus Area 1: Agency-Wide Slot & Fleet Inventory Management, A. Database Schema Enhancements (`prisma/schema.prisma`), B. Operator Portal: Unified Departure Matrix (`/operator-portal/slots`)

### Community 64 - "3. Core Focus Area 2: Payment Gateway Architecture (Stripe)"
Cohesion: 0.40
Nodes (5): 3.1 Current Status & Gap, 3.2 Marketplace Monetization & Payment Flow, 3.3 Database Models for Payments (`prisma/schema.prisma`), 3.4 Key Implementation Deliverables, 3. Core Focus Area 2: Payment Gateway Architecture (Stripe)

### Community 65 - "SafariAsili — Platform Audit, Gap Analysis & Comprehensive Implementation Roadmap"
Cohesion: 0.17
Nodes (11): FAQPage(), 5.1 Critical UX Bug Identified During Code Audit, 5.2 Key Traveler UX Upgrades, 5. Core Focus Area 4: Traveler Userflow & UX Improvements, 7.1 Review Moderation Queue (`/admin/reviews`), 7.2 Operator KYC & Verification Desk (`/admin/operators`), 7.3 Financial Reporting & Commission Desk, 7. Core Focus Area 6: Platform Trust, Moderation & Admin Panel (+3 more)

### Community 66 - "images/page.tsx"
Cohesion: 0.67
Nodes (3): ImageRow, kb(), TourImagesPage()

## Knowledge Gaps
- **285 isolated node(s):** `dynamic`, `dynamic`, `POST`, `dynamic`, `maxDuration` (+280 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 364 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `operators/[slug]/page.tsx`, `slots/route.ts`, `package.json`, `booking.ts`, `Footer.tsx`, `SortSelect.tsx`, `getSession`, `tours/[slug]/page.tsx`, `Navbar.tsx`, `prisma.ts`, `ReservationChat.tsx`, `fleet.ts`, `tours/page.tsx`, `notifyChange`, `inquiries/route.ts`, `BlogPostForm.tsx`, `lucide-react`, `app/blog/page.tsx`, `blogs/page.tsx`, `operator-portal/page.tsx`, `search/page.tsx`, `experts/[id]/page.tsx`, `chat.ts`, `blogs/[slug]/page.tsx`, `images/page.tsx`?**
  _High betweenness centrality (0.368) - this node is a cross-community bridge._
- **Why does `Reservation` connect `Reservation` to `Navbar.tsx`?**
  _High betweenness centrality (0.141) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `lucide-react` to `operators/[slug]/page.tsx`, `BlogPostForm.tsx`, `images/page.tsx`, `package.json`, `Footer.tsx`, `tours/[slug]/page.tsx`, `Navbar.tsx`, `app/blog/page.tsx`, `blogs/page.tsx`, `operator-portal/page.tsx`, `search/page.tsx`, `experts/[id]/page.tsx`, `ReservationChat.tsx`, `tours/page.tsx`, `blogs/[slug]/page.tsx`, `next`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **What connects `dynamic`, `dynamic`, `POST` to the rest of the system?**
  _285 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Footer.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10416666666666667 - nodes in this community are weakly interconnected._