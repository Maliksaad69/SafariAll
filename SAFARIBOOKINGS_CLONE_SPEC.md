# SafariBookings — Full Site Reverse-Engineering & Clone Specification

> **Purpose:** This document is the implementation specification for rebuilding a highly faithful, fully dynamic recreation of the public SafariBookings website at `https://www.safaribookings.com/`.
>
> **Target stack:** React for the frontend and backend/API layer, with a database-driven architecture. The implementation must not hardcode the site's content into React components.
>
> **Primary visual references:**  
> `D:\fol\complete_site_clone\snapshots`  
> Existing project reference files: `site_layout_blueprint.json` and `site_style_tokens.json`.
>
> **Important:** This document describes the observable structure, behavior, information architecture, UI states, data model, and asset requirements. Original copyrighted text, photographs, logos, icons, and other protected assets should only be copied/re-hosted where you have the necessary rights or permission. For a private/authorized clone, use the original licensed assets; otherwise use equivalent licensed assets while preserving the same layout and behavior.

---

## 1. Reverse-Engineering Target

The goal is **not** to make a similar safari website.

The goal is to reproduce the target site's:

- information architecture
- URL structure
- navigation
- page hierarchy
- responsive layout
- typography hierarchy
- spacing
- cards
- filters
- forms
- calendars
- selectors
- search behavior
- tours
- country pages
- park pages
- operator pages
- reviews
- expert profiles
- photo pages
- blog
- footer
- mobile navigation
- modal/drawer behavior
- loading states
- empty states
- hover states
- focus states
- favorites
- quote-request flow
- dynamic database content
- pagination
- sorting
- query-string filters
- images and image galleries
- route-to-route navigation
- animations and transitions

The application should feel like the same product when a user navigates through it, while the implementation itself can be newly engineered.

---

# 2. Current Observable Site Architecture

The public site currently exposes these major areas:

1. Home
2. Safaris & Tours
3. Countries & Parks
4. Tour Operators
5. Top Rated Operators
6. Country guides
7. Park/reserve guides
8. Tour detail pages
9. Operator profile pages
10. Photos pages
11. Reviews
12. Experts
13. Blog
14. About
15. Commitment/Trust pages
16. Partner pages
17. Contact
18. Legal/privacy/cookie pages
19. Safari costs
20. Rankings & results

The live site also uses dynamic counts and database-driven listings. Therefore:

```text
DO NOT:
  <h1>Compare 16,232 African Safaris</h1>

DO:
  <h1>Compare {tourCount} African Safaris</h1>
```

The same rule applies to:

- review counts
- operator counts
- country counts
- park counts
- tour counts
- prices
- ratings
- expert reviews
- search-result totals
- availability
- dates
- ranking positions

The live website changes these values over time, so the clone must calculate them from its database.

---

# 3. Existing Project Constraints

## 3.1 Frontend

Use:

```text
React
React Router
CSS / CSS Modules / Tailwind according to existing project setup
Reusable components
Responsive layouts
Accessible form controls
Client-side state management
```

Do not create one giant React component.

Recommended component architecture:

```text
src/
├── app/
├── components/
│   ├── layout/
│   ├── navigation/
│   ├── search/
│   ├── filters/
│   ├── tours/
│   ├── operators/
│   ├── destinations/
│   ├── parks/
│   ├── reviews/
│   ├── experts/
│   ├── blog/
│   ├── galleries/
│   ├── forms/
│   ├── modals/
│   └── common/
├── pages/
├── routes/
├── hooks/
├── services/
├── api/
├── store/
├── utils/
├── assets/
└── styles/
```

---

# 4. Backend Requirement

All meaningful site content must come from the backend/database.

The React frontend must NOT contain the complete tour catalogue, operator catalogue, country content, review catalogue, blog catalogue, etc.

Use a structure similar to:

```text
React UI
   ↓
API/service layer
   ↓
Express/Node backend
   ↓
MongoDB
```

or the backend structure already established by the project.

---

# 5. Core Data Entities

Create database models for at least:

```text
User
Country
Region
Park
Tour
TourOperator
OperatorOffice
Review
Expert
ExpertReview
BlogPost
BlogCategory
Photo
Gallery
Favorite
QuoteRequest
Search
Destination
TourType
AccommodationType
Activity
VehicleType
MealPlan
Currency
```

Optional:

```text
Article
FAQ
FeaturedSection
HomepageSection
Ranking
Statistic
Testimonial
Partner
ContactMessage
NewsletterSubscriber
```

---

# 6. Global Layout

Every public page should use a shared shell.

```text
<App>
  <Router>
    <SiteHeader />
    <PrimaryNavigation />
    <PageContent />
    <GlobalFooter />
  </Router>
</App>
```

The current homepage crawl exposes:

```text
Menu
Safaris & Tours
Countries & Parks
Tour Operators
List/favorites area
Search
Home breadcrumb
Main content
Footer
```

The public homepage currently uses a compact top header/navigation system followed by the main page content.

---

# 7. Header / Navigation

## 7.1 Desktop Header

Reproduce the existing compact desktop navigation.

Required areas:

```text
Logo
Safaris & Tours
Countries & Parks
Tour Operators
Favorites/List
Search
```

Use the exact visual measurements from:

```text
D:\fol\complete_site_clone\snapshots
site_layout_blueprint.json
site_style_tokens.json
```

The existing project reference describes a **55px primary header** at the reference desktop width.

Do not replace this with a generic oversized SaaS navbar.

---

## 7.2 Header States

Implement:

### Default

```text
white/light header
normal text
normal icons
```

### Hover

```text
text color transition
background/highlight if present
cursor
```

### Active

```text
current route highlighted
```

### Search Open

```text
search field/modal/drawer
focus automatically
close control
keyboard escape
```

### Mobile

```text
hamburger/menu button
logo
search/favorite controls where applicable
drawer navigation
overlay
```

---

# 8. Navigation Rules

## Safaris & Tours

Main route:

```text
/tours
```

Country routes:

```text
/tours/botswana
/tours/ethiopia
/tours/kenya
/tours/madagascar
/tours/malawi
/tours/namibia
/tours/rwanda
/tours/south-africa
/tours/tanzania
/tours/uganda
/tours/zambia
/tours/zimbabwe
```

The live site also supports search-driven/filter-driven variants such as:

```text
/tours?k=...
/tours?...
```

The implementation should preserve query parameters rather than creating a separate hardcoded page for every combination.

---

# 9. Countries & Parks

Main route:

```text
/countries-parks
```

Country:

```text
/tanzania
/kenya
/botswana
/uganda
...
```

Park:

```text
/serengeti
/ngoro-ngoro
/kruger
/mara
...
```

Photos:

```text
/serengeti/photos
/mudumu/photos
/hwange/photos
...
```

The actual slug must be stored in the database and generated from a stable SEO slug field.

---

# 10. Tour Operators

Directory:

```text
/operators
```

Filtered examples:

```text
/operators/cape-town
/operators/mombasa
```

Operator profile:

```text
/p{operatorId}
```

Example observed public pattern:

```text
/p3286
```

Operator pages must contain:

```text
operator name
rating
review count
office/location
price range
tour types
destinations
tour catalogue
reviews
latest review
company information
contact/details where available
```

Do not assume all operator records have identical content.

The UI must gracefully handle:

```text
no tours
few reviews
no photo
multiple offices
multiple countries
no current advertising
```

---

# 11. Top-Rated Operators

Route:

```text
/top-rated-operators
```

Page structure:

```text
Page heading
Description
Filter/select controls
Ranking list
Operator cards
Pagination
Expert section
Footer
```

Each operator result should support:

