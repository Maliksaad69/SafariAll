import { CATALOG_DESTINATIONS, CATALOG_SECTIONS, CATALOG_EXPERTS } from '@/prisma/catalog-data';
import type { SiteOperator, SiteTour, TourComfortLevel, TourTypeValue } from '@/lib/site-data';

export interface FallbackAgency {
  id: string;
  slug: string;
  companyName: string;
  city: string;
  countryOfOrigin: string;
  yearEstablished: number;
  tier: TourComfortLevel;
  averageRating: number;
  totalReviews: number;
  email: string;
  first: string;
  last: string;
  phone: string;
  registrationNumber: string;
  overviewText: string;
  isVerified: boolean;
  bannerUrl: string;
  logoUrl: string;
  officesIn: string[];
}

export const FALLBACK_AGENCIES: FallbackAgency[] = [
  {
    id: 'op-kili-tanzanian-expeditions',
    slug: 'kili-tanzanian-expeditions',
    companyName: 'Kili Tanzanian Expeditions',
    city: 'Arusha Tourism Complex, Arusha',
    countryOfOrigin: 'Tanzania',
    yearEstablished: 2012,
    tier: 'MID_RANGE',
    averageRating: 4.9,
    totalReviews: 48,
    email: 'info@kiliexpeditions.co.tz',
    first: 'Amara',
    last: 'Mrema',
    phone: '+255 754 123 456',
    registrationNumber: 'TZ-TOUR-84920',
    overviewText:
      'Premier locally owned safari operator specialising in Big Five game drives, Ngorongoro Crater descents and private tailor-made itineraries across the northern Tanzania circuit.',
    isVerified: true,
    bannerUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=120&q=80',
    officesIn: ['Arusha', 'Tanzania'],
  },
  {
    id: 'op-mara-wilderness-safaris',
    slug: 'mara-wilderness-safaris',
    companyName: 'Mara Wilderness Safaris',
    city: 'Karen Road, Nairobi',
    countryOfOrigin: 'Kenya',
    yearEstablished: 2015,
    tier: 'LUXURY',
    averageRating: 4.95,
    totalReviews: 62,
    email: 'safari@marawilderness.co.ke',
    first: 'David',
    last: 'Kimani',
    phone: '+254 722 987 654',
    registrationNumber: 'KE-MIN-39201',
    overviewText:
      'Kenyan safari specialists guiding travellers through the Great Migration in the Masai Mara, the elephant herds of Amboseli and the flamingo shallows of Lake Nakuru.',
    isVerified: true,
    bannerUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=120&q=80',
    officesIn: ['Nairobi', 'Kenya'],
  },
  {
    id: 'op-serengeti-sunrise-safaris',
    slug: 'serengeti-sunrise-safaris',
    companyName: 'Serengeti Sunrise Safaris',
    city: 'Seronera Road, Serengeti',
    countryOfOrigin: 'Tanzania',
    yearEstablished: 2009,
    tier: 'LUXURY',
    averageRating: 4.8,
    totalReviews: 129,
    email: 'bookings@serengetisunrise.co.tz',
    first: 'Neema',
    last: 'Kessy',
    phone: '+255 786 445 210',
    registrationNumber: 'TZ-TOUR-61477',
    overviewText:
      'Luxury tented-camp specialists running photographic safaris and migration-timing expeditions with resident guides who track the herds year-round.',
    isVerified: true,
    bannerUrl: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=120&q=80',
    officesIn: ['Serengeti', 'Arusha', 'Tanzania'],
  },
  {
    id: 'op-okavango-delta-explorers',
    slug: 'okavango-delta-explorers',
    companyName: 'Okavango Delta Explorers',
    city: 'Maun, Ngamiland',
    countryOfOrigin: 'Botswana',
    yearEstablished: 2014,
    tier: 'SUPER_LUXURY',
    averageRating: 4.9,
    totalReviews: 231,
    email: 'hello@okavangoexplorers.bw',
    first: 'Tebogo',
    last: 'Molefe',
    phone: '+267 71 552 908',
    registrationNumber: 'BW-TOU-11293',
    overviewText:
      'Water-and-land wilderness operators working the Okavango Delta, Chobe and the Kalahari with mokoro polers, houseboats and private conservancy concessions.',
    isVerified: true,
    bannerUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=120&q=80',
    officesIn: ['Maun', 'Kasane', 'Botswana'],
  },
  {
    id: 'op-gorilla-highlands-uganda',
    slug: 'gorilla-highlands-uganda',
    companyName: 'Gorilla Highlands Uganda',
    city: 'Kisoro, Western Uganda',
    countryOfOrigin: 'Uganda',
    yearEstablished: 2011,
    tier: 'MID_RANGE',
    averageRating: 4.8,
    totalReviews: 204,
    email: 'trek@gorillahighlands.ug',
    first: 'Grace',
    last: 'Nabirye',
    phone: '+256 772 330 118',
    registrationNumber: 'UG-UTB-55210',
    overviewText:
      'Permit-handling specialists for Bwindi and Mgahinga gorilla trekking, chimp tracking in Kibale and Queen Elizabeth’s crater lakes and tree-climbing lions.',
    isVerified: true,
    bannerUrl: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=120&q=80',
    officesIn: ['Kisoro', 'Kampala', 'Uganda'],
  },
  {
    id: 'op-cape-wilderness-collection',
    slug: 'cape-wilderness-collection',
    companyName: 'Cape Wilderness Collection',
    city: 'Cape Town, Western Cape',
    countryOfOrigin: 'South Africa',
    yearEstablished: 2007,
    tier: 'LUXURY',
    averageRating: 4.75,
    totalReviews: 96,
    email: 'reservations@capewilderness.co.za',
    first: 'Pieter',
    last: 'van der Merwe',
    phone: '+27 21 555 4310',
    registrationNumber: 'ZA-TOU-77341',
    overviewText:
      'Cape-based collection pairing Kruger private reserves and the Garden Route with wine-lands lodges, guided self-drive and family-friendly malaria-free options.',
    isVerified: true,
    bannerUrl: 'https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?auto=format&fit=crop&w=120&q=80',
    officesIn: ['Cape Town', 'Johannesburg', 'South Africa'],
  },
];

