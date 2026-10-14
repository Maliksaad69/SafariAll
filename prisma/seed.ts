import { PrismaClient, Role, ComfortLevel, TourType, DestinationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const day = 86_400_000;
const inDays = (n: number) => new Date(Date.now() + n * day);

/* ── Agencies ───────────────────────────────────────────────────────── */
const AGENCIES = [
  {
    slug: 'kili-tanzanian-expeditions',
    company: 'Kili Tanzanian Expeditions',
    city: 'Arusha Tourism Complex, Arusha',
    country: 'Tanzania',
    year: 2012,
    tier: ComfortLevel.MID_RANGE,
    rating: 4.9,
    reviews: 48,
    email: 'info@kiliexpeditions.co.tz',
    first: 'Amara',
    last: 'Mrema',
    phone: '+255 754 123 456',
    reg: 'TZ-TOUR-84920',
    overview:
      'Premier locally owned safari operator specialising in Big Five game drives, Ngorongoro Crater descents and private tailor-made itineraries across the northern Tanzania circuit.',
  },
  {
    slug: 'mara-wilderness-safaris',
    company: 'Mara Wilderness Safaris',
    city: 'Karen Road, Nairobi',
    country: 'Kenya',
    year: 2015,
    tier: ComfortLevel.LUXURY,
    rating: 4.95,
    reviews: 62,
    email: 'safari@marawilderness.co.ke',
    first: 'David',
    last: 'Kimani',
    phone: '+254 722 987 654',
    reg: 'KE-MIN-39201',
    overview:
      'Kenyan safari specialists guiding travellers through the Great Migration in the Masai Mara, the elephant herds of Amboseli and the flamingo shallows of Lake Nakuru.',
  },
  {
    slug: 'serengeti-sunrise-safaris',
    company: 'Serengeti Sunrise Safaris',
    city: 'Seronera Road, Serengeti',
    country: 'Tanzania',
    year: 2009,
    tier: ComfortLevel.LUXURY,
    rating: 4.8,
    reviews: 129,
    email: 'bookings@serengetisunrise.co.tz',
    first: 'Neema',
    last: 'Kessy',
    phone: '+255 786 445 210',
    reg: 'TZ-TOUR-61477',
    overview:
      'Luxury tented-camp specialists running photographic safaris and migration-timing expeditions with resident guides who track the herds year-round.',
  },
  {
    slug: 'okavango-delta-explorers',
    company: 'Okavango Delta Explorers',
    city: 'Maun, Ngamiland',
    country: 'Botswana',
    year: 2014,
    tier: ComfortLevel.SUPER_LUXURY,
    rating: 4.9,
    reviews: 231,
    email: 'hello@okavangoexplorers.bw',
    first: 'Tebogo',
    last: 'Molefe',
    phone: '+267 71 552 908',
    reg: 'BW-TOU-11293',
    overview:
      'Water-and-land wilderness operators working the Okavango Delta, Chobe and the Kalahari with mokoro polers, houseboats and private conservancy concessions.',
  },
  {
    slug: 'gorilla-highlands-uganda',
    company: 'Gorilla Highlands Uganda',
    city: 'Kisoro, Western Uganda',
    country: 'Uganda',
    year: 2011,
    tier: ComfortLevel.MID_RANGE,
    rating: 4.8,
    reviews: 204,
    email: 'trek@gorillahighlands.ug',
    first: 'Grace',
    last: 'Nabirye',
    phone: '+256 772 330 118',
    reg: 'UG-UTB-55210',
    overview:
      'Permit-handling specialists for Bwindi and Mgahinga gorilla trekking, chimp tracking in Kibale and Queen Elizabeth’s crater lakes and tree-climbing lions.',
  },
  {
    slug: 'cape-wilderness-collection',
    company: 'Cape Wilderness Collection',
    city: 'Cape Town, Western Cape',
    country: 'South Africa',
    year: 2007,
    tier: ComfortLevel.LUXURY,
    rating: 4.75,
    reviews: 96,
    email: 'reservations@capewilderness.co.za',
    first: 'Pieter',
    last: 'van der Merwe',
    phone: '+27 21 555 4310',
    reg: 'ZA-TOU-77341',
    overview:
      'Cape-based collection pairing Kruger private reserves and the Garden Route with wine-lands lodges, guided self-drive and family-friendly malaria-free options.',
  },
];

/* ── Destinations ───────────────────────────────────────────────────── */
const DESTINATIONS = [
  ['serengeti-national-park', 'Serengeti National Park', 'Tanzania', DestinationType.NATIONAL_PARK, -2.3333, 34.8333,
    'World-famous for the annual Great Wildebeest Migration and endless savanna plains teeming with lion, leopard and cheetah.', ['Lion', 'Leopard', 'Elephant', 'Rhino', 'Buffalo', 'Cheetah', 'Wildebeest']],
  ['ngorongoro-crater', 'Ngorongoro Crater', 'Tanzania', DestinationType.GAME_RESERVE, -3.2081, 35.5397,
    'The largest intact volcanic caldera on earth, holding the highest density of large mammals in Africa including rare black rhino.', ['Black Rhino', 'Lion', 'Elephant', 'Hippo', 'Flamingo', 'Hyena']],
  ['tarangire-national-park', 'Tarangire National Park', 'Tanzania', DestinationType.NATIONAL_PARK, -3.8333, 36.0,
    'Baobab-studded park famous for its dry-season elephant herds and river-valley birdlife.', ['Elephant', 'Lion', 'Zebra', 'Giraffe', 'Baobab']],
  ['lake-manyara-national-park', 'Lake Manyara National Park', 'Tanzania', DestinationType.NATIONAL_PARK, -3.5833, 35.8333,
    'Groundwater forest and soda lake below the Rift escarpment, known for tree-climbing lions.', ['Tree-climbing Lion', 'Elephant', 'Flamingo', 'Baboon']],
  ['zanzibar', 'Zanzibar Archipelago', 'Tanzania', DestinationType.ISLAND, -6.1659, 39.2026,
    'Spice-island beaches, Stone Town heritage and reef diving — the classic safari-and-beach add-on.', ['Reef Fish', 'Dolphin', 'Sea Turtle']],
  ['masai-mara-national-reserve', 'Masai Mara National Reserve', 'Kenya', DestinationType.NATIONAL_PARK, -1.4833, 35.1433,
    'Iconic Kenyan reserve celebrated for the Mara River crossings of the Great Migration.', ['Lion', 'Leopard', 'Elephant', 'Rhino', 'Buffalo', 'Giraffe']],
  ['amboseli-national-park', 'Amboseli National Park', 'Kenya', DestinationType.NATIONAL_PARK, -2.6527, 37.2606,
    'Big-tusker elephant country beneath the snows of Mount Kilimanjaro.', ['Elephant', 'Lion', 'Cheetah', 'Hippo']],
  ['lake-nakuru-national-park', 'Lake Nakuru National Park', 'Kenya', DestinationType.NATIONAL_PARK, -0.3667, 36.0833,
    'Rift Valley soda lake ringed by flamingo flocks and a fenced rhino sanctuary.', ['White Rhino', 'Flamingo', 'Rothschild Giraffe', 'Leopard']],
  ['okavango-delta', 'Okavango Delta', 'Botswana', DestinationType.NATIONAL_PARK, -19.2833, 22.9167,
    'An inland delta of channels and islands where the Kalahari meets permanent water.', ['Elephant', 'Wild Dog', 'Lion', 'Lechwe', 'Hippo']],
  ['chobe-national-park', 'Chobe National Park', 'Botswana', DestinationType.NATIONAL_PARK, -18.6667, 24.5,
    'Home to Africa’s largest elephant concentrations along the Chobe riverfront.', ['Elephant', 'Buffalo', 'Lion', 'Sable Antelope']],
  ['kalahari-desert', 'Kalahari Desert', 'Botswana', DestinationType.NATURE_RESERVE, -23.0, 22.0,
    'Fossil riverbeds and red dunes supporting black-maned Kalahari lions and meerkats.', ['Black-maned Lion', 'Cheetah', 'Meerkat', 'Oryx']],
  ['bwindi-impenetrable-national-park', 'Bwindi Impenetrable National Park', 'Uganda', DestinationType.NATIONAL_PARK, -1.05, 29.6167,
    'Ancient montane rainforest sheltering roughly half the world’s mountain gorillas.', ['Mountain Gorilla', 'L’Hoest Monkey', 'African Green Broadbill']],
  ['queen-elizabeth-national-park', 'Queen Elizabeth National Park', 'Uganda', DestinationType.NATIONAL_PARK, -0.2, 30.0,
    'Crater lakes, the Kazinga Channel and the famous tree-climbing lions of Ishasha.', ['Tree-climbing Lion', 'Elephant', 'Hippo', 'Uganda Kob']],
  ['kruger-national-park', 'Kruger National Park', 'South Africa', DestinationType.NATIONAL_PARK, -23.9884, 31.5547,
    'South Africa’s flagship park and private reserves — the most accessible Big Five destination.', ['Lion', 'Leopard', 'Elephant', 'Rhino', 'Buffalo']],
  ['victoria-falls', 'Victoria Falls', 'Zimbabwe', DestinationType.NATURAL_WONDER, -17.9243, 25.8572,
    'The Smoke That Thunders — the world’s largest sheet of falling water on the Zambezi.', ['Zambezi', 'Adventure Capital']],
] as const;

/* ── Programmes ─────────────────────────────────────────────────────── */
type Prog = {
  slug: string; op: string; title: string; days: number; min: number; max: number;
  comfort: ComfortLevel; type: TourType; country: string; start: string; end: string;
  dests: string[]; incl: string[]; excl: string[];
  plan: [string, string][]; // [day title, accommodation]
};

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

const PROGRAMS: Prog[] = [
  {
    slug: '5-day-serengeti-ngorongoro-big-five-safari', op: 'kili-tanzanian-expeditions',
    title: '5-Day Serengeti & Ngorongoro Big Five Classic Safari', days: 5, min: 1650, max: 2100,
    comfort: ComfortLevel.MID_RANGE, type: TourType.PRIVATE, country: 'Tanzania',
    start: 'Arusha / Kilimanjaro Airport', end: 'Arusha',
    dests: ['lake-manyara-national-park', 'serengeti-national-park', 'ngorongoro-crater'],
    incl: ['Private 4x4 Land Cruiser with pop-up roof', 'All park entry fees and conservation permits', 'Full-board mid-range safari lodges', 'Professional English-speaking driver-guide', 'Unlimited game drives and mineral water'],
    excl: ['International flights and visa fees', 'Tips for guide ($20/day recommended)', 'Personal travel insurance', 'Alcoholic beverages'],
    plan: [
      ['Arusha to Lake Manyara National Park', 'Manyara Wildlife Lodge'],
      ['Lake Manyara to the Central Serengeti Plains', 'Serengeti Heritage Tented Camp'],
      ['Full-day game drive in Serengeti National Park', 'Serengeti Heritage Tented Camp'],
      ['Serengeti to the Ngorongoro Conservation Area', 'Rhino Lodge Ngorongoro'],
      ['Ngorongoro Crater floor and return to Arusha', 'N/A (Departure)'],
    ],
  },
  {
    slug: '3-day-masai-mara-express-fly-in-safari', op: 'mara-wilderness-safaris',
    title: '3-Day Masai Mara Express Fly-in Luxury Safari', days: 3, min: 1290, max: 1550,
    comfort: ComfortLevel.LUXURY, type: TourType.FLY_IN, country: 'Kenya',
    start: 'Nairobi Wilson Airport', end: 'Nairobi Wilson Airport',
    dests: ['masai-mara-national-reserve'],
    incl: ['Return domestic flights to the Mara airstrip', 'Luxury tented-camp accommodation', 'Shared 4x4 open game-drive vehicle', 'All park entrance fees', 'All meals with house wines and beers'],
    excl: ['International flights', 'Hot-air balloon safari ($480 add-on)', 'Maasai village cultural fee ($30)'],
    plan: [
      ['Fly Nairobi to the Masai Mara and afternoon safari', 'Ashnil Mara Luxury Camp'],
      ['Full day of game viewing along the Mara River', 'Ashnil Mara Luxury Camp'],
      ['Sunrise safari and flight back to Nairobi', 'N/A (Departure)'],
    ],
  },
  {
    slug: '9-day-tanzania-budget-safari-with-beach-holiday', op: 'serengeti-sunrise-safaris',
    title: '9-Day Tanzania Budget Safari with Beach Holiday', days: 9, min: 1432, max: 1646,
    comfort: ComfortLevel.BUDGET, type: TourType.SHARED_GROUP, country: 'Tanzania',
    start: 'Arusha', end: 'Zanzibar',
    dests: ['tarangire-national-park', 'serengeti-national-park', 'ngorongoro-crater', 'zanzibar'],
    incl: CORE_INCL, excl: CORE_EXCL,
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
    slug: '10-day-chasing-the-big-5-tented-safari', op: 'kili-tanzanian-expeditions',
    title: '10-Day Chasing the Big 5 Tented Safari', days: 10, min: 2744, max: 3155,
    comfort: ComfortLevel.MID_RANGE, type: TourType.PRIVATE, country: 'Tanzania',
    start: 'Kilimanjaro Airport', end: 'Kilimanjaro Airport',
    dests: ['tarangire-national-park', 'serengeti-national-park', 'ngorongoro-crater'],
    incl: CORE_INCL, excl: CORE_EXCL,
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
    slug: '7-day-serengeti-migration-photographic-safari', op: 'serengeti-sunrise-safaris',
    title: '7-Day Serengeti Migration Photographic Safari', days: 7, min: 3200, max: 4100,
    comfort: ComfortLevel.LUXURY, type: TourType.PRIVATE, country: 'Tanzania',
    start: 'Arusha', end: 'Arusha',
    dests: ['serengeti-national-park', 'ngorongoro-crater'],
    incl: ['Private photographic 4x4 with beanbags and charging', 'Luxury mobile-tented camp that follows the herds', 'All park fees', 'Resident photographic guide', 'Full board with house drinks'],
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
    slug: '9-day-botswana-okavango-kalahari-adventure', op: 'okavango-delta-explorers',
    title: '9-Day Botswana Okavango & Kalahari Adventure', days: 9, min: 3360, max: 3864,
    comfort: ComfortLevel.LUXURY, type: TourType.PRIVATE, country: 'Botswana',
    start: 'Maun', end: 'Maun',
    dests: ['okavango-delta', 'chobe-national-park', 'kalahari-desert'],
    incl: ['Light-aircraft transfers between camps', 'Luxury tented camps and lodges', 'Mokoro, boat and 4x4 activities', 'All park and concession fees', 'All meals and local drinks'],
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
    slug: '6-day-chobe-elephant-river-safari', op: 'okavango-delta-explorers',
    title: '6-Day Chobe Elephant River Safari', days: 6, min: 1890, max: 2200,
    comfort: ComfortLevel.MID_RANGE, type: TourType.SHARED_GROUP, country: 'Botswana',
    start: 'Kasane', end: 'Kasane',
    dests: ['chobe-national-park'],
    incl: CORE_INCL, excl: CORE_EXCL,
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
    slug: '8-day-uganda-gorilla-wildlife-safari', op: 'gorilla-highlands-uganda',
    title: '8-Day Uganda Gorilla & Wildlife Safari', days: 8, min: 3190, max: 3688,
    comfort: ComfortLevel.MID_RANGE, type: TourType.PRIVATE, country: 'Uganda',
    start: 'Entebbe', end: 'Entebbe',
    dests: ['bwindi-impenetrable-national-park', 'queen-elizabeth-national-park'],
    incl: ['Uganda gorilla trekking permit included', 'Private 4x4 with driver-guide', 'All park and permit fees', 'Full-board lodges', 'Drinking water'],
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
    slug: '4-day-bwindi-gorilla-trek', op: 'gorilla-highlands-uganda',
    title: '4-Day Bwindi Gorilla Trek Express', days: 4, min: 1950, max: 2340,
    comfort: ComfortLevel.LUXURY, type: TourType.FLY_IN, country: 'Uganda',
    start: 'Entebbe', end: 'Entebbe',
    dests: ['bwindi-impenetrable-national-park'],
    incl: ['Gorilla permit', 'Return light-aircraft flights to Kihihi', 'Luxury forest lodge', 'All meals', 'Private guide on trek day'],
    excl: ['International flights', 'Visa', 'Porter fees (recommended $20)', 'Gratuities'],
    plan: [
      ['Fly Entebbe to Kihihi, transfer to Bwindi', 'Bwindi Silverback Lodge'],
      ['Gorilla trekking day', 'Bwindi Silverback Lodge'],
      ['Community walk and fly back', 'Lake Victoria Hotel'],
      ['Departure', 'N/A (Departure)'],
    ],
  },
  {
    slug: '5-day-kruger-private-reserve-safari', op: 'cape-wilderness-collection',
    title: '5-Day Kruger Private Reserve Big Five Safari', days: 5, min: 2150, max: 2980,
    comfort: ComfortLevel.LUXURY, type: TourType.PRIVATE, country: 'South Africa',
    start: 'Johannesburg / Skukuza', end: 'Johannesburg / Skukuza',
    dests: ['kruger-national-park'],
    incl: ['Private game reserve accommodation', 'Two game drives per day with ranger and tracker', 'All meals and local beverages', 'Conservation levies', 'Road transfers'],
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
    slug: '7-day-cape-town-and-kruger-luxury-holiday', op: 'cape-wilderness-collection',
    title: '7-Day Cape Town & Kruger Luxury Holiday', days: 7, min: 3450, max: 4200,
    comfort: ComfortLevel.SUPER_LUXURY, type: TourType.PRIVATE, country: 'South Africa',
    start: 'Cape Town', end: 'Johannesburg',
    dests: ['kruger-national-park'],
    incl: ['Cape Town waterfront hotel', 'Winelands private tasting day', 'Private Kruger reserve lodge', 'Internal flight Cape Town–Skukuza', 'All breakfasts and game-drive meals'],
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
    slug: '8-day-kenya-migration-amboseli-safari', op: 'mara-wilderness-safaris',
    title: '8-Day Kenya Migration & Amboseli Safari', days: 8, min: 2480, max: 3120,
    comfort: ComfortLevel.MID_RANGE, type: TourType.SHARED_GROUP, country: 'Kenya',
    start: 'Nairobi', end: 'Nairobi',
    dests: ['lake-nakuru-national-park', 'masai-mara-national-reserve', 'amboseli-national-park'],
    incl: CORE_INCL, excl: CORE_EXCL,
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
    slug: '12-day-grand-tanzania-kenya-safari', op: 'mara-wilderness-safaris',
    title: '12-Day Grand Tanzania & Kenya Safari', days: 12, min: 4620, max: 5580,
    comfort: ComfortLevel.LUXURY, type: TourType.PRIVATE, country: 'Kenya',
    start: 'Kilimanjaro Airport', end: 'Nairobi',
    dests: ['ngorongoro-crater', 'serengeti-national-park', 'masai-mara-national-reserve'],
    incl: CORE_INCL, excl: CORE_EXCL,
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
    slug: '10-day-zimbabwe-victoria-falls-chobe-safari', op: 'okavango-delta-explorers',
    title: '10-Day Victoria Falls & Chobe Adventure', days: 10, min: 2380, max: 2990,
    comfort: ComfortLevel.MID_RANGE, type: TourType.SHARED_GROUP, country: 'Zimbabwe',
    start: 'Victoria Falls', end: 'Maun',
    dests: ['victoria-falls', 'chobe-national-park', 'okavango-delta'],
    incl: CORE_INCL, excl: CORE_EXCL,
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

const TRAVELERS = [
  { email: 'traveler@gmail.com', first: 'Sarah', last: 'Jenkins', country: 'United Kingdom', phone: '+44 7700 900077' },
  { email: 'liam.oconnor@example.com', first: 'Liam', last: 'O’Connor', country: 'Ireland', phone: '+353 87 220 1188' },
  { email: 'yuki.tanaka@example.com', first: 'Yuki', last: 'Tanaka', country: 'Japan', phone: '+81 90 3344 2211' },
  { email: 'ana.silva@example.com', first: 'Ana', last: 'Silva', country: 'Brazil', phone: '+55 11 98877 4455' },
  { email: 'hans.mueller@example.com', first: 'Hans', last: 'Müller', country: 'Germany', phone: '+49 151 2233 4455' },
];

async function main() {
  console.log('🌱 Seeding SafariRequest marketplace…');

  const adminPw = await bcrypt.hash('AdminPass123!', 10);
  const opPw = await bcrypt.hash('OperatorPass123!', 10);
  const trPw = await bcrypt.hash('TravelerPass123!', 10);

  /* Admin */
  await prisma.user.upsert({
    where: { email: 'admin@safariasili.com' },
    update: {},
    create: { email: 'admin@safariasili.com', passwordHash: adminPw, firstName: 'System', lastName: 'Admin', role: Role.ADMIN, emailVerified: true, country: 'Kenya' },
  });

  /* Destinations */
  const destIds: Record<string, string> = {};
  for (const [slug, name, country, type, lat, lng, description, wildlife] of DESTINATIONS) {
    const d = await prisma.destination.upsert({
      where: { slug },
      update: {},
      create: {
        name, slug, country, type, description,
        latitude: lat as number, longitude: lng as number,
        bestTimeToVisit: { jan: 'GOOD', feb: 'GOOD', mar: 'GOOD', apr: 'FAIR', may: 'GOOD', jun: 'EXCELLENT', jul: 'EXCELLENT', aug: 'EXCELLENT', sep: 'EXCELLENT', oct: 'EXCELLENT', nov: 'GOOD', dec: 'GOOD' },
        wildlifePresent: wildlife as unknown as string[],
      },
    });
    destIds[slug] = d.id;
  }
  console.log(`✅ ${DESTINATIONS.length} destinations`);

  /* Agencies */
  const opIds: Record<string, string> = {};
  for (const a of AGENCIES) {
    const u = await prisma.user.upsert({
      where: { email: a.email },
      update: {},
      create: { email: a.email, passwordHash: opPw, firstName: a.first, lastName: a.last, role: Role.OPERATOR, emailVerified: true, country: a.country, phone: a.phone },
    });
    const op = await prisma.operator.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id, companyName: a.company, slug: a.slug, countryOfOrigin: a.country,
        headquartersAddress: a.city, registrationNumber: a.reg, isVerified: true, verificationDate: new Date(),
        overviewText: a.overview, yearEstablished: a.year, priceTier: a.tier,
        averageRating: a.rating, totalReviews: a.reviews,
      },
    });
    opIds[a.slug] = op.id;
  }
  console.log(`✅ ${AGENCIES.length} verified agencies`);

  /* Programmes + itineraries + limited-seat departures */
  let slotTotal = 0;
  for (const p of PROGRAMS) {
    const opId = opIds[p.op];
    const tour = await prisma.tour.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        operatorId: opId, title: p.title, slug: p.slug,
        durationDays: p.days, durationNights: Math.max(0, p.days - 1),
        minPriceUsd: p.min, maxPriceUsd: p.max,
        comfortLevel: p.comfort, tourType: p.type, primaryCountry: p.country,
        startLocation: p.start, endLocation: p.end,
        inclusions: p.incl, exclusions: p.excl,
        destinations: { create: p.dests.map((s) => ({ destinationId: destIds[s] })) },
        itineraries: {
          create: p.plan.map(([title, accommodationName], i) => ({
            dayNumber: i + 1, title,
            description: `${title}. Your guide handles all logistics, park formalities and timing so the day flows from dawn game drive to sundowner.`,
            accommodationName, accommodationType: p.comfort,
            mealsIncluded: i === p.plan.length - 1 ? 'Breakfast' : 'Breakfast, Lunch, Dinner',
          })),
        },
      },
    });

    // Capacity mode = fixed departure slots, and 4 limited-seat departures
    await prisma.tourAvailability.upsert({
      where: { tourId: tour.id },
      update: {},
      create: { tourId: tour.id, mode: 'SLOTS' },
    });

    const capacities = [6, 7, 8, 4];
    for (let i = 0; i < 4; i++) {
      await prisma.tourSlot.upsert({
        where: { tourId_startDate: { tourId: tour.id, startDate: inDays(21 + i * 30) } },
        update: {},
        create: {
          tourId: tour.id,
          startDate: inDays(21 + i * 30),
          maxTravelers: capacities[i],
          note: capacities[i] <= 4 ? 'Small-group guaranteed departure' : 'Standard departure',
        },
      });
      slotTotal++;
    }
  }
  console.log(`✅ ${PROGRAMS.length} programmes · ${slotTotal} limited-seat departures`);

  /* Travellers */
  const trIds: Record<string, string> = {};
  for (const t of TRAVELERS) {
    const u = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: { email: t.email, passwordHash: trPw, firstName: t.first, lastName: t.last, role: Role.TRAVELER, emailVerified: true, country: t.country, phone: t.phone },
    });
    trIds[t.email] = u.id;
  }
  console.log(`✅ ${TRAVELERS.length} travellers`);

  /* Reviews (approved, to justify agency ratings) */
  const reviews = [
    ['kili-tanzanian-expeditions', '5-Day Serengeti & Ngorongoro Big Five Classic Safari', 5, 'Flawless from pickup to drop-off', 'Amara’s team tracked a leopard kill on day three and our guide read the bush like a book. Every transfer was on time.', 'traveler@gmail.com'],
    ['kili-tanzanian-expeditions', '10-Day Chasing the Big 5 Tented Safari', 4.8, 'Big Five ticked off by day six', 'Tented camps were spotless and the crater descent was the highlight of our lives.', 'hans.mueller@example.com'],
    ['mara-wilderness-safaris', '3-Day Masai Mara Express Fly-in Luxury Safari', 5, 'Worth every shilling', 'The bush plane, the camp, the Mara River crossing — David planned it to the minute.', 'liam.oconnor@example.com'],
    ['serengeti-sunrise-safaris', '7-Day Serengeti Migration Photographic Safari', 4.9, 'A photographer’s dream', 'Beanbags in the vehicle, resident guide who knew the herds, and golden-hour positioning every single day.', 'yuki.tanaka@example.com'],
    ['okavango-delta-explorers', '9-Day Botswana Okavango & Kalahari Adventure', 5, 'Water and desert, perfectly balanced', 'Mokoro at dawn, black-maned lions at dusk. Tebogo’s logistics were invisible in the best way.', 'ana.silva@example.com'],
    ['gorilla-highlands-uganda', '8-Day Uganda Gorilla & Wildlife Safari', 4.8, 'One hour with a gorilla family', 'Permits sorted months ahead, and the trek was paced kindly. Unforgettable.', 'traveler@gmail.com'],
    ['cape-wilderness-collection', '5-Day Kruger Private Reserve Big Five Safari', 4.7, 'Ranger and tracker made it', 'Two drives a day, no crowds, and a leopard on the final morning.', 'hans.mueller@example.com'],
  ];
  for (const [opSlug, tourTitle, rating, title, body, reviewerEmail] of reviews as [string, string, number, string, string, string][]) {
    const existing = await prisma.review.findFirst({ where: { operatorId: opIds[opSlug], reviewTitle: title } });
    if (existing) continue;
    const tour = await prisma.tour.findFirst({ where: { title: tourTitle } });
    await prisma.review.create({
      data: {
        operatorId: opIds[opSlug], tourId: tour?.id ?? null, travelerId: trIds[reviewerEmail],
        overallRating: rating, guideRating: rating, vehicleRating: rating, valueRating: rating,
        itineraryAccuracyRating: rating, reviewTitle: title, reviewBody: body,
        travelDate: new Date(Date.now() - 120 * day), status: 'APPROVED',
      },
    });
  }
  console.log(`✅ ${reviews.length} approved reviews`);

  /* Demo reservations — cover every lifecycle state */
  const tourBySlug = async (slug: string) => prisma.tour.findUnique({ where: { slug } });
  const sarah = trIds['traveler@gmail.com'];
  const liam = trIds['liam.oconnor@example.com'];

  const pastTour = await tourBySlug('5-day-serengeti-ngorongoro-big-five-safari');
  const upcomingTour = await tourBySlug('3-day-masai-mara-express-fly-in-luxury-safari') ?? await tourBySlug('3-day-masai-mara-express-fly-in-safari');
  const pendingTour = await tourBySlug('8-day-uganda-gorilla-wildlife-safari');

  const demoReservations: { ref: string; travelerId: string; tourId: string; operatorId: string; start: Date; adults: number; children: number; total: number; status: 'APPROVED' | 'PENDING' | 'COMPLETED' | 'DECLINED' }[] = [];
  if (pastTour) demoReservations.push({ ref: 'SR-PAST0001', travelerId: sarah, tourId: pastTour.id, operatorId: pastTour.operatorId, start: inDays(-40), adults: 2, children: 0, total: 3300, status: 'APPROVED' });
  if (upcomingTour) demoReservations.push({ ref: 'SR-UPCOM001', travelerId: sarah, tourId: upcomingTour.id, operatorId: upcomingTour.operatorId, start: inDays(35), adults: 2, children: 1, total: 3225, status: 'APPROVED' });
  if (pendingTour) demoReservations.push({ ref: 'SR-PEND0001', travelerId: liam, tourId: pendingTour.id, operatorId: pendingTour.operatorId, start: inDays(70), adults: 2, children: 0, total: 6380, status: 'PENDING' });
  if (pastTour) demoReservations.push({ ref: 'SR-DONE0001', travelerId: liam, tourId: pastTour.id, operatorId: pastTour.operatorId, start: inDays(-150), adults: 4, children: 0, total: 6600, status: 'COMPLETED' });

  for (const r of demoReservations) {
    const exists = await prisma.reservation.findUnique({ where: { reference: r.ref } });
    if (exists) continue;
    await prisma.reservation.create({
      data: {
        reference: r.ref, travelerId: r.travelerId, tourId: r.tourId, operatorId: r.operatorId,
        startDate: r.start, adultsCount: r.adults, childrenCount: r.children,
        estimatedTotalUsd: r.total, status: r.status,
        decidedAt: r.status === 'PENDING' ? null : r.start,
        completedAt: r.status === 'COMPLETED' ? new Date(r.start.getTime() + 5 * day) : null,
      },
    });
  }
  console.log(`✅ ${demoReservations.length} demo reservations`);

  /* Seed a welcome notification so the bell is never empty for the demo traveller */
  const existingNote = await prisma.notification.findFirst({ where: { userId: sarah } });
  if (!existingNote) {
    await prisma.notification.create({
      data: {
        userId: sarah, type: 'INFO', title: 'Welcome to SafariRequest',
        body: 'Track your quotes, reservations and trip updates here. We will notify you the moment an agency responds.',
        link: '/my-trips',
      },
    });
  }

  console.log('\n🎉 Seed complete.');
  console.log('──────────────────────────────────────────────');
  console.log('🔑 admin@safariasili.com      / AdminPass123!');
  console.log('🔑 info@kiliexpeditions.co.tz / OperatorPass123!');
  console.log('🔑 bookings@serengetisunrise.co.tz / OperatorPass123!');
  console.log('🔑 traveler@gmail.com        / TravelerPass123!');
  console.log('──────────────────────────────────────────────');
  console.log(`   agencies=${AGENCIES.length} programmes=${PROGRAMS.length}`);
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