```text
ranking
operator image/logo
operator name
rating
review count
office
price range
tour type
destination badges
tour count
tour links
```

Ranking numbers must come from backend data.

---

# 12. Home Page

## 12.1 Hero

Reference desktop composition:

```text
Full-width hero image
Dark/gradient readability layer if present
Centered/positioned heading
Supporting text
Large safari search form
```

The existing reference blueprint specifies approximately:

```text
Header: 55px
Hero: ~576px
```

Do not arbitrarily change these dimensions.

---

## 12.2 Hero Search

The search form is one of the most important components.

Fields:

```text
Destination / Where To
Start Date
Flexible dates
Travelers
Adults
Children
Child ages
Submit / Show Tours
```

Current public homepage exposes a structure equivalent to:

```text
Destination
Where To
Start Date
My dates are somewhat flexible
2 Adults
Adults (18+)
Children (0-17)
Age at the end of the tour
Travelers
Show {count} Tours
```

### Destination field

Must support:

```text
focus
dropdown
search
country
park
city
highlight
recent selection
clear selection
```

### Date picker

Implement:

```text
month navigation
day selection
selected state
disabled dates if applicable
flexible-date option
outside-month days
mobile date-picker layout
```

### Travelers

Implement:

```text
Adults +/-
Children +/-
Child age selectors
validation
```

### Submit

Build a URL/query state such as:

```text
/tours?destination=tanzania&startDate=2026-10-10&adults=2
```

Exact query names can be adapted internally, but state must survive refresh and shareable URLs.

---

# 13. Homepage Sections

The current homepage includes the following major content blocks.

## A. Trust / value strip

Examples of concepts:

```text
The Largest Marketplace for Safaris
Best Price Guarantee
Review count
```

Use reusable statistic/value cards.

---

## B. Top-rated Safari Countries

Current public structure displays a ranked set of safari countries.

Implement:

```text
section title
country cards/links
ranking number
country image
country name
hover state
destination navigation
```

The ranking should come from a database/configuration source.

---

## C. Popular Safari Tours

Tour cards should display:

```text
tour image
duration
tour title
price
price range where applicable
currency
country
tour type
comfort/accommodation
route
operator
rating
review count
```

Cards must link to the real tour detail route.

---

## D. All Tours CTA

```text
View/All Safaris & Tours
```

This must navigate to the catalogue rather than opening a fake static page.

---

## E. Top Rated Tour Operators

Show a horizontal/grid group of operator cards.

Data:

```text
operator name
ranking
review count
rating
image/logo
```

---

## F. Latest Blog Posts

Display:

```text
image
category
title
author
date
excerpt if visible
```

Click → blog article.

---

## G. SafariBookings Experts

Expert cards:

```text
portrait
name
country
review count
short biography
```

Click → expert profile.

---

## H. About / Marketplace explanation

Use:

```text
headline
description
CTA
statistics
```

---

## I. Statistics

Observed categories include:

```text
safari countries
parks and reserves
tour packages
tour operators
user reviews
expert reviews
Africa experts
```

These must be dynamic.

---

## J. Safari discovery links

Groups include:

```text
Safaris by Park
Safaris by Country
Safaris by Type
General
```

Build these from database/configuration arrays.

---

# 14. Tour Listing Page

Route:

```text
/tours
```

Page must behave like a real marketplace.

Required:

```text
heading
intro
search/filter controls
result count
sorting
filter sidebar
tour result cards
pagination/load more
review content
expert content
footer
```

Observed public listing pages include:

```text
Filters
Where To
Tour Length
result range such as 1–20 of N
ranking explanation
tour cards
Safari Reviews
```

---

# 15. Tour Filters

Implement at minimum:

```text
Destination
Country
Park
Tour length
Price
Tour type
Travel style
Accommodation
Private/shared
Start date
Availability
Activities
Transport
```

Where supported by the target UI, also support:

```text
budget
luxury
mid-range
camping
family
honeymoon
photo safari
gorilla trekking
walking
birding
self-drive
canoe
fly-in
```

Filter behavior:

```text
select filter
update URL
update API request
update result count
preserve other filters
clear individual filter
clear all
```

---

# 16. Tour Card

Build one reusable:

```text
<TourCard />
```

Data fields:

```text
id
slug
title
image
duration
countries
tourType
travelStyle
accommodation
priceMin
priceMax
currency
operator
operatorRating
reviewCount
route
highlights
badges
```

States:

```text
default
hover
favorite
favorited
loading
image-loading
missing-image
```

---

# 17. Tour Detail Page

Route pattern:

```text
/tours/t{tourId}
```

Example observed pattern:

```text
/tours/t117437
```

Required structure:

```text
breadcrumb
hero/title
tour image
operator summary
price
rating/reviews
travelers/date selector
Request a Quote
contact operator option
tabs
overview
route
tour features
activities
transport
accommodation
meals
rates
inclusions
getting there
operator
reviews
```

---

# 18. Tour Detail Hero

Required fields:

```text
Tour title
Operator
Rating
Review count
Price
Currency
Travelers
Start date
Request a Quote
```

Primary CTA:

```text
Request a Quote
```

The form must send a real database request.

---

# 19. Tour Detail Tabs

Observed tab concepts:

```text
Overview
Day by Day
Rates
Inclusions
Getting There
Offered By
```

Use:

```text
sticky tab bar
active underline/border
smooth scroll
or route/hash state
```

On mobile:

```text
horizontal scroll
or compact selector
```

---

# 20. Route / Itinerary Component

Display:

```text
Start
Day 1
Day 2–3
Day 4
...
End
```

Each itinerary point:

```text
day
location
park
highlight
image where available
description
```

Implement expand/collapse:

```text
Show More Days
Show Less
```

---

# 21. Tour Features

Observed feature types include:

```text
Luxury tour
Private tour
Can start any day
Can be customized
Not for solo travelers
Minimum age
```

Use reusable:

```text
<FeatureItem icon title description />
```

---

# 22. Activities & Transportation

Data-driven fields:

```text
Activities
Game drives
Walking
Boat safari
Transportation vehicle
Airport transfer
International flight assistance
```

Do not render a field when the data is unavailable unless the target page explicitly displays an empty state.

---

# 23. Accommodation & Meals

Use a day-by-day table/card:

```text
Day
Accommodation
Accommodation type
Distance
Meal plan
Photos
```

Example structure:

```text
Day 1
Mawe Mawe Lodge
Luxury lodge
1–2 hr drive from Tarangire NP
Lunch & Dinner Included
```

---

# 24. Country Guide Page

Example:

```text
/tanzania
```

Required sections:

```text
title
rating
review count
hero image
expert
overview
map
key statistics
pros & cons
reviews
expert reviews
wildlife
things to do
weather & climate
best time to visit
premier parks
safari catalogue
tour operators
```

Observed Tanzania page content includes:

```text
Rates
Best Time To Go
High Season
Size
Pros & Cons
Safari Reviews
Expert Rating
User Rating
Wildlife
Things To Do
Weather & Climate
Best Time To Visit
Premier Parks & Reserves
Want To Visit {Country}?
```

The same page template should work for all countries.

---

# 25. Country Guide Data Model

```json
{
  "name": "Tanzania",
  "slug": "tanzania",
  "heroImage": "...",
  "rating": 4.8,
  "reviewCount": 2178,
  "expert": {},
  "description": "...",
  "rates": {
    "min": 230,
    "max": 660,
    "unit": "pp/day",
    "currency": "USD"
  },
  "bestTime": "...",
  "highSeason": "...",
  "area": "...",
  "pros": [],
  "cons": [],
  "wildlife": "...",
  "thingsToDo": [],
  "weather": "...",
  "premierParks": []
}
```

---