export interface FallbackProgram {
  slug: string;
  op: string;
  title: string;
  days: number;
  min: number;
  max: number;
  comfort: TourComfortLevel;
  type: TourTypeValue;
  country: string;
  start: string;
  end: string;
  dests: string[];
  incl: string[];
  excl: string[];
  plan: [string, string][]; // [day title, accommodation]
}

const CORE_INCL = [
  'Private 4x4 safari vehicle with pop-up roof',
  'All park fees and conservation levies',
  'Professional English-speaking driver-guide',
  'Accommodation as listed on a full-board basis',
  'Bottled mineral water throughout',
];
const CORE_EXCL = [
  'International flights and visa fees',
  'Tips for guide and camp staff',
  'Travel and medical insurance',
  'Alcoholic and premium beverages',
];

export const FALLBACK_PROGRAMS: FallbackProgram[] = [
  {
    slug: '5-day-serengeti-ngorongoro-big-five-safari',
    op: 'kili-tanzanian-expeditions',
    title: '5-Day Serengeti & Ngorongoro Big Five Classic Safari',
    days: 5,
    min: 1650,
    max: 2100,
    comfort: 'MID_RANGE',
    type: 'PRIVATE',
    country: 'Tanzania',
    start: 'Arusha / Kilimanjaro Airport',
    end: 'Arusha',
    dests: ['lake-manyara-national-park', 'serengeti-national-park', 'ngorongoro-crater'],
    incl: [
      'Private 4x4 Land Cruiser with pop-up roof',
      'All park entry fees and conservation permits',
      'Full-board mid-range safari lodges',
      'Professional English-speaking driver-guide',
      'Unlimited game drives and mineral water',
    ],
    excl: [
      'International flights and visa fees',
      'Tips for guide ($20/day recommended)',
      'Personal travel insurance',
      'Alcoholic beverages',
    ],
    plan: [
      ['Arusha to Lake Manyara National Park', 'Manyara Wildlife Lodge'],
      ['Lake Manyara to the Central Serengeti Plains', 'Serengeti Heritage Tented Camp'],
      ['Full-day game drive in Serengeti National Park', 'Serengeti Heritage Tented Camp'],
      ['Serengeti to the Ngorongoro Conservation Area', 'Rhino Lodge Ngorongoro'],
      ['Ngorongoro Crater floor and return to Arusha', 'N/A (Departure)'],
    ],
  },
  {
    slug: '3-day-masai-mara-express-fly-in-safari',
    op: 'mara-wilderness-safaris',
    title: '3-Day Masai Mara Express Fly-in Luxury Safari',
    days: 3,
    min: 1290,
    max: 1550,
    comfort: 'LUXURY',
    type: 'FLY_IN',
    country: 'Kenya',
    start: 'Nairobi Wilson Airport',
    end: 'Nairobi Wilson Airport',
    dests: ['masai-mara-national-reserve'],
    incl: [
      'Return domestic flights to the Mara airstrip',
      'Luxury tented-camp accommodation',
      'Shared 4x4 open game-drive vehicle',
      'All park entrance fees',
      'All meals with house wines and beers',
    ],
    excl: [
      'International flights',
      'Hot-air balloon safari ($480 add-on)',
      'Maasai village cultural fee ($30)',
    ],
    plan: [
      ['Fly Nairobi to the Masai Mara and afternoon safari', 'Ashnil Mara Luxury Camp'],
      ['Full day of game viewing along the Mara River', 'Ashnil Mara Luxury Camp'],
      ['Sunrise safari and flight back to Nairobi', 'N/A (Departure)'],
    ],
  },
  {
    slug: '9-day-tanzania-budget-safari-with-beach-holiday',
    op: 'serengeti-sunrise-safaris',
    title: '9-Day Tanzania Budget Safari with Beach Holiday',
    days: 9,
    min: 1432,
    max: 1646,
    comfort: 'BUDGET',
    type: 'SHARED_GROUP',
    country: 'Tanzania',
    start: 'Arusha',
    end: 'Zanzibar',
    dests: ['tarangire-national-park', 'serengeti-national-park', 'ngorongoro-crater', 'zanzibar'],
    incl: CORE_INCL,
    excl: CORE_EXCL,
    plan: [
      ['Arrive Arusha and meet your group', 'Arusha Planet Lodge'],
      ['Tarangire National Park elephant herds', 'Tarangire Simba Camp'],
      ['Into the Serengeti via Naabi Hill', 'Seronera Public Campsite'],
      ['Full-day Serengeti game drive', 'Seronera Public Campsite'],
      ['Ngorongoro Crater descent', 'Simba Campsite, Ngorongoro Rim'],
      ['Crater rim to Arusha', 'Arusha Planet Lodge'],
      ['Fly to Zanzibar, transfer to the coast', 'Kendwa Beach Bungalows'],
      ['Free day — reefs, spice tour or dhow sunset', 'Kendwa Beach Bungalows'],
      ['Departure from Zanzibar', 'N/A (Departure)'],
    ],
  },
  {
    slug: '10-day-chasing-the-big-5-tented-safari',
    op: 'kili-tanzanian-expeditions',
    title: '10-Day Chasing the Big 5 Tented Safari',
    days: 10,
    min: 2744,
    max: 3155,
    comfort: 'MID_RANGE',
    type: 'PRIVATE',
    country: 'Tanzania',
    start: 'Kilimanjaro Airport',
    end: 'Kilimanjaro Airport',
    dests: ['tarangire-national-park', 'serengeti-national-park', 'ngorongoro-crater'],
    incl: CORE_INCL,
    excl: CORE_EXCL,
    plan: [
      ['Arrival and safari briefing', 'Arusha Coffee Lodge'],
      ['Tarangire National Park', 'Tarangire Tented Camp'],
      ['Lake Manyara escarpment and forest', 'Kirurumu Tented Lodge'],
      ['Into the central Serengeti', 'Serengeti Tented Camp'],
      ['Serengeti — big-cat tracking', 'Serengeti Tented Camp'],
      ['Northern Serengeti and the Mara River', 'Kogatende Tented Camp'],
      ['Serengeti to Ngorongoro highlands', 'Ngorongoro Tented Camp'],
      ['Ngorongoro Crater full day', 'Ngorongoro Tented Camp'],
      ['Optional Maasai cultural visit and Arusha', 'Arusha Coffee Lodge'],
      ['Departure', 'N/A (Departure)'],
    ],
  },
  {
    slug: '7-day-serengeti-migration-photographic-safari',
    op: 'serengeti-sunrise-safaris',
    title: '7-Day Serengeti Migration Photographic Safari',
    days: 7,
    min: 3200,
    max: 4100,
    comfort: 'LUXURY',
    type: 'PRIVATE',
    country: 'Tanzania',
    start: 'Arusha',
    end: 'Arusha',
    dests: ['serengeti-national-park', 'ngorongoro-crater'],
    incl: [
      'Private photographic 4x4 with beanbags and charging',
      'Luxury mobile-tented camp that follows the herds',
      'All park fees',
      'Resident photographic guide',
      'Full board with house drinks',
    ],
    excl: ['International flights', 'Balloon safari', 'Camera gear rental', 'Gratuities'],
    plan: [
      ['Arusha to the Serengeti', 'Serengeti Mobile Camp'],
      ['Golden-hour drives in the western corridor', 'Serengeti Mobile Camp'],
      ['Mara River crossing vigil', 'Serengeti Mobile Camp'],
      ['Central Serengeti predators', 'Serengeti Mobile Camp'],
      ['Ngorongoro highlands', 'Ngorongoro Crater Lodge'],
      ['Crater floor at first light', 'Ngorongoro Crater Lodge'],
      ['Return to Arusha', 'N/A (Departure)'],
    ],
  },
  {
    slug: '9-day-botswana-okavango-kalahari-adventure',
    op: 'okavango-delta-explorers',
    title: '9-Day Botswana Okavango & Kalahari Adventure',
    days: 9,
    min: 3360,
    max: 3864,
    comfort: 'LUXURY',
    type: 'PRIVATE',
    country: 'Botswana',
    start: 'Maun',
    end: 'Maun',
    dests: ['okavango-delta', 'chobe-national-park', 'kalahari-desert'],
    incl: [
      'Light-aircraft transfers between camps',
      'Luxury tented camps and lodges',
      'Mokoro, boat and 4x4 activities',
      'All park and concession fees',
      'All meals and local drinks',
    ],
    excl: ['International and regional flights', 'Premium imported spirits', 'Scenic helicopter flights', 'Gratuities'],
    plan: [
      ['Arrive Maun and fly into the Delta', 'Okavango Delta Camp'],
      ['Mokoro and walking safari', 'Okavango Delta Camp'],
      ['Delta channels and birdlife', 'Okavango Delta Camp'],
      ['Fly north to Chobe', 'Chobe River Lodge'],
      ['Chobe riverfront elephant herds', 'Chobe River Lodge'],
      ['Sunset river cruise', 'Chobe River Lodge'],
      ['Into the Kalahari', 'Kalahari Plains Camp'],
      ['Black-maned lions and meerkats', 'Kalahari Plains Camp'],
      ['Fly back to Maun', 'N/A (Departure)'],
    ],
  },
  {
    slug: '6-day-chobe-elephant-river-safari',
    op: 'okavango-delta-explorers',
    title: '6-Day Chobe Elephant River Safari',
    days: 6,
    min: 1890,
    max: 2200,
    comfort: 'MID_RANGE',
    type: 'SHARED_GROUP',
    country: 'Botswana',
    start: 'Kasane',
    end: 'Kasane',
    dests: ['chobe-national-park'],
    incl: CORE_INCL,
    excl: CORE_EXCL,
    plan: [
      ['Arrive Kasane', 'Chobe Safari Lodge'],
      ['Chobe riverfront game drive', 'Chobe Safari Lodge'],
      ['Boat safari and birding', 'Chobe Safari Lodge'],
      ['Chobe to Savuti', 'Savuti Tented Camp'],
      ['Savuti predators', 'Savuti Tented Camp'],
      ['Return to Kasane', 'N/A (Departure)'],
    ],
  },
  {
    slug: '8-day-uganda-gorilla-wildlife-safari',
    op: 'gorilla-highlands-uganda',
    title: '8-Day Uganda Gorilla & Wildlife Safari',
    days: 8,
    min: 3190,
    max: 3688,
    comfort: 'MID_RANGE',
    type: 'PRIVATE',
    country: 'Uganda',
    start: 'Entebbe',
    end: 'Entebbe',
    dests: ['bwindi-impenetrable-national-park', 'queen-elizabeth-national-park'],
    incl: [
      'Uganda gorilla trekking permit included',
      'Private 4x4 with driver-guide',
      'All park and permit fees',
      'Full-board lodges',
      'Drinking water',
    ],
    excl: ['International flights', 'Uganda visa', 'Gorilla permit upgrade costs', 'Tips'],
    plan: [
      ['Arrive Entebbe', 'Lake Victoria Hotel'],
      ['Drive to Queen Elizabeth National Park', 'Queen Elizabeth Safari Lodge'],
      ['Kazinga Channel boat cruise', 'Queen Elizabeth Safari Lodge'],
      ['Ishasha tree-climbing lions to Bwindi', 'Bwindi Silverback Lodge'],
      ['Gorilla trekking in Bwindi', 'Bwindi Silverback Lodge'],
      ['Batwa cultural experience and rest', 'Bwindi Silverback Lodge'],
      ['Return drive to Entebbe', 'Lake Victoria Hotel'],
      ['Departure', 'N/A (Departure)'],
    ],
  },
  {
    slug: '4-day-bwindi-gorilla-trek',
    op: 'gorilla-highlands-uganda',
    title: '4-Day Bwindi Gorilla Trek Express',
    days: 4,
    min: 1950,
    max: 2340,
    comfort: 'LUXURY',
    type: 'FLY_IN',
    country: 'Uganda',
    start: 'Entebbe',
    end: 'Entebbe',
    dests: ['bwindi-impenetrable-national-park'],
    incl: [
      'Gorilla permit',
      'Return light-aircraft flights to Kihihi',
      'Luxury forest lodge',
      'All meals',
      'Private guide on trek day',
    ],
    excl: ['International flights', 'Visa', 'Porter fees (recommended $20)', 'Gratuities'],
    plan: [
      ['Fly Entebbe to Kihihi, transfer to Bwindi', 'Bwindi Silverback Lodge'],
      ['Gorilla trekking day', 'Bwindi Silverback Lodge'],
      ['Community walk and fly back', 'Lake Victoria Hotel'],
      ['Departure', 'N/A (Departure)'],
    ],
  },
  {
    slug: '5-day-kruger-private-reserve-safari',
    op: 'cape-wilderness-collection',
    title: '5-Day Kruger Private Reserve Big Five Safari',
    days: 5,
    min: 2150,
    max: 2980,
    comfort: 'LUXURY',
    type: 'PRIVATE',
    country: 'South Africa',
    start: 'Johannesburg / Skukuza',
    end: 'Johannesburg / Skukuza',
    dests: ['kruger-national-park'],
    incl: [
      'Private game reserve accommodation',
      'Two game drives per day with ranger and tracker',
      'All meals and local beverages',
      'Conservation levies',
      'Road transfers',
    ],
    excl: ['Flights', 'Spa treatments', 'Premium wines', 'Gratuities'],
    plan: [
      ['Arrive and afternoon game drive', 'Sabi Sand Reserve Lodge'],
      ['Sunrise and sunset game drives', 'Sabi Sand Reserve Lodge'],
      ['Full day in the bush with a bush lunch', 'Sabi Sand Reserve Lodge'],
      ['Final game drive and departure', 'N/A (Departure)'],
      ['Reserve day for garden-route extension', 'N/A'],
    ],
  },
  {
    slug: '7-day-cape-town-and-kruger-luxury-holiday',
    op: 'cape-wilderness-collection',
    title: '7-Day Cape Town & Kruger Luxury Holiday',
    days: 7,
    min: 3450,
    max: 4200,
    comfort: 'SUPER_LUXURY',
    type: 'PRIVATE',
    country: 'South Africa',
    start: 'Cape Town',
    end: 'Johannesburg',
    dests: ['kruger-national-park'],
    incl: [
      'Cape Town waterfront hotel',
      'Winelands private tasting day',
      'Private Kruger reserve lodge',
      'Internal flight Cape Town–Skukuza',
      'All breakfasts and game-drive meals',
    ],
    excl: ['International flights', 'Table Mountain cableway', 'Lunches in Cape Town', 'Gratuities'],
    plan: [
      ['Arrive Cape Town', 'V&A Waterfront Hotel'],
      ['Cape Peninsula and penguins', 'V&A Waterfront Hotel'],
      ['Winelands private tasting day', 'V&A Waterfront Hotel'],
      ['Fly to the Kruger', 'Sabi Sand Reserve Lodge'],
      ['Big Five game drives', 'Sabi Sand Reserve Lodge'],
      ['Final morning drive', 'Sabi Sand Reserve Lodge'],
      ['Fly out via Johannesburg', 'N/A (Departure)'],
    ],
  },
  {
    slug: '8-day-kenya-migration-amboseli-safari',
    op: 'mara-wilderness-safaris',
    title: '8-Day Kenya Migration & Amboseli Safari',
    days: 8,
    min: 2480,
    max: 3120,
    comfort: 'MID_RANGE',
    type: 'SHARED_GROUP',
    country: 'Kenya',
    start: 'Nairobi',
    end: 'Nairobi',
    dests: ['lake-nakuru-national-park', 'masai-mara-national-reserve', 'amboseli-national-park'],
    incl: CORE_INCL,
    excl: CORE_EXCL,
    plan: [
      ['Arrive Nairobi', 'Nairobi Serena Hotel'],
      ['Rift Valley and Lake Nakuru', 'Lake Nakuru Lodge'],
      ['Into the Masai Mara', 'Mara Sopa Lodge'],
      ['Full day in the Mara', 'Mara Sopa Lodge'],
      ['Mara to Amboseli', 'Amboseli Serena Safari Lodge'],
      ['Elephants beneath Kilimanjaro', 'Amboseli Serena Safari Lodge'],
      ['Return to Nairobi', 'Nairobi Serena Hotel'],
      ['Departure', 'N/A (Departure)'],
    ],
  },
  {
    slug: '12-day-grand-tanzania-kenya-safari',
    op: 'mara-wilderness-safaris',
    title: '12-Day Grand Tanzania & Kenya Safari',
    days: 12,
    min: 4620,
    max: 5580,
    comfort: 'LUXURY',
    type: 'PRIVATE',
    country: 'Kenya',
    start: 'Kilimanjaro Airport',
    end: 'Nairobi',
    dests: ['ngorongoro-crater', 'serengeti-national-park', 'masai-mara-national-reserve'],
    incl: CORE_INCL,
    excl: CORE_EXCL,
    plan: [
      ['Arrival at Kilimanjaro', 'Arusha Coffee Lodge'],
      ['Tarangire and Lake Manyara', 'Kirurumu Tented Lodge'],
      ['Into the Serengeti', 'Serengeti Tented Camp'],
      ['Serengeti full day', 'Serengeti Tented Camp'],
      ['Northern Serengeti', 'Kogatende Tented Camp'],
      ['Ngorongoro highlands', 'Ngorongoro Tented Camp'],
      ['Crater floor', 'Ngorongoro Tented Camp'],
      ['Cross into Kenya and the Mara', 'Mara Plains Camp'],
      ['Mara game drives', 'Mara Plains Camp'],
      ['Migration crossings', 'Mara Plains Camp'],
      ['Nairobi and rest', 'Nairobi Serena Hotel'],
      ['Departure', 'N/A (Departure)'],
    ],
  },
  {
    slug: '10-day-zimbabwe-victoria-falls-chobe-safari',
    op: 'okavango-delta-explorers',
    title: '10-Day Victoria Falls & Chobe Adventure',
    days: 10,
    min: 2380,
    max: 2990,
    comfort: 'MID_RANGE',
    type: 'SHARED_GROUP',
    country: 'Zimbabwe',
    start: 'Victoria Falls',
    end: 'Maun',
    dests: ['victoria-falls', 'chobe-national-park', 'okavango-delta'],
    incl: CORE_INCL,
    excl: CORE_EXCL,
    plan: [
      ['Arrive Victoria Falls', 'Victoria Falls Safari Lodge'],
      ['Falls tour and sunset cruise', 'Victoria Falls Safari Lodge'],
      ['Rafting or flight of angels', 'Victoria Falls Safari Lodge'],
      ['Transfer to Chobe', 'Chobe Safari Lodge'],
      ['Chobe game drives', 'Chobe Safari Lodge'],
      ['Boat safari', 'Chobe Safari Lodge'],
      ['Into the Delta', 'Okavango Delta Camp'],
      ['Mokoro and walks', 'Okavango Delta Camp'],
      ['Delta exploration', 'Okavango Delta Camp'],
      ['Fly out from Maun', 'N/A (Departure)'],
    ],
  },
];