# 26. Park / Reserve Guide

Example:

```text
/serengeti
/matobo
```

Required:

```text
park name
country
rating
review count
hero image
expert
description
best time
wildlife
activities
getting there
where to stay
map
reviews
photos
safaris
operators
related parks
```

---

# 27. Park Photo Page

Pattern:

```text
/{parkSlug}/photos
```

Required:

```text
page title
photo grid
lightbox
next/previous
image captions
photographer/source
lazy loading
responsive masonry/grid
```

The public site exposes dedicated photo pages for parks such as:

```text
Mudumu
Hwange
Aberdare
Nyanga
Madikwe
Kafue
Matusadona
Ts'ehlanyane
```

The clone should generate these pages dynamically.

---

# 28. Photo Gallery Behavior

Desktop:

```text
grid
hover overlay
click → lightbox
```

Lightbox:

```text
large image
caption
counter
previous
next
close
keyboard navigation
```

Keyboard:

```text
Esc = close
← = previous
→ = next
```

Mobile:

```text
swipe left/right
tap close
```

---

# 29. Operator Directory

Route:

```text
/operators
```

Required:

```text
heading
filters
location selector
result count
operator list
pagination
operator cards
expert section
statistics
footer
```

Observed public listings expose operator information including:

```text
name
rating
review count
office
price range
tour types
destinations
sample tours
tour count
```

---

# 30. Operator Profile

Route:

```text
/p{operatorId}
```

Sections:

```text
operator hero
rating
reviews
company information
office/address
price range
tour types
destinations
tour catalogue
reviews
latest review
write review
```

Use database content.

If:

```text
tourCount = 0
```

show the appropriate empty state rather than breaking the page.

---

# 31. Reviews System

Reviews are a major site feature.

Model:

```text
reviewId
authorName
country
date
rating
title
body
operatorId
tourId
destinationId
verified
status
reply
```

Display:

```text
overall rating
category ratings
review count
latest review
all reviews
pagination
```

Review states:

```text
loading
published
pending
empty
moderated
```

---

# 32. Review Submission

Provide:

```text
rating
title
review body
tour/operator
country
name
email where required
submit
```

Backend:

```text
POST /api/reviews
```

Validate:

```text
rating range
required fields
spam
duplicate submissions
length
content policy
```

---

# 33. Genuine Reviews Page

Route:

```text
/genuine-reviews
```

Required sections:

```text
heading
trust explanation
statistics
review moderation explanation
example reviews
submission CTA
review rules
FAQ
operator/review platform explanation
```

The public page currently explains review verification/moderation and publishes review statistics.

---

# 34. Experts

Main route:

```text
/experts
```

Expert card:

```text
portrait
name
country
review count
short bio
```

Expert profile:

```text
/expert/{slug}
```

Sections:

```text
portrait
name
country
biography
expertise
reviews
destination reviews
related articles
```

---

# 35. Blog

Main route:

```text
/blog
```

Required:

```text
blog hero
categories
search
featured articles
latest articles
popular articles
pagination
```

Observed blog content includes pagination and popular article sections.

---

# 36. Blog Article

Pattern:

```text
/blog/{slug}
```

Required:

```text
category
title
hero image
author
author portrait
date
article body
inline images
related articles
popular articles
share controls
```

Article content must come from backend/CMS data.

---

# 37. About Page

Route:

```text
/about-us
```

or the exact route discovered by the crawler.

Required:

```text
hero
company explanation
marketplace explanation
statistics
mission/value content
team/expert information
trust section
CTA
```

---

# 38. Trust / Commitment Pages

Routes should include the public site's trust-oriented sections, including pages equivalent to:

```text
/trusted-safari-companies
/genuine-reviews
/ensuring-quality-content
```

The exact URLs must be confirmed during route crawling and placed in the final route registry.

Each should use reusable:

```text
TrustHero
TrustStats
ProcessSteps
FAQ
LogoGrid
CTA
```

---

# 39. Partner Pages

Main partner area:

```text
/partner-options
```

Possible sections:

```text
Safari companies
tour operators
advertising/partner information
requirements
benefits
application/contact
```

Partner pages should be database/CMS driven where content changes.

---

# 40. Contact

Route:

```text
/contact
```

Required:

```text
contact information
contact form
reason/category
name
email
message
submit
success state
validation
error state
```

Backend:

```text
POST /api/contact
```

---

# 41. Legal Pages

Implement:

```text
/terms
/privacy
/cookie-settings
```

or exact live-site route equivalents.

These pages need:

```text
typography
headings
paragraph spacing
lists
links
responsive width
footer
```

Do not make legal pages visually generic if the target has a distinct content container.

---

# 42. Safari Costs

Route:

```text
/safari-costs
```

Required:

```text
heading
explanation
pricing factors
country comparisons
examples
related tours
FAQ
```

---

# 43. Rankings & Results

Route:

```text
/rankings-results
```

or exact discovered route.

Required:

```text
ranking methodology
country rankings
operator rankings
results
review/statistical explanation
```

Ranking data must be represented as data, not hardcoded into UI components.

---

# 44. Search System

Global search must support:

```text
countries
parks
cities
operators
tours
blog articles
```

Autocomplete:

```text
input
debounced API request
grouped results
icons/images
keyboard navigation
enter → results
escape → close
```

Keyboard:

```text
ArrowUp
ArrowDown
Enter
Escape
```

---

# 45. Search Result URL

Search should create shareable URLs.

Example:

```text
/tours?destination=tanzania
```

Complex example:

```text
/tours?destination=tanzania&duration=5-10&adults=2&startDate=2026-10-15
```

On page load:

```text
parse URL
load filters
request backend
render results
```

---

# 46. Favorites

Implement a global favorites/list system.

States:

```text
not favorited
favorited
loading
login required
```

Possible entities:

```text
tour
operator
park
```

API:

```text
POST   /api/favorites
DELETE /api/favorites/:id
GET    /api/favorites
```

For anonymous users:

```text
localStorage
```

For authenticated users:

```text
database
```

Merge anonymous favorites after login.

---

# 47. Quote Request

Tour detail primary flow:

```text
Tour
 ↓
Request a Quote
 ↓
Traveler form
 ↓
Trip requirements
 ↓
Contact information
 ↓
Submit
 ↓
Success
```

Fields:

```text
tour
start date
flexible dates
adults
children
child ages
name
email
phone
country
message
```

Backend:

```text
POST /api/quote-requests
```

Persist:

```text
quoteRequestId
tourId
operatorId
traveler
trip
status
createdAt
```

Status:

```text
new
sent
viewed
responded
closed
```

---

# 48. Currency

The site exposes a currency control.

Implement:

```text
currency selector
current currency
converted prices
currency persistence
```

Recommended:

```text
localStorage
```

Price model:

```text
amount
currency
min
max
```

Never store only formatted strings.

Bad:

```json
{
  "price": "$2,660 pp"
}
```

Good:

```json
{
  "priceMin": 2660,
  "priceMax": null,
  "currency": "USD",
  "unit": "pp"
}
```

---

# 49. Responsive Design

Required breakpoints should be derived from the screenshots and actual rendered site.

Use at minimum:

```text
Desktop
Tablet
Mobile
```

Reference testing:

```text
1440 × 900
1280 × 800
1024 × 768
768 × 1024
390 × 844
375 × 812
```

Also test:

```text
320px
360px
412px
```

Do not simply scale the desktop page down.

Mobile must have intentional layouts.

---

# 50. Responsive Rules

## Desktop

```text
full navigation
multi-column grids
side filters
wide hero
large image galleries
```

## Tablet

```text
reduced columns
collapsible filters
smaller gaps
adapted header
```

## Mobile

```text
drawer navigation
single-column content
horizontal filter controls where appropriate
stacked forms
full-width CTA
mobile gallery
mobile date picker
```

---

# 51. Typography

Use the typography specified by:

```text
site_style_tokens.json
```

The existing project reference identifies:

```text
Noto Sans
Gentium Basic
```

Use the target typography hierarchy rather than default browser headings.

Create tokens:

```css
--font-body
--font-heading
--font-display
--font-mono
```

Define:

```text
font-family
font-size
font-weight
line-height
letter-spacing
```

for:

```text
display
h1
h2
h3
h4
body
small
caption
button
input
label
breadcrumb
metadata
price
rating
```

---

# 52. Color System

Do not invent a new palette.

Use:

```text
site_style_tokens.json
```

Create semantic tokens:

```text
background
surface
surface-muted
text-primary
text-secondary
text-muted
border
accent
accent-hover
success
warning
error
rating
overlay
```

All components must consume tokens.

---

# 53. Spacing

Create spacing tokens:

```text
4
8
12
16
20
24
32
40
48
56
64
80
96
120
```

Then replace arbitrary values with the established token system where possible.

---

# 54. Border Radius

Do not globally make every card highly rounded.

SafariBookings-style layouts generally use restrained card/form radii.

Measure the reference screenshots and encode:

```text
--radius-sm
--radius-md
--radius-lg
--radius-pill
```

Use:

```text
pill → badges/chips
small → inputs/buttons
medium → cards
large → modal/hero elements only where visible
```

---

# 55. Shadows

Create:

```text
--shadow-sm
--shadow-md
--shadow-lg
```

Use shadows only where the reference has elevation.

Avoid generic:

```css
box-shadow: 0 20px 50px rgba(...)
```

on everything.

---

# 56. Animation System

Animations must be subtle and product-like.

Create centralized motion tokens:

```text
--duration-fast
--duration-normal
--duration-slow

--ease-standard
--ease-emphasized
--ease-out
```

Suggested starting values:

```text
fast: 120–160ms
normal: 180–250ms
slow: 300–450ms
```

These are implementation defaults. Final timings should be calibrated against the supplied screenshots/video recordings.

---

# 57. Required Animations

## Navigation

```text
dropdown open
dropdown close
active underline/highlight
```

## Search

```text
input focus
dropdown fade/slide
selection highlight
```

## Cards

```text
image subtle zoom on hover
shadow/elevation transition
favorite icon transition
```

## Buttons

```text
hover
active
focus
disabled
```

## Modals

```text
overlay fade
panel scale/translate
```

## Mobile menu

```text
overlay fade
drawer slide
```

## Image gallery

```text
fade/slide between images
lightbox open/close
```

## Filters

```text
drawer slide
accordion expand
selection transition
```

---

# 58. Reduced Motion

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

Disable or minimize:

```text
large transforms
autoplay
parallax
long transitions
```

---

# 59. Image Architecture

Images are a first-class part of the clone.

Do not use:

```text
random Unsplash images
```

when reproducing an authorized reference build.

Create an image asset registry:

```json
{
  "id": "home-hero",
  "source": "...",
  "localPath": "/assets/images/home/hero.webp",
  "alt": "...",
  "width": 1920,
  "height": 1080,
  "copyright": "...",
  "license": "...",
  "page": "home",
  "role": "hero"
}
```

---

# 60. Image Inventory

Create:

```text
assets/images/
├── home/
├── countries/
├── parks/
├── tours/
├── operators/
├── experts/
├── blog/
├── reviews/
├── icons/
└── logos/
```

Naming:

```text
{entity}-{purpose}-{size}.{ext}
```

Example:

```text
tanzania-hero-1920.webp
tanzania-map-1200.webp
serengeti-gallery-01.webp
tour-t117437-01.webp
operator-p3286-logo.webp
expert-philip-briggs.webp
```

---

# 61. Image Extraction Protocol

For an authorized/local reproduction, inspect every target page and collect:

```text
img[src]
img[srcset]
picture/source
background-image
CSS background assets
lazy-loaded data-src
Open Graph image
JSON-LD image
```

Also inspect:

```text
network requests
```

because some images may be loaded dynamically.

Build:

```text
image-manifest.json
```

with:

```text
page
component
source URL
local filename
width
height
alt
caption
credit
license
```

Do not blindly download every external image without checking rights.

---

# 62. Image Optimization

Store modern formats:

```text
AVIF where supported
WebP
fallback JPEG/PNG
```

Generate responsive sizes:

```text
320
480
640
768
1024
1280
1600
1920
```

Use:

```html
<picture>
  <source ... />
  <img ... />
</picture>
```

Use lazy loading below the fold:

```html
loading="lazy"
```

Hero images may use:

```html
loading="eager"
fetchpriority="high"
```

---

# 63. Image Aspect Ratios

Create component-level aspect ratio tokens:

```text
hero
tour-card
operator-card
expert-card
blog-card
gallery
avatar
logo
```

Never allow random image dimensions to change card height.

Use:

```css
object-fit: cover;
```

where the reference image is cropped.

---

# 64. Icon System

Use one consistent icon source.

Do not mix:

```text
Font Awesome
Material Icons
Lucide
random SVGs
```

unless the reference explicitly requires different icon families.

Prefer local SVG assets for exact reproduction.

Create:

```text
IconSearch
IconCalendar
IconUsers
IconChevron
IconHeart
IconMap
IconStar
IconArrow
IconClose
IconMenu
```

---

# 65. Loading States

Every API-driven page needs:

```text
initial loading
pagination loading
filter loading
image loading
form submitting
```

Use skeletons matching actual component geometry.

Do not show a generic full-page spinner for every request.

---

# 66. Empty States

Implement:

```text
No tours found
No reviews yet
No photos
No operators found
No favorites
No blog results
```

Every empty state must provide a useful next action where appropriate.

---

# 67. Error States

Examples:

```text
API unavailable
tour not found
operator not found
country not found
photo unavailable
invalid filter
quote submission failed
contact submission failed
```

Never let an API error produce a blank white screen.

---

# 68. 404 Page

Create:

```text
404
```

with:

```text
message
home CTA
search CTA
navigation/footer
```

---

# 69. Accessibility

Required:

```text
semantic HTML
keyboard navigation
visible focus states
ARIA labels
form labels
alt text
button semantics
modal focus trap
Escape handling
screen-reader-friendly errors
```

Interactive cards should not be implemented as:

```html
<div onClick=...>
```

Use:

```html
<a>
<button>
```

where appropriate.

---

# 70. SEO

Every route needs dynamic:

```text
<title>
meta description
canonical URL
Open Graph
Twitter/X card
structured data
```

Tour pages should use relevant structured data where legally/technically appropriate.

Country/park pages should have:

```text
unique title
description
canonical
image
```

---

# 71. Breadcrumbs

Build:

```text
Home
>
Safaris & Tours
>
Tanzania
>
Tour
```

Breadcrumbs must be generated from route/data hierarchy.

Do not manually duplicate breadcrumb markup on every page.

---

# 72. Page Templates

Create reusable page templates:

```text
ListingPage
DetailPage
GuidePage
DirectoryPage
ArticlePage
GalleryPage
ReviewPage
TrustPage
```

Then inject data.

Example:

```text
CountryGuideTemplate
  + Tanzania data
  + Kenya data
  + Botswana data
  + Uganda data
```

This is much more maintainable than creating separate custom pages.

---

# 73. API Design

Recommended API groups:

```text
/api/tours
/api/operators
/api/countries
/api/parks
/api/reviews
/api/experts
/api/blog
/api/photos
/api/favorites
/api/search
/api/quotes
/api/contact
/api/stats
```