function formatDestName(slug: string): string {
  const match = CATALOG_DESTINATIONS.find((d) => d.slug === slug);
  if (match) return match.name;
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getFallbackTourCards(filter?: any, take?: number): SiteTour[] {
  let list = FALLBACK_PROGRAMS.map((prog) => {
    const op = FALLBACK_AGENCIES.find((a) => a.slug === prog.op) || FALLBACK_AGENCIES[0];
    const today = new Date().toISOString().slice(0, 10);
    return {
      id: `fallback-${prog.slug}`,
      title: prog.title,
      slug: prog.slug,
      durationDays: prog.days,
      durationNights: prog.days - 1,
      minPriceUsd: prog.min,
      comfortLevel: prog.comfort,
      tourType: prog.type,
      primaryCountry: prog.country,
      startLocation: prog.start,
      inclusions: prog.incl,
      operator: {
        companyName: op.companyName,
        slug: op.slug,
        isVerified: op.isVerified,
        averageRating: op.averageRating,
        totalReviews: op.totalReviews,
      },
      destinations: prog.dests.map((d) => ({
        destination: { name: formatDestName(d) },
      })),
      departures: {
        total: 6,
        open: 5,
        nextOpen: today,
        seatsLeft: 18,
      },
    };
  });

  if (filter?.primaryCountry) {
    list = list.filter((t) => t.primaryCountry.toLowerCase() === filter.primaryCountry.toLowerCase());
  }
  if (filter?.id?.not) {
    list = list.filter((t) => t.id !== filter.id.not);
  }
  if (take) {
    list = list.slice(0, take);
  }

  return list;
}

export function getFallbackTourDetail(slug: string) {
  const prog = FALLBACK_PROGRAMS.find((p) => p.slug === slug);
  if (!prog) return null;

  const op = FALLBACK_AGENCIES.find((a) => a.slug === prog.op) || FALLBACK_AGENCIES[0];

  return {
    id: `fallback-${prog.slug}`,
    slug: prog.slug,
    title: prog.title,
    durationDays: prog.days,
    durationNights: prog.days - 1,
    minPriceUsd: prog.min,
    maxPriceUsd: prog.max,
    comfortLevel: prog.comfort,
    tourType: prog.type,
    primaryCountry: prog.country,
    startLocation: prog.start,
    endLocation: prog.end,
    inclusions: prog.incl,
    exclusions: prog.excl,
    isPublished: true,
    operator: {
      id: op.id,
      companyName: op.companyName,
      slug: op.slug,
      averageRating: op.averageRating,
      totalReviews: op.totalReviews,
      isVerified: op.isVerified,
      countryOfOrigin: op.countryOfOrigin,
      headquartersAddress: op.city,
      overviewText: op.overviewText,
      email: op.email,
      phone: op.phone,
    },
    itineraries: prog.plan.map(([dayTitle, hotel], idx) => ({
      id: `itinerary-${prog.slug}-${idx + 1}`,
      dayNumber: idx + 1,
      title: dayTitle,
      description: `Embark on an exhilarating day across ${prog.country}. Enjoy morning and afternoon wildlife game drives with expert ranger guides, stunning landscapes, and evening relaxation.`,
      accommodationName: hotel,
      mealsIncluded: 'Breakfast, Lunch & Dinner (Full Board)',
      included: ['Game drives & conservation entry fees', 'Bottled mineral water in vehicle'],
    })),
    destinations: prog.dests.map((dSlug) => ({
      destination: {
        id: `dest-${dSlug}`,
        name: formatDestName(dSlug),
        slug: dSlug,
        country: prog.country,
      },
    })),
  };
}

export function getFallbackOperatorCards(): SiteOperator[] {
  const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

  return FALLBACK_AGENCIES.map((op) => {
    const tours = FALLBACK_PROGRAMS.filter((p) => p.op === op.slug);
    const perDay = tours.map((t) => t.min / Math.max(t.days, 1));
    const destinations = Array.from(new Set([op.countryOfOrigin, ...tours.map((t) => t.country)]));

    return {
      id: op.id,
      companyName: op.companyName,
      slug: op.slug,
      averageRating: op.averageRating,
      totalReviews: op.totalReviews,
      officesIn: op.officesIn,
      priceRange: perDay.length ? `${usd(Math.min(...perDay))} to ${usd(Math.max(...perDay))}` : '$250 to $650',
      tourTypes: 'Private and group safaris',
      destinations,
      isVerified: op.isVerified,
      image: op.bannerUrl,
      logo: op.logoUrl,
      toursCount: tours.length,
      topTours: tours.slice(0, 3).map((t) => ({ name: t.title, price: `${usd(t.min)} pp` })),
    };
  });
}

export function getFallbackOperatorDetail(slug: string) {
  const op = FALLBACK_AGENCIES.find((a) => a.slug === slug || a.id === slug);
  if (!op) return null;

  const tours = FALLBACK_PROGRAMS.filter((p) => p.op === op.slug);

  return {
    id: op.id,
    slug: op.slug,
    companyName: op.companyName,
    countryOfOrigin: op.countryOfOrigin,
    headquartersAddress: op.city,
    yearEstablished: op.yearEstablished,
    averageRating: op.averageRating,
    totalReviews: op.totalReviews,
    overviewText: op.overviewText,
    isVerified: op.isVerified,
    bannerUrl: op.bannerUrl,
    logoUrl: op.logoUrl,
    officesIn: op.officesIn,
    user: {
      email: op.email,
      phone: op.phone,
      name: `${op.first} ${op.last}`,
    },
    tours: tours.map((t) => ({
      id: `fallback-${t.slug}`,
      slug: t.slug,
      title: t.title,
      durationDays: t.days,
      minPriceUsd: t.min,
      primaryCountry: t.country,
      isPublished: true,
      operator: {
        companyName: op.companyName,
        slug: op.slug,
        isVerified: op.isVerified,
        averageRating: op.averageRating,
        totalReviews: op.totalReviews,
      },
      destinations: t.dests.map((d) => ({ destination: { name: formatDestName(d) } })),
    })),
    reviews: [
      {
        id: `rev-${op.slug}-1`,
        overallRating: 5,
        reviewTitle: 'Unforgettable African Experience',
        reviewText: `Our trip guided by ${op.companyName} exceeded every expectation. Flawless logistics, incredible wildlife tracking, and wonderful hospitality.`,
        travelerName: 'Sarah Jenkins',
        travelerCountry: 'United Kingdom',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
        traveler: { firstName: 'Sarah', lastName: 'Jenkins', country: 'United Kingdom' },
      },
      {
        id: `rev-${op.slug}-2`,
        overallRating: 5,
        reviewTitle: 'Spectacular Safari Guide and Camp',
        reviewText: 'The knowledge of our guide was exceptional. We saw the Big Five on day two! Highly recommend.',
        travelerName: 'Liam O’Connor',
        travelerCountry: 'Ireland',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
        traveler: { firstName: 'Liam', lastName: 'O’Connor', country: 'Ireland' },
      },
    ],
  };
}

export function getFallbackCountries() {
  const countryDests = CATALOG_DESTINATIONS.filter((d) => d.type === 'COUNTRY');
  const parkDests = CATALOG_DESTINATIONS.filter((d) => d.type !== 'COUNTRY');

  return countryDests.map((c) => {
    const parks = parkDests.filter((p) => p.country === c.name);
    const tours = FALLBACK_PROGRAMS.filter((p) => p.country === c.name);
    return {
      ...c,
      parks,
      toursCount: tours.length,
    };
  });
}

export function getFallbackParkDetail(slug: string) {
  const dest = CATALOG_DESTINATIONS.find((d) => d.slug === slug);
  if (!dest) return null;

  const sections = CATALOG_SECTIONS.filter((s: any) => s.destinationId === dest.id).sort(
    (a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );

  return {
    ...dest,
    sections: sections.length > 0 ? sections : [
      {
        id: `sec-${dest.slug}-overview`,
        title: 'Overview',
        content: dest.description || 'Discover pristine African wildlife sanctuaries and scenic landscapes.',
        sortOrder: 1,
      },
    ],
  };
}

export function getFallbackBlogPosts(take = 3) {
  const fallbackPosts = [
    {
      title: 'The Great Migration Guide: When and Where to Go',
      slug: 'great-migration-guide',
      coverImageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Top 10 Things to Pack for Your First African Safari',
      slug: 'top-10-safari-packing-list',
      coverImageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Serengeti vs Masai Mara: How to Choose Your Safari',
      slug: 'serengeti-vs-masai-mara',
      coverImageUrl: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80',
    },
  ];
  return fallbackPosts.slice(0, take);
}