Examples:

```http
GET /api/tours
GET /api/tours/:id
GET /api/tours/search
GET /api/tours?country=tanzania
```

```http
GET /api/operators
GET /api/operators/:id
GET /api/operators/:id/tours
GET /api/operators/:id/reviews
```

```http
GET /api/countries
GET /api/countries/:slug
```

```http
GET /api/parks/:slug
GET /api/parks/:slug/photos
```

---

# 74. API Pagination

Use:

```text
page
limit
sort
filters
```

Response:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 16000,
    "totalPages": 800
  }
}
```

---

# 75. Database Indexing

Index:

```text
Tour.slug
Tour.countryIds
Tour.parkIds
Tour.operatorId
Tour.price
Tour.duration
Tour.rating
Tour.createdAt

Operator.slug
Operator.name
Operator.countryIds
Operator.rating

Country.slug
Park.slug

Review.operatorId
Review.tourId
Review.rating
Review.createdAt

BlogPost.slug
BlogPost.category
BlogPost.publishedAt
```

Search indexes:

```text
tour title
operator name
country name
park name
blog title
```

---

# 76. Search Ranking

The public site uses a marketplace-style ranking concept.

For the clone, implement a deterministic ranking service:

```text
relevance
rating
review count
availability
content completeness
featured/promoted flag
business rules
```

Do not bury ranking logic inside React.

Use:

```text
rankingService.ts
```

or backend equivalent.

---

# 77. Tour Ranking

Example internal scoring:

```text
score =
  relevanceWeight
+ ratingWeight
+ reviewWeight
+ availabilityWeight
+ qualityWeight
+ promotionWeight
```

The weights must be configurable.

Do not present internal scoring as the actual SafariBookings proprietary algorithm.

---

# 78. URL Strategy

URLs must be clean and stable.

Examples:

```text
/
 /tours
 /tours/tanzania
 /tours/t117437
 /countries-parks
 /tanzania
 /serengeti
 /serengeti/photos
 /operators
 /p3286
 /top-rated-operators
 /blog
 /blog/{slug}
 /experts
 /expert/{slug}
```

Keep numeric IDs where the target public URL uses them.

---

# 79. Query Parameters

Centralize query parsing.

Example:

```text
destination
country
park
startDate
endDate
flexible
adults
children
tourLength
priceMin
priceMax
tourType
accommodation
rating
sort
page
```

Create:

```text
parseSearchParams()
serializeSearchParams()
```

---

# 80. State Management

Global state:

```text
currency
favorites
authentication
search preferences
navigation
```

Local state:

```text
dropdown
modal
gallery
filter accordion
date picker
form
```

Do not put every UI boolean into global state.

---

# 81. Authentication

If implementing accounts:

```text
register
login
logout
forgot password
session
favorites
reviews
quote history
```

Use secure session/token handling.

Never put secrets in frontend code.

---

# 82. Admin / CMS

A proper clone needs an internal content-management capability.

Admin areas:

```text
/dashboard
/dashboard/tours
/dashboard/operators
/dashboard/countries
/dashboard/parks
/dashboard/reviews
/dashboard/blog
/dashboard/experts
/dashboard/photos
/dashboard/quotes
```

CRUD:

```text
create
read
update
delete
publish
unpublish
```

---

# 83. Homepage CMS

Allow admin to control:

```text
hero
featured countries
popular tours
featured operators
blog posts
experts
statistics
footer links
```

This prevents homepage changes from requiring React code changes.

---

# 84. Content Relationship Model

Example:

```text
Country
 ├── Parks
 ├── Tours
 ├── Operators
 ├── Reviews
 ├── Experts
 └── Blog Posts

Park
 ├── Country
 ├── Tours
 ├── Photos
 ├── Reviews
 └── Operators

Operator
 ├── Tours
 ├── Reviews
 ├── Offices
 └── Countries

Tour
 ├── Operator
 ├── Countries
 ├── Parks
 ├── Itinerary
 ├── Accommodation
 ├── Reviews
 └── Photos
```

---

# 85. Component Inventory

Create these reusable components.

## Navigation

```text
Header
Logo
PrimaryNav
NavDropdown
MobileNav
SearchButton
FavoritesButton
Breadcrumbs
```

## Search

```text
HeroSearch
DestinationPicker
DatePicker
TravelerPicker
SearchSubmit
SearchAutocomplete
```

## Tours

```text
TourCard
TourGrid
TourList
TourFilters
TourSort
TourHero
TourTabs
TourRoute
TourFeatures
TourActivities
TourAccommodation
TourRates
TourInclusions
TourOperator
```

## Operators

```text
OperatorCard
OperatorGrid
OperatorProfile
OperatorRating
OperatorTourList
```

## Destinations

```text
CountryCard
CountryGuide
ParkCard
ParkGuide
ParkMap
ParkGallery
```

## Reviews

```text
Rating
RatingBreakdown
ReviewCard
ReviewList
ReviewForm
ReviewSummary
```

## Experts

```text
ExpertCard
ExpertGrid
ExpertProfile
```

## Blog

```text
BlogCard
BlogGrid
BlogArticle
BlogSidebar
BlogCategory
```

## Common

```text
Button
Link
Badge
Chip
Modal
Drawer
Accordion
Tabs
Pagination
Skeleton
EmptyState
ErrorState
Tooltip
Image
Gallery
Lightbox
```

---

# 86. Footer

The footer contains grouped navigation.

Observed groups include:

```text
Safaris by Park
Safaris by Country
Safaris by Type
General
```

General includes links equivalent to:

```text
About Us
Commitment to Trust
Partner Options
Terms of Use
Privacy Policy
Cookie Settings
Blog
African Safari Costs
Rankings & Results
Contact Us
```

Also implement:

```text
currency selector
copyright
brand/logo
```

---

# 87. Footer Data Model

```json
{
  "groups": [
    {
      "title": "Safaris by Country",
      "links": []
    },
    {
      "title": "Safaris by Type",
      "links": []
    },
    {
      "title": "General",
      "links": []
    }
  ]
}
```

---

# 88. Exact Visual Matching Workflow

Do not visually tune the application by intuition.

Use this loop:

```text
1. Open target page
2. Capture screenshot at exact viewport
3. Open clone at same viewport
4. Capture screenshot
5. Overlay/diff
6. Identify mismatch
7. Fix
8. Repeat
```

Compare:

```text
header height
hero height
container width
left/right margins
font size
font weight
line height
card height
image crop
button height
input height
section spacing
footer position
```

---

# 89. Screenshot Test Matrix

For each important route:

```text
Desktop 1440x900
Desktop 1280x800
Tablet 1024x768
Tablet 768x1024
Mobile 390x844
Mobile 375x812
```

Create:

```text
visual-regression/
├── home/
├── tours/
├── tour-detail/
├── country/
├── park/
├── operators/
├── operator-detail/
├── blog/
└── mobile/
```

---

# 90. Interaction Test Matrix

Test:

```text
Navigation
Search
Autocomplete
Date picker
Traveler selector
Filters
Sorting
Pagination
Favorites
Tour details
Gallery
Lightbox
Quote form
Review form
Blog navigation
Mobile menu
Currency selector
Footer links
Back button
Forward button
Refresh
Deep links
404
```

---

# 91. Browser Navigation Requirements

The clone must support:

```text
direct URL entry
refresh
back
forward
open in new tab
copy URL
query-string persistence
```

No route may depend on having previously visited the homepage.

---

# 92. Animation QA

For every animated component verify:

```text
opening
closing
hover
focus
active
disabled
rapid repeated interaction
mobile
reduced motion
```

Prevent:

```text
layout jumps
flicker
double animation
scroll locking bugs
body overflow bugs
```

---

# 93. Image QA

Check:

```text
correct crop
correct focal point
no stretched images
lazy loading
blur/skeleton state
broken image fallback
alt text
mobile resolution
gallery navigation
```

---

# 94. Performance

Target:

```text
fast first content
optimized images
code splitting
lazy route loading
lazy images
API pagination
debounced search
cached destination data
```

Avoid:

```text
loading 16,000 tours into browser
loading every image at once
one enormous JS bundle
re-rendering entire listing on every keystroke
```

---

# 95. API Caching

Cache relatively stable data:

```text
countries
parks
experts
blog categories
tour types
```

Shorter cache:

```text
tour listings
operator listings
reviews
```

No/very short cache:

```text
quote submission
contact submission
authenticated user actions
```

---

# 96. Security

Implement:

```text
input validation
rate limiting
CSRF protection where applicable
XSS protection
secure authentication
password hashing
authorization
file-upload validation
image MIME validation
request size limits
API error sanitization
```

Never trust:

```text
price from frontend
operatorId from frontend
userId from frontend
review ownership from frontend
admin role from frontend
```

---

# 97. Image Upload Security

For admin/operator uploads:

```text
validate MIME
validate extension
limit file size
generate safe filename
strip dangerous metadata where appropriate
store outside executable paths
generate thumbnails
```

---

# 98. Data Seeding

Create realistic seed data.

Minimum development seed:

```text
18 countries
30+ parks
100+ operators
300+ tours
500+ reviews
24 experts
50+ blog posts
500+ photos
```

The numbers can be larger.

The goal is to make:

```text
pagination
search
filters
sorting
relationships
```

feel real.

---

# 99. Seed Content

Use clearly labeled fictional/dev data if you do not have authorization to reproduce real commercial records.

Example:

```text
operator:
"Example Safari Adventures"

tour:
"7-Day Serengeti Wildlife Journey"

country:
"Tanzania"

park:
"Serengeti National Park"
```

For an authorized reproduction, import the licensed/reference dataset instead.

---

# 100. Dynamic Homepage

Homepage API:

```http
GET /api/home
```

Response:

```json
{
  "hero": {},
  "stats": {},
  "featuredCountries": [],
  "popularTours": [],
  "topOperators": [],
  "latestBlogPosts": [],
  "experts": [],
  "footer": {}
}
```

This keeps the page fast and avoids many unnecessary requests.

---

# 101. Dynamic Country Page

```http
GET /api/countries/:slug
```

Response should include:

```text
country
rating
reviews
expert
statistics
pros
cons
wildlife
thingsToDo
weather
bestTime
parks
featuredTours
operators
```

---

# 102. Dynamic Park Page

```http
GET /api/parks/:slug
```

Return:

```text
park
country
rating
reviews
expert
description
wildlife
bestTime
activities
photos
tours
operators
map
```

---

# 103. Dynamic Tour Detail

```http
GET /api/tours/:id
```

Return:

```text
tour
operator
rating
reviews
price
currency
availability
itinerary
features
activities
transport
accommodation
meals
rates
inclusions
gettingThere
photos
```

---

# 104. Dynamic Operator Detail

```http
GET /api/operators/:id
```

Return:

```text
operator
offices
countries
rating
reviews
priceRange
tourTypes
tours
latestReviews
```

---

# 105. Route Registry

Create one route registry:

```js
const routes = {
  home: "/",
  tours: "/tours",
  countriesParks: "/countries-parks",
  operators: "/operators",
  topOperators: "/top-rated-operators",
  tour: "/tours/:id",
  operator: "/p:id",
  country: "/:countrySlug",
  park: "/:parkSlug",
  photos: "/:parkSlug/photos",
  blog: "/blog",
  article: "/blog/:slug",
  experts: "/experts",
  expert: "/expert/:slug",
  contact: "/contact"
};
```

Adjust ambiguous routes to avoid collisions.

---

# 106. Important Routing Collision Rule

Because country and park routes may both look like:

```text
/:slug
```

do not blindly create:

```text
<Route path="/:slug" />
```

for everything.

Use a route resolver:

```text
slug
 ↓
country?
 ↓
park?
 ↓
other entity?
```

or explicit route namespaces where the target site allows them.

---

# 107. SEO Slugs

Generate:

```text
slugify(name)
```

but persist the result.

Never dynamically change a URL because a title changed.

Use:

```text
slug
canonicalSlug
redirect history
```

for SEO-safe changes.

---

# 108. Content Versioning

For CMS content:

```text
draft
published
archived
```

Optional:

```text
version
updatedBy
updatedAt
publishedAt
```

---

# 109. Analytics Hooks

Create reusable event tracking:

```text
search_submitted
tour_viewed
tour_favorited
quote_started
quote_submitted
operator_viewed
country_viewed
park_viewed
review_started
review_submitted
blog_viewed
```

Do not couple components directly to one analytics provider.

---

# 110. Forms

All forms require:

```text
idle
focused
typing
validation-error
submitting
success
server-error
```

Button:

```text
normal
loading
disabled
```

Never allow duplicate submissions.

---

# 111. Mobile Bottom/Sticky Actions

Where the reference page has a persistent mobile CTA, reproduce it.

Candidate actions:

```text
Request a Quote
Favorite
Contact
Search
```

The exact presence must be verified against the mobile screenshots.

---

# 112. Scroll Behavior

Implement:

```text
smooth internal navigation
sticky navigation where visible
sticky filters where visible
scroll restoration
```

For route changes:

```text
new page → scroll top
back → optionally restore prior scroll position
```

---

# 113. Modal Rules

Every modal:

```text
portal to body
overlay
focus trap
Escape close
click outside behavior
scroll lock
mobile full-screen adaptation
```

---

# 114. Drawer Rules

For mobile:

```text
left/right slide
overlay
body scroll lock
close button
Escape
navigation item click closes drawer
```

---

# 115. Accordion Rules

Used for:

```text
filters
FAQs
itinerary
mobile navigation
content sections
```

Animation:

```text
height/opacity
```

Do not use abrupt DOM jumps.

---

# 116. Tabs

Reusable:

```text
<Tabs>
<Tab>
<TabPanel>
```

Support:

```text
mouse
keyboard
mobile horizontal scroll
deep-link/hash if required
```

---

# 117. Maps

Country/park pages should support a map region.

Implement initially with:

```text
Leaflet/OpenStreetMap
```

or the licensed mapping provider used by the authorized project.

Do not hardcode screenshots as maps.

---

# 118. Location Data

Store:

```text
latitude
longitude
zoom
country
region
```

For parks:

```text
center
boundingBox
```

---

# 119. Gallery Data Model

```json
{
  "id": "...",
  "entityType": "park",
  "entityId": "...",
  "url": "...",
  "thumbnail": "...",
  "caption": "...",
  "credit": "...",
  "alt": "...",
  "sortOrder": 1
}
```

---

# 120. Tour Itinerary Data Model

```json
{
  "day": 1,
  "title": "Tarangire National Park",
  "location": "Tarangire NP",
  "description": "...",
  "activities": ["game drive"],
  "accommodation": {},
  "meals": ["lunch", "dinner"],
  "images": []
}
```

---

# 121. Operator Data Model

```json
{
  "id": "p3286",
  "slug": "example-operator",
  "name": "Example Operator",
  "rating": 4.8,
  "reviewCount": 175,
  "offices": [],
  "priceRange": {
    "min": 284,
    "max": 569,
    "currency": "USD",
    "unit": "pp/day"
  },
  "tourTypes": [],
  "destinationIds": [],
  "tourIds": [],
  "description": "",
  "logo": "",
  "photos": []
}
```

---

# 122. Review Rating Model

Use:

```text
overall
wildlife
scenery
bushVibe
birding
```

where category ratings are available.

Render:

```text
5.0
★★★★☆
```

but use accessible text:

```text
4.8 out of 5
```

---

# 123. Country Rating Model

```json
{
  "expertRating": 4.83,
  "userRating": 4.79,
  "wildlife": 4.87,
  "scenery": 4.81,
  "bushVibe": 4.66,
  "birding": 4.50
}
```

---

# 124. Homepage Statistics

Use:

```json
{
  "safariCountries": 18,
  "parksAndReserves": 227,
  "tourPackages": 0,
  "tourOperators": 0,
  "userReviews": 0,
  "expertReviews": 0,
  "experts": 24
}
```

The zero values above intentionally indicate:

> Populate these from the database. Do not copy today's live counts as permanent constants.

---

# 125. Content Freshness

Dynamic values such as:

```text
tour counts
review counts
operator counts
prices
ratings
```

must be generated from current database state.

The current live site has changing totals, so a clone that hardcodes the values will become visually and functionally inaccurate.

---

# 126. Page-by-Page Implementation Order

Build in this order:

## Phase 1

```text
Global CSS/tokens
Header
Footer
Routing
Home
```

## Phase 2

```text
Tour listing
Filters
Tour cards
Search
Pagination
```

## Phase 3

```text
Tour detail
Quote request
Itinerary
Gallery
```

## Phase 4

```text
Country guide
Park guide
Photos
Maps
```

## Phase 5

```text
Operator directory
Operator detail
Top-rated operators
```

## Phase 6

```text
Reviews
Experts
```

## Phase 7

```text
Blog
Articles
```

## Phase 8

```text
Trust
About
Partners
Contact
Legal
Costs
Rankings
```

## Phase 9

```text
Favorites
Authentication
CMS
Admin
```

## Phase 10

```text
Visual QA
Responsive QA
Animation QA
Performance
SEO
Accessibility
```

---

# 127. Exact Clone Acceptance Criteria

The clone is not complete when:

```text
routes exist
```

It is complete when:

### Visual

```text
header matches
hero matches
typography matches
spacing matches
cards match
images match
footer matches
mobile matches
```

### Functional

```text
search works
filters work
sorting works
pagination works
navigation works
gallery works
favorites work
quote request works
reviews work
forms work
```

### Dynamic

```text
data comes from backend
counts are calculated
relationships work
URLs are generated
```

### Responsive

```text
desktop
tablet
mobile
```

### Quality

```text
no console errors
no broken images
no dead links
no hydration/runtime errors
no layout overflow
no inaccessible controls
```

---

# 128. Visual Comparison Rules

For each reference screenshot, calculate/check:

```text
viewport dimensions
header height
content max-width
hero height
column widths
gap sizes
font sizes
line heights
button dimensions
border radius
shadow
image crop
section vertical spacing
```

Use pixel-diff screenshots where possible.

Target:

```text
no obvious visual mismatch at normal viewing distance
```

For exact internal pixel comparison, allow for:

```text
font rendering differences
browser differences
image compression differences
```

---

# 129. Browser Compatibility

Test:

```text
Chrome
Edge
Firefox
Safari
```

Minimum responsive support:

```text
desktop
tablet
mobile
```

---

# 130. Development Environment

Recommended:

```text
Node.js LTS
React
Vite
Express
MongoDB
Mongoose
```

Optional:

```text
Playwright
Vitest
React Testing Library
ESLint
Prettier
```

---

# 131. Automated Route Crawl

Before considering the clone finished, create a crawler/test that visits:

```text
/
 /tours
 /countries-parks
 /operators
 /top-rated-operators
 /tanzania
 /serengeti
 /serengeti/photos
 /p3286
 /tours/t117437
 /blog
 /blog/{sample}
 /experts
 /contact
```

Then verify:

```text
HTTP 200
main heading exists
header exists
footer exists
no JS errors
no broken images
no horizontal overflow
```

---

# 132. Automated Screenshot Test

Use Playwright:

```text
launch browser
set viewport
navigate
wait for network idle
capture screenshot
compare with baseline
```

Create baseline folders:

```text
tests/visual/home/
tests/visual/tours/
tests/visual/tour-detail/
tests/visual/country/
tests/visual/park/
tests/visual/operator/
tests/visual/mobile/
```

---

# 133. Interaction Automation

Automate:

```text
open search
type destination
select suggestion
open date picker
select date
open traveler picker
increase adults
submit search
open filters
apply filter
open tour
favorite tour
open gallery
open quote request
submit validation
```

---

# 134. Image Fidelity Checklist

For every image:

```text
correct source
correct crop
correct aspect ratio
correct focal point
correct resolution
correct loading behavior
correct caption
correct credit
correct alt
```

If the original image cannot legally be reused:

```text
replace with a licensed equivalent
preserve the same dimensions/aspect ratio
preserve the same visual role
```

---

# 135. Copy Fidelity Checklist

For authorized source content:

```text
exact heading
exact labels
exact CTA text
exact capitalization
exact punctuation
exact metadata labels
exact navigation labels
```

For unlicensed content:

```text
use original/licensed/authorized copy
or write replacement copy
```

Do not fill the UI with meaningless lorem ipsum because content length affects layout.

---

# 136. Content Length Matching

Even when replacement content is necessary, approximate the reference:

```text
heading character length
paragraph length
button width
card title length
metadata length
review length
```

This is important for visual fidelity.

---

# 137. Font Loading

Fonts must load before visual screenshot tests.

Use:

```css
font-display: swap;
```

but ensure screenshot tests wait for:

```js
document.fonts.ready
```

before capturing.

---

# 138. Image Loading for Screenshot Tests

Before screenshot:

```js
await page.waitForLoadState("networkidle");
await page.evaluate(async () => {
  await document.fonts.ready;
});
```

Then wait for important images.

---

# 139. Exact Hero Behavior

The hero is a key visual anchor.

Required:

```text
correct image
correct overlay
correct crop
correct heading position
correct search position
correct vertical alignment
```

Do not add:

```text
parallax
large particle effects
unrequested animations
```

unless the reference actually demonstrates them.

---

# 140. Avoid Generic AI Website Patterns

Do NOT turn this into:

```text
modern SaaS dashboard
glassmorphism
giant rounded cards
dark mode
gradient backgrounds
excessive animations
huge typography
floating blobs
```

The target is a travel marketplace/content platform.

The implementation should follow the reference, not current generic AI-generated website trends.

---

# 141. Component Styling Rule

Every component must have a visual reason.

Avoid:

```text
random padding
random border-radius
random shadow
random font
random color
```

Use:

```text
design tokens
reference measurements
component variants
```

---

# 142. Reusable Layout Containers

Create:

```css
.container
.container-wide
.container-narrow
.section
```

The exact max-width must be calibrated against the reference screenshots.

Do not use:

```css
max-width: 1200px;
```

simply because it is common.

Measure the target.

---

# 143. Desktop Grid

Build reusable:

```text
2-column
3-column
4-column
sidebar + content
content + sidebar
```

The grid should change by breakpoint.

---

# 144. Mobile Grid

Default:

```text
1 column
```

Some sections can use:

```text
horizontal scroll
```

where the target design uses carousels.

Avoid squeezing 4 desktop cards into 1 mobile row.

---

# 145. Carousel Rules

If the target uses horizontal card scrolling:

```text
desktop arrows where visible
mobile swipe
snap points
partial next card where visible
```

Implement with CSS scroll snap where appropriate.

---

# 146. Hover States

For every interactive element define:

```text
default
hover
focus
active
disabled
```

Do not use:

```text
hover: scale(1.1)
```

globally.

Use subtle target-matched transitions.

---

# 147. Focus States

Do not remove:

```css
outline: none;
```

without replacing it.

Create accessible focus styling matching the visual language.

---

# 148. Error Handling

React-level:

```text
ErrorBoundary
```

API-level:

```text
centralized error handler
```

User-level:

```text
friendly message
retry
```

---

# 149. Logging

Development:

```text
API errors
route errors
image errors
form errors
```

Production:

```text
structured server logs
```

Do not expose stack traces to users.

---

# 150. Final Build Checklist

## Architecture

- [ ] React frontend
- [ ] Backend/API
- [ ] MongoDB/database
- [ ] reusable components
- [ ] route registry
- [ ] API services
- [ ] centralized tokens

## Homepage

- [ ] header
- [ ] navigation
- [ ] hero
- [ ] search
- [ ] country section
- [ ] popular tours
- [ ] operators
- [ ] blog
- [ ] experts
- [ ] statistics
- [ ] footer

## Tours

- [ ] listing
- [ ] search
- [ ] filters
- [ ] sort
- [ ] pagination
- [ ] cards
- [ ] detail
- [ ] itinerary
- [ ] rates
- [ ] inclusions
- [ ] accommodation
- [ ] quote request

## Destinations

- [ ] countries
- [ ] parks
- [ ] reviews
- [ ] wildlife
- [ ] climate
- [ ] best time
- [ ] maps
- [ ] photos
- [ ] related tours

## Operators

- [ ] directory
- [ ] filters
- [ ] ranking
- [ ] profile
- [ ] tours
- [ ] reviews

## Content

- [ ] experts
- [ ] blog
- [ ] articles
- [ ] trust
- [ ] about
- [ ] contact
- [ ] legal
- [ ] costs
- [ ] rankings

## UX

- [ ] responsive
- [ ] animations
- [ ] loading
- [ ] empty states
- [ ] errors
- [ ] modals
- [ ] drawers
- [ ] galleries
- [ ] favorites
- [ ] currency

## Engineering

- [ ] API validation
- [ ] authentication
- [ ] authorization
- [ ] security
- [ ] indexes
- [ ] image optimization
- [ ] SEO
- [ ] accessibility
- [ ] automated tests
- [ ] visual regression tests

---

# 151. Reference Crawl Notes — September 2026

The live public site was inspected as part of preparing this specification.

The current homepage exposes a marketplace/search-first architecture with:

- Safari/tour navigation
- Countries & Parks
- Tour Operators
- hero search
- top-rated safari countries
- popular safari tours
- top-rated operators
- blog
- experts
- marketplace statistics
- safari links by park/country/type
- currency controls
- general/footer links

The live homepage currently exposes dynamic figures rather than static site content. Those numbers should therefore be treated as database outputs in the clone.

The current tour catalogue includes filters and result counts and uses individual tour detail URLs such as `/tours/t117437`.

Country guide pages such as `/tanzania` contain destination ratings, expert information, rates, best-time information, pros/cons, reviews, wildlife, things to do, climate, and park links.

Park pages such as `/serengeti` use a related destination-guide template.

Dedicated image pages exist under patterns such as `/{park}/photos`.

Operator profiles use public numeric URL patterns such as `/p3286`.

These observations should be used as implementation anchors, while the supplied screenshot directory remains the authority for exact visual measurements.

---

# 152. Important Source/Reference Pages

Use the live site only as a reference during authorized development and QA.

Reference:

```text
https://www.safaribookings.com/
https://www.safaribookings.com/tours
https://www.safaribookings.com/countries-parks
https://www.safaribookings.com/operators
https://www.safaribookings.com/top-rated-operators
https://www.safaribookings.com/tanzania
https://www.safaribookings.com/serengeti
https://www.safaribookings.com/serengeti/photos
https://www.safaribookings.com/tours/t117437
https://www.safaribookings.com/p3286
https://www.safaribookings.com/blog
https://www.safaribookings.com/genuine-reviews
https://www.safaribookings.com/trusted-safari-companies
```

Before implementation, crawl the site's public links and add every discovered route to:

```text
route-inventory.json
```

---

# 153. Route Inventory File

Create:

```json
{
  "routes": [
    {
      "path": "/",
      "type": "home",
      "template": "homepage",
      "dynamic": true
    }
  ]
}
```

For every discovered route store:

```text
path
pageType
template
parameters
queryParameters
links
imageCount
apiDependencies
mobileReference
desktopReference
```

---

# 154. Asset Inventory File

Create:

```json
{
  "assets": [
    {
      "page": "/",
      "component": "hero",
      "type": "image",
      "source": "",
      "localPath": "",
      "license": "",
      "credit": ""
    }
  ]
}
```

This is required for an exact asset-managed implementation.

---

# 155. Final Implementation Principle

The clone should be built as:

```text
REFERENCE SITE
      ↓
ROUTE INVENTORY
      ↓
PAGE TEMPLATES
      ↓
DESIGN TOKENS
      ↓
REUSABLE COMPONENTS
      ↓
DATABASE MODELS
      ↓
API
      ↓
DYNAMIC CONTENT
      ↓
IMAGE/ASSET SYSTEM
      ↓
RESPONSIVE UI
      ↓
INTERACTION + ANIMATION
      ↓
VISUAL REGRESSION
      ↓
FINAL QA
```

Not:

```text
Screenshot
  ↓
One giant React page
  ↓
Hardcoded text
  ↓
Random images
  ↓
Finished
```

---

# 156. Definition of Done

The SafariBookings recreation is considered complete only when:

1. Every major public page type has been implemented.
2. Every important navigation link leads to a functional route.
3. Tour, operator, country, park, review, expert, blog and photo data are database-driven.
4. Search/filter/sort/pagination work through the backend.
5. Tour quote requests are persisted.
6. Favorites work.
7. Responsive layouts match the supplied desktop/tablet/mobile references.
8. Typography matches the supplied design tokens.
9. Images use the correct authorized assets or properly licensed equivalents.
10. Image aspect ratios/crops match.
11. Hover/focus/active/loading/empty/error states exist.
12. Modals/drawers/galleries/date pickers work.
13. Animations are subtle, consistent and reference-matched.
14. SEO metadata is generated per route.
15. Accessibility checks pass.
16. No page has horizontal overflow at supported widths.
17. No page depends on hardcoded mock content.
18. No critical browser console errors remain.
19. Visual regression screenshots have been compared against the reference screenshots.
20. Direct URL navigation and refresh work for every public route.

---

# 157. Developer Instruction

When implementing this document, prioritize **fidelity over creativity**.

If the screenshot says:

```text
small
```

make it small.

If the screenshot says:

```text
tight spacing
```

use tight spacing.

If the screenshot shows:

```text
square card
```

do not round it heavily.

If the screenshot shows:

```text
minimal animation
```

do not add elaborate animation.

The objective is to reproduce the target product's visual language and interaction model, not to redesign it.

The supplied:

```text
D:\fol\complete_site_clone\snapshots
site_layout_blueprint.json
site_style_tokens.json
```

should be treated as the primary visual specification, while live public pages are used to verify routes, content structure and interactions.

---

# 158. Recommended Project Deliverables

At completion, the project should contain:

```text
README.md
SAFARIBOOKINGS_CLONE_SPEC.md

route-inventory.json
image-manifest.json
site-layout.json
site-tokens.json

frontend/
backend/

tests/
  visual/
  integration/
  e2e/

scripts/
  crawl-routes
  generate-images
  seed-database
  visual-test
```

The result should be a maintainable, database-driven recreation rather than a screenshot-only imitation.
