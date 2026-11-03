import {
  PrismaClient,
  Role,
  ComfortLevel,
  TourType,
  SlotStatus,
  InquiryStatus,
  LeadStatus,
  ReviewStatus,
  ReservationStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DAY_MS = 86_400_000;
const inDays = (n: number) => new Date(Date.now() + n * DAY_MS);

// ─────────────────────────────────────────────────────────────────────────────
// 1. Travelers to seed/ensure
// ─────────────────────────────────────────────────────────────────────────────
const DEMO_TRAVELERS = [
  { email: 'traveler@gmail.com', first: 'Sarah', last: 'Jenkins', country: 'United Kingdom', phone: '+44 7700 900077' },
  { email: 'liam.oconnor@example.com', first: 'Liam', last: 'O’Connor', country: 'Ireland', phone: '+353 87 220 1188' },
  { email: 'yuki.tanaka@example.com', first: 'Yuki', last: 'Tanaka', country: 'Japan', phone: '+81 90 3344 2211' },
  { email: 'ana.silva@example.com', first: 'Ana', last: 'Silva', country: 'Brazil', phone: '+55 11 98877 4455' },
  { email: 'hans.mueller@example.com', first: 'Hans', last: 'Müller', country: 'Germany', phone: '+49 151 2233 4455' },
  { email: 'emma.clark@example.com', first: 'Emma', last: 'Clark', country: 'Australia', phone: '+61 412 345 678' },
  { email: 'daniel.morgan@example.com', first: 'Daniel', last: 'Morgan', country: 'United States', phone: '+1 206 555 0192' },
  { email: 'maya.tran@example.com', first: 'Maya', last: 'Tran', country: 'Canada', phone: '+1 604 555 0184' },
  { email: 'lukas.weber@example.com', first: 'Lukas', last: 'Weber', country: 'Switzerland', phone: '+41 79 123 4567' },
  { email: 'elena.rossi@example.com', first: 'Elena', last: 'Rossi', country: 'Italy', phone: '+39 340 123 4567' },
  { email: 'francois.dupont@example.com', first: 'François', last: 'Dupont', country: 'France', phone: '+33 6 12 34 56 78' },
  { email: 'chloe.bennett@example.com', first: 'Chloe', last: 'Bennett', country: 'New Zealand', phone: '+64 21 234 5678' },
  { email: 'priya.sharma@example.com', first: 'Priya', last: 'Sharma', country: 'India', phone: '+91 98200 12345' },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. New Authentic Tours covering all 8 unserved parks + multi-park itineraries
// ─────────────────────────────────────────────────────────────────────────────
interface NewTourDef {
  slug: string;
  operatorSlug: string;
  title: string;
  days: number;
  minPrice: number;
  maxPrice: number;
  comfort: ComfortLevel;
  type: TourType;
  country: string;
  start: string;
  end: string;
  destSlugs: string[];
  inclusions: string[];
  exclusions: string[];
  plan: {
    day: number;
    title: string;
    description: string;
    accommodationName: string;
    accommodationType: ComfortLevel;
    meals: string;
  }[];
}

const NEW_TOURS: NewTourDef[] = [
  // 1. Moremi Game Reserve (Botswana)
  {
    slug: '7-day-moremi-okavango-predator-trail',
    operatorSlug: 'pula-adventures',
    title: '7-Day Moremi & Okavango Delta Predator Trail',
    days: 7,
    minPrice: 2850,
    maxPrice: 3650,
    comfort: ComfortLevel.LUXURY,
    type: TourType.PRIVATE,
    country: 'Botswana',
    start: 'Maun International Airport',
    end: 'Maun International Airport',
    destSlugs: ['moremi-game-reserve', 'okavango-delta'],
    inclusions: [
      'Private 4x4 open safari vehicle with camera mounts and tracking seats',
      'Scenic bush flights between Maun and delta airstrips',
      'All Moremi Game Reserve entry fees and wildlife conservation levies',
      'Luxury tented camp accommodation with en-suite open-air showers',
      'Traditional mokoro dugout canoe excursions with certified local polers',
      'All meals, afternoon high teas, and select South African wines and spirits',
      'Professional Botswana FGASA-certified lead guide and tracker',
    ],
    exclusions: [
      'International flights and Botswana entry visas',
      'Camp staff and guide gratuities ($25–$35 per person/day recommended)',
      'Travel and emergency medical evacuation insurance',
      'Optional scenic helicopter excursion over the Delta channels',
    ],
    plan: [
      {
        day: 1,
        title: 'Fly Maun to Moremi Khwai Airstrip & Sunset Hippo Cruise',
        description: 'Board a scenic 25-minute flight into the Khwai sector of Moremi. Settle into camp before an afternoon boat cruise watching hippos and African fish eagles.',
        accommodationName: 'Camp Moremi',
        accommodationType: ComfortLevel.LUXURY,
        meals: 'Lunch, Dinner',
      },
      {
        day: 2,
        title: 'Xakanaxa Lagoon & Leopard Tracking in Mopane Woodlands',
        description: 'Morning drive along the legendary Xakanaxa peninsula where dense mopane woodlands host high concentrations of leopards, red lechwe, and breeding elephant herds.',
        accommodationName: 'Camp Moremi',
        accommodationType: ComfortLevel.LUXURY,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 3,
        title: 'Khwai River Crossing & Night Game Drive',
        description: 'Traverse into the community conservancy bordering Moremi for exclusive off-road tracking and a spotlight night drive looking for bushbabies, leopards, and servals.',
        accommodationName: 'Khwai Leadwood Tented Camp',
        accommodationType: ComfortLevel.LUXURY,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 4,
        title: 'Deep Okavango Water Channels & Silent Mokoro Trail',
        description: 'Glide through winding papyrus channels on a traditional mokoro poled by local river guides. Marvel at tiny reed frogs, water lilies, and kingfishers.',
        accommodationName: 'Sanctuary Chief’s Camp',
        accommodationType: ComfortLevel.LUXURY,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 5,
        title: 'Walking Safari on Chief’s Island & Big Tusker Encounters',
        description: 'Explore the heart of the Delta on foot with an armed trails ranger. Learn to track lion prints and observe zebra and giraffe herds at eye level.',
        accommodationName: 'Sanctuary Chief’s Camp',
        accommodationType: ComfortLevel.LUXURY,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 6,
        title: 'Delta-Wide Wild Dog Pack Tracking & Sunset Sundowners',
        description: 'Search for resident endangered African wild dogs during their active dawn hunting hours, followed by a panoramic sundowner over the floodplains.',
        accommodationName: 'Sanctuary Chief’s Camp',
        accommodationType: ComfortLevel.LUXURY,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 7,
        title: 'Sunrise Bush Breakfast & Flight Return to Maun',
        description: 'Enjoy a farewell bush breakfast overlooking the waterhole before your bush flight transfer back to Maun Airport for your onward journey.',
        accommodationName: 'N/A (Departure)',
        accommodationType: ComfortLevel.LUXURY,
        meals: 'Breakfast',
      },
    ],
  },

  // 2. Makgadikgadi Pans National Park (Botswana)
  {
    slug: '6-day-makgadikgadi-pans-kalahari-expedition',
    operatorSlug: 'pula-adventures',
    title: '6-Day Makgadikgadi Salt Pans & Kalahari Meerkat Expedition',
    days: 6,
    minPrice: 2420,
    maxPrice: 3180,
    comfort: ComfortLevel.MID_RANGE,
    type: TourType.SHARED_GROUP,
    country: 'Botswana',
    start: 'Maun Airport',
    end: 'Maun Airport',
    destSlugs: ['makgadikgadi-pans-national-park', 'central-kalahari-game-reserve'],
    inclusions: [
      'Custom 4x4 safari cruiser with 360-degree photography roof hatches',
      'All Makgadikgadi and Central Kalahari conservation levies and park permits',
      'Habituated wild meerkat family encounter with dedicated field naturalists',
      'Guided walking trail with indigenous Zu/’hoasi San Bushmen trackers',
      'Comfortable permanent safari tents with private bathrooms and hot showers',
      'All meals, bottled mineral water, and campfire tea and coffee',
      'Astronomy session with telescopes under dark southern skies',
    ],
    exclusions: [
      'International flights to Maun',
      'Quad biking excursion across the salt crust ($120 add-on)',
      'Staff and tracker gratuities',
      'Personal travel insurance',
    ],
    plan: [
      {
        day: 1,
        title: 'Maun overland journey to Boteti River & Makgadikgadi Edge',
        description: 'Drive southeast from Maun to the Boteti River, where vast zebra and wildebeest herds congregate to drink against the backdrop of arid white pans.',
        accommodationName: 'Meno a Kwena Tented Camp',
        accommodationType: ComfortLevel.MID_RANGE,
        meals: 'Lunch, Dinner',
      },
      {
        day: 2,
        title: 'Sunrise Meerkat Colony Awakening & Ancient Salt Pan Expanses',
        description: 'Stand among habituated meerkats as they emerge from their burrows at sunrise, clambering onto rocks and even your hat to scout for predators.',
        accommodationName: 'Camp Kalahari',
        accommodationType: ComfortLevel.MID_RANGE,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 3,
        title: 'San Bushman Cultural Survival Walk & Baobab Sunset',
        description: 'Walk into the bush with Zu/’hoasi elders. Discover desert medicinal plants, scorpion tracking, and traditional hunting fire-making techniques.',
        accommodationName: 'Camp Kalahari',
        accommodationType: ComfortLevel.MID_RANGE,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 4,
        title: 'Journey into Central Kalahari - Deception Valley',
        description: 'Traverse into the Central Kalahari Game Reserve. Experience the sheer vastness of Deception Valley, celebrated in Mark and Delia Owens’ research.',
        accommodationName: 'Deception Valley Lodge',
        accommodationType: ComfortLevel.MID_RANGE,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 5,
        title: 'Tracking Black-Maned Kalahari Lions & Cheetah Grassland Drives',
        description: 'Track the legendary black-maned lions of the Kalahari and spot sprint-hunting cheetahs scanning the open golden fossil valleys.',
        accommodationName: 'Deception Valley Lodge',
        accommodationType: ComfortLevel.MID_RANGE,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 6,
        title: 'Final Kalahari Dawn Game Drive and Scenic Return to Maun',
        description: 'One last sunrise game drive to spot bat-eared foxes and gemsbok before returning overland to Maun by mid-afternoon.',
        accommodationName: 'N/A (Departure)',
        accommodationType: ComfortLevel.MID_RANGE,
        meals: 'Breakfast, Lunch',
      },
    ],
  },

  // 3. Nxai Pan National Park (Botswana)
  {
    slug: '5-day-nxai-pan-baines-baobabs-chobe',
    operatorSlug: 'pula-adventures',
    title: '5-Day Nxai Pan, Baines’ Baobabs & Chobe River Safari',
    days: 5,
    minPrice: 1890,
    maxPrice: 2450,
    comfort: ComfortLevel.MID_RANGE,
    type: TourType.PRIVATE,
    country: 'Botswana',
    start: 'Kasane Airport',
    end: 'Maun Airport',
    destSlugs: ['nxai-pan-national-park', 'chobe-national-park'],
    inclusions: [
      'Enclosed 4x4 safari vehicle with roof-hatch and on-board fridge',
      'Park entry fees for Nxai Pan and Chobe National Parks',
      'Excursion to the iconic Baines’ Baobabs immortalized in 1862 paintings',
      'Afternoon private riverboat safari on the Chobe River front',
      'Full-board safari lodge and tented camp accommodation',
      'Professional licensed Botswana safari guide throughout',
      'All inter-park road transfers from Kasane to Maun',
    ],
    exclusions: [
      'International flights',
      'Driver-guide and lodge staff gratuities',
      'Premium alcoholic beverages',
      'Botswana visa fees',
    ],
    plan: [
      {
        day: 1,
        title: 'Arrive Kasane & Afternoon Chobe River Boat Cruise',
        description: 'Meet your guide at Kasane Airport. Embark on a sunset riverboat cruise watching massive elephant herds swimming with trunks like snorkels.',
        accommodationName: 'Chobe Safari Lodge',
        accommodationType: ComfortLevel.MID_RANGE,
        meals: 'Dinner',
      },
      {
        day: 2,
        title: 'Morning Chobe Riverfront Drive & Transfer South to Nxai Pan',
        description: 'Early morning game drive along the Chobe River tracking lions and buffalos, followed by a scenic drive south into Nxai Pan National Park.',
        accommodationName: 'Nxai Pan Camp',
        accommodationType: ComfortLevel.MID_RANGE,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 3,
        title: 'Exploring the Seven Baines’ Baobabs & Fossil Salt Basin',
        description: 'Drive across the salt pan to the cluster of thousand-year-old baobabs known as Baines’ Baobabs, standing unchanged since the explorer painted them in 1862.',
        accommodationName: 'Nxai Pan Camp',
        accommodationType: ComfortLevel.MID_RANGE,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 4,
        title: 'Waterhole Tracking: Cheetahs, Springbok Herds & Giraffes',
        description: 'Spend the day staking out the park’s main waterholes where desert cheetahs hunt springbok and tower upon tower of giraffes come down to drink.',
        accommodationName: 'Nxai Pan Camp',
        accommodationType: ComfortLevel.MID_RANGE,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 5,
        title: 'Dawn Game Drive across the Pan and Highway Transfer to Maun',
        description: 'A sunrise game drive across the salt flats followed by a comfortable transfer along the main highway to Maun Airport for your flight.',
        accommodationName: 'N/A (Departure)',
        accommodationType: ComfortLevel.MID_RANGE,
        meals: 'Breakfast, Lunch',
      },
    ],
  },

  // 4. Buffalo Springs National Reserve (Kenya)
  {
    slug: '6-day-samburu-buffalo-springs-special-five',
    operatorSlug: 'sunstrip-africa-safaris',
    title: '6-Day Samburu & Buffalo Springs Northern Special 5 Safari',
    days: 6,
    minPrice: 1750,
    maxPrice: 2300,
    comfort: ComfortLevel.MID_RANGE,
    type: TourType.SHARED_GROUP,
    country: 'Kenya',
    start: 'Nairobi',
    end: 'Nairobi',
    destSlugs: ['buffalo-springs-national-reserve', 'samburu-national-reserve'],
    inclusions: [
      'Custom 4x4 Toyota Land Cruiser with pop-up photography roof and cooler',
      'All Buffalo Springs and Samburu National Reserve entry permits',
      'Full-board accommodation at premier riverfront safari lodges',
      'Game drives focusing on the Samburu Northern Special 5 rare endemic species',
      'Visit to the crystal-clear champagne natural spring oasis in Buffalo Springs',
      'Services of a certified KPSGA Silver-level Kenyan driver-guide',
      'Complimentary bottled drinking water during all game drives',
    ],
    exclusions: [
      'International flights and Kenyan eVisa',
      'Samburu traditional cultural village entry fee ($30 per adult)',
      'Driver-guide gratuities ($15–$20 per person per day)',
      'Laundry services and personal travel insurance',
    ],
    plan: [
      {
        day: 1,
        title: 'Nairobi northward past Mount Kenya to Buffalo Springs Reserve',
        description: 'Depart Nairobi early morning, crossing the equator with majestic views of Mount Kenya before descending into the rugged northern arid scrublands of Buffalo Springs.',
        accommodationName: 'Samburu Simba Lodge',
        accommodationType: ComfortLevel.MID_RANGE,
        meals: 'Lunch, Dinner',
      },
      {
        day: 2,
        title: 'Buffalo Springs Natural Champagne Oasis & Beisa Oryx Tracking',
        description: 'Explore the shimmering natural springs and alkaline pools of Buffalo Springs. Spot herds of Beisa oryx, Somali ostriches, and reticulated giraffes.',
        accommodationName: 'Samburu Simba Lodge',
        accommodationType: ComfortLevel.MID_RANGE,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 3,
        title: 'Crossing the Ewaso Nyiro River into Samburu National Reserve',
        description: 'Cross the lifeline river into Samburu Reserve. Track elephants wading in the shallows under acacia tortilis shade trees and look for leopards in the riverine fig trees.',
        accommodationName: 'Elephant Bedroom Camp',
        accommodationType: ComfortLevel.MID_RANGE,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 4,
        title: 'Full Day Tracking Grevy’s Zebra, Gerenuk & Reticulated Giraffe',
        description: 'Dedicated search for the remaining members of the Special 5: the bizarre long-necked gerenuk standing on its hind legs and the rare endangered Grevy’s zebra.',
        accommodationName: 'Elephant Bedroom Camp',
        accommodationType: ComfortLevel.MID_RANGE,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 5,
        title: 'Leopard Kopjes, Nile Crocodile Sandbanks & Sunset Overlook',
        description: 'Afternoon game drive around rocky granite kopjes where lions and leopards rest, followed by a sundowner overlooking the brown waters of Ewaso Nyiro.',
        accommodationName: 'Samburu Simba Lodge',
        accommodationType: ComfortLevel.MID_RANGE,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 6,
        title: 'Sunrise Bush Walk along Riverbed & Return Scenic Drive to Nairobi',
        description: 'Enjoy a morning guided walk along the reserve perimeter before a scenic drive back south across the central highlands to Nairobi.',
        accommodationName: 'N/A (Departure)',
        accommodationType: ComfortLevel.MID_RANGE,
        meals: 'Breakfast, Lunch',
      },
    ],
  },

  // 5. Addo Elephant National Park (South Africa)
  {
    slug: '6-day-garden-route-addo-elephant-safari',
    operatorSlug: 'shadows-of-africa',
    title: '6-Day Garden Route & Addo Elephant Malaria-Free Safari',
    days: 6,
    minPrice: 1680,
    maxPrice: 2250,
    comfort: ComfortLevel.LUXURY,
    type: TourType.PRIVATE,
    country: 'South Africa',
    start: 'Port Elizabeth (Gqeberha)',
    end: 'Cape Town',
    destSlugs: ['addo-elephant-national-park'],
    inclusions: [
      'Luxury air-conditioned Mercedes sprinter / 4x4 touring vehicle',
      'All entry fees to Addo Elephant National Park and Tsitsikamma National Park',
      'Open-vehicle 4x4 safari drives inside Addo Elephant Reserve with ranger',
      'Boutique guesthouse and 5-star colonial safari lodge stays',
      'Knysna lagoon catamaran cruise to the Heads',
      'Wine tasting and artisan lunch in the Hemel-en-Aarde Valley',
      'Professional THETA-accredited South African guide throughout',
    ],
    exclusions: [
      'International flights',
      'Bloukrans Bridge bungee jump ($85 optional add-on)',
      'Staff gratuities',
      'Alcoholic beverages outside designated wine tastings',
    ],
    plan: [
      {
        day: 1,
        title: 'Arrive Gqeberha (Port Elizabeth) and Transfer to Addo Sanctuary',
        description: 'Arrive at Port Elizabeth Airport. Meet your guide for a scenic 50-minute drive into the dense subtropical Spekboom valley of Addo Elephant National Park.',
        accommodationName: 'Gorah Elephant Camp',
        accommodationType: ComfortLevel.LUXURY,
        meals: 'Lunch, Dinner',
      },
      {
        day: 2,
        title: 'Big 7 Game Drives in Addo: Over 600 Elephants, Buffalo & Lions',
        description: 'Full-day open-vehicle game drive. Experience one of the densest elephant populations on earth along with flightless dung beetles, black rhinos, and lions.',
        accommodationName: 'Gorah Elephant Camp',
        accommodationType: ComfortLevel.LUXURY,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 3,
        title: 'Tsitsikamma Indigenous Forest & Storms River Suspension Bridge',
        description: 'Travel along the Garden Route coastline into Tsitsikamma National Park. Walk along the dramatic suspension bridge suspended over the stormy ocean river gorge.',
        accommodationName: 'The Rex Hotel Knysna',
        accommodationType: ComfortLevel.LUXURY,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 4,
        title: 'Knysna Lagoon Sail, Featherbed Nature Reserve & Coastal Trails',
        description: 'Sail across the lagoon to the Featherbed Nature Reserve. Take an eco-tractor ride up the cliffs followed by a scenic walk through sea caves and milkwood forests.',
        accommodationName: 'The Rex Hotel Knysna',
        accommodationType: ComfortLevel.LUXURY,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 5,
        title: 'Crossing the Outeniqua Pass to Oudtshoorn Cango Caves & Karoo',
        description: 'Head inland over majestic mountain passes into the Little Karoo. Explore the dripstone caverns of the Cango Caves and visit a heritage ostrich farm.',
        accommodationName: 'Rosenhof Country House',
        accommodationType: ComfortLevel.LUXURY,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 6,
        title: 'Route 62 Cape Winelands Drive and Arrival in Cape Town',
        description: 'Travel through historic winelands villages along scenic Route 62. Enjoy an estate wine tasting before arriving in Cape Town by early evening.',
        accommodationName: 'N/A (Departure)',
        accommodationType: ComfortLevel.LUXURY,
        meals: 'Breakfast, Lunch',
      },
    ],
  },

  // 6. MalaMala Game Reserve (South Africa)
  {
    slug: '4-day-malamala-legendary-big-five-safari',
    operatorSlug: 'shadows-of-africa',
    title: '4-Day MalaMala Legendary Big Five Luxury Safari',
    days: 4,
    minPrice: 3450,
    maxPrice: 4600,
    comfort: ComfortLevel.SUPER_LUXURY,
    type: TourType.FLY_IN,
    country: 'South Africa',
    start: 'Skukuza / MalaMala Airstrip',
    end: 'Skukuza / MalaMala Airstrip',
    destSlugs: ['malamala-game-reserve', 'sabi-sand-nature-reserve'],
    inclusions: [
      'Light aircraft bush flights from Johannesburg OR Tambo directly to MalaMala airstrip',
      'Exclusive luxury suite at MalaMala Main Camp with Sand River panorama',
      'Two daily off-road game drives in customized open 4x4 Land Rovers',
      'Maximum 6 guests per vehicle for unparalleled photographic space',
      'All gourmet meals, bush picnics, and fine South African cellar wines',
      'All conservation levies and private reserve access fees',
      'Dedicated FGASA guide and Shangaan tracker team',
    ],
    exclusions: [
      'International airfare to Johannesburg',
      'Curio shop purchases and spa treatments',
      'Discretionary tips for ranger and tracker ($30/day recommended)',
      'Comprehensive personal travel/medical insurance',
    ],
    plan: [
      {
        day: 1,
        title: 'Direct Bush Flight into MalaMala & Riverbed Leopard Safari',
        description: 'Land directly on MalaMala’s private strip. Check into your river suite before an afternoon game drive tracing the Sand River for world-famous leopard sightings.',
        accommodationName: 'MalaMala Main Camp',
        accommodationType: ComfortLevel.SUPER_LUXURY,
        meals: 'Lunch, Dinner',
      },
      {
        day: 2,
        title: 'Sand River Predator Encounters: Lions, Wild Dogs & Rhinos',
        description: 'Off-road tracking without public vehicle restrictions. Follow resident lion prides on the hunt and watch white rhinos grazing in open grasslands.',
        accommodationName: 'MalaMala Main Camp',
        accommodationType: ComfortLevel.SUPER_LUXURY,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 3,
        title: 'Off-Road Tracking into Sabi Sand Borderlands & Boma Feast',
        description: 'Morning and afternoon game drives through MalaMala’s 33,000 unshared acres. In the evening, gather around a roaring fire for a traditional African boma feast.',
        accommodationName: 'MalaMala Main Camp',
        accommodationType: ComfortLevel.SUPER_LUXURY,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 4,
        title: 'Dawn Walking Safari, Bush Breakfast & Flight Departure',
        description: 'A gentle dawn walking safari exploring animal tracks, followed by an indulgent bush breakfast on the river deck before your return flight to Johannesburg.',
        accommodationName: 'N/A (Departure)',
        accommodationType: ComfortLevel.SUPER_LUXURY,
        meals: 'Breakfast',
      },
    ],
  },

  // 7. Katavi National Park (Tanzania)
  {
    slug: '6-day-katavi-remote-wilderness-safari',
    operatorSlug: 'kili-tanzanian-expeditions',
    title: '6-Day Katavi & Ruaha Remote Wilderness Safari',
    days: 6,
    minPrice: 3890,
    maxPrice: 4950,
    comfort: ComfortLevel.LUXURY,
    type: TourType.FLY_IN,
    country: 'Tanzania',
    start: 'Arusha / Kilimanjaro',
    end: 'Dar es Salaam',
    destSlugs: ['katavi-national-park', 'ruaha-national-park'],
    inclusions: [
      'Scheduled shared charter bush flights (Arusha – Katavi – Ruaha – Dar es Salaam)',
      'All Katavi and Ruaha National Park conservation fees and concession permits',
      'Open-sided 4x4 safari vehicles with high-clearance suspension',
      'Authentic luxury tented camp accommodation in prime wildlife sectors',
      'Full-board meals including bush breakfasts and sundowner drinks',
      'Expert Tanzanian wilderness guides with deep botanical and fauna knowledge',
      'Unlimited game drives across Katisunga plain and Great Ruaha river',
    ],
    exclusions: [
      'International flights and Tanzania tourist visa ($50–$100)',
      'Travel and medical emergency evacuation insurance',
      'Gratuities for guide and camp staff',
      'Premium vintage wines and champagne',
    ],
    plan: [
      {
        day: 1,
        title: 'Fly west across the Rift Valley to Ikuu Airstrip in Katavi',
        description: 'Board a light aircraft from Arusha flying over the Great Rift Valley into western Tanzania. Arrive at Katavi’s wild Ikuu airstrip and transfer to camp.',
        accommodationName: 'Chada Katavi Camp',
        accommodationType: ComfortLevel.LUXURY,
        meals: 'Lunch, Dinner',
      },
      {
        day: 2,
        title: 'Katuma River Hippo Pods & Monster Crocodile Gathering',
        description: 'Witness Katavi’s most astonishing sight: hundreds of hippos packed tightly into remaining river pools and huge crocodiles slumbering in riverbank mud caves.',
        accommodationName: 'Chada Katavi Camp',
        accommodationType: ComfortLevel.LUXURY,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 3,
        title: 'Katisunga Plains 1,000-strong Cape Buffalo Herds & Lion Prides',
        description: 'Drive across the open Katisunga floodplains where mammoth herds of buffalo kick up dust clouds pursued by dominant lion coalitions.',
        accommodationName: 'Chada Katavi Camp',
        accommodationType: ComfortLevel.LUXURY,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 4,
        title: 'Morning Bush Flight to Ruaha National Park & River Valley Safari',
        description: 'Hop aboard the bush shuttle to Ruaha National Park. Drive along the rocky Great Ruaha River gorge observing elephants digging for water.',
        accommodationName: 'Ruaha River Lodge',
        accommodationType: ComfortLevel.LUXURY,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 5,
        title: 'Greater Kudu, Wild Dog Packs & Ancient Baobab Forests',
        description: 'Ruaha is famous for its massive baobab forests and both greater and lesser kudu antelopes. Spend the day tracking wild dogs through the miombo woodland.',
        accommodationName: 'Ruaha River Lodge',
        accommodationType: ComfortLevel.LUXURY,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 6,
        title: 'Sunrise Game Drive along Great Ruaha River & Flight to Dar es Salaam',
        description: 'A tranquil dawn drive catching predators returning from the night’s hunt, before catching the afternoon flight to Dar es Salaam.',
        accommodationName: 'N/A (Departure)',
        accommodationType: ComfortLevel.LUXURY,
        meals: 'Breakfast, Lunch',
      },
    ],
  },

  // 8. Gombe National Park (Tanzania)
  {
    slug: '5-day-gombe-stream-chimpanzee-trekking',
    operatorSlug: 'josh-dreamland-safari',
    title: '5-Day Gombe Stream Chimpanzee Trekking Odyssey',
    days: 5,
    minPrice: 2150,
    maxPrice: 2780,
    comfort: ComfortLevel.MID_RANGE,
    type: TourType.PRIVATE,
    country: 'Tanzania',
    start: 'Kigoma Airport',
    end: 'Kigoma Airport',
    destSlugs: ['gombe-national-park'],
    inclusions: [
      'Roundtrip traditional wooden motorboat transfers between Kigoma and Gombe',
      'All TANAPA Gombe National Park entry and daily chimpanzee trekking permits',
      'Dedicated TANAPA primatologist ranger guide for forest tracking',
      'Lakeside tented forest lodge accommodation right on Lake Tanganyika',
      'Full-board freshly prepared local fish, vegetables, and continental cuisine',
      'Guided hike to Kakombe Waterfall and Jane Goodall’s historic research peak',
      'Snorkeling gear for clear-water exploration of Lake Tanganyika endemic cichlids',
    ],
    exclusions: [
      'Domestic flights between Dar es Salaam/Arusha and Kigoma Airport',
      'Tips for boat captains, forest rangers, and lodge crew',
      'Personal travel insurance and yellow fever certificate',
      'Souvenirs from Kigoma craft cooperatives',
    ],
    plan: [
      {
        day: 1,
        title: 'Kigoma pickup & Boat transfer along Lake Tanganyika to Gombe',
        description: 'Meet at Kigoma Airport, transfer to the harbor and cruise 2 hours north along the forested shores of Lake Tanganyika to Gombe National Park.',
        accommodationName: 'Gombe Forest Lodge',
        accommodationType: ComfortLevel.MID_RANGE,
        meals: 'Lunch, Dinner',
      },
      {
        day: 2,
        title: 'Deep Rainforest Chimpanzee Tracking in Mitumba Valley',
        description: 'Trek into the lush riverine forest with an expert tracker. Spend a mesmerizing hour observing wild chimpanzees grooming, playing, and calling across the canopy.',
        accommodationName: 'Gombe Forest Lodge',
        accommodationType: ComfortLevel.MID_RANGE,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 3,
        title: 'Forest Ascent to Jane’s Peak & Kakombe Waterfall Trail',
        description: 'Hike up to the high rocky ridge where Dr. Jane Goodall sat for months habituating the chimpanzees. Cool off at the roaring Kakombe cascade.',
        accommodationName: 'Gombe Forest Lodge',
        accommodationType: ComfortLevel.MID_RANGE,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 4,
        title: 'Red Colobus Monkey Troops & Lake Tanganyika Sunset Snorkel',
        description: 'Observe troops of red colobus monkeys and olive baboons along the forest boundary, followed by an afternoon swim and snorkel in the crystal-clear lake.',
        accommodationName: 'Gombe Forest Lodge',
        accommodationType: ComfortLevel.MID_RANGE,
        meals: 'Breakfast, Lunch, Dinner',
      },
      {
        day: 5,
        title: 'Dawn Lake Cruise back to Kigoma and Airport Transfer',
        description: 'Enjoy breakfast as the sun rises over the Congo mountains across the lake, then board the boat transfer back to Kigoma for your flight.',
        accommodationName: 'N/A (Departure)',
        accommodationType: ComfortLevel.MID_RANGE,
        meals: 'Breakfast',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. New Safari Experts
// ─────────────────────────────────────────────────────────────────────────────
const NEW_EXPERTS = [
  {
    slug: 'evelyn-mbeki',
    name: 'Dr. Evelyn Mbeki',
    country: 'Tanzania',
    reviewCount: 412,
    biography:
      'Senior wildlife biologist and conservationist based in Arusha. Evelyn has spent over 15 years researching apex predator movements across the Serengeti-Mara ecosystem and advising community conservancies on human-wildlife coexistence.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    sortOrder: 3,
  },
  {
    slug: 'tebogo-kgosiemang',
    name: 'Tebogo "KG" Kgosiemang',
    country: 'Botswana',
    reviewCount: 367,
    biography:
      'Born on the fringes of the Okavango Delta in Maun, KG is a master naturalist, professional mokoro poler, and wilderness trails guide with over 18 years of guiding private mobile expeditions across Moremi, Savuti, and the Makgadikgadi Salt Pans.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    sortOrder: 4,
  },
  {
    slug: 'claire-fontaine',
    name: 'Claire Fontaine',
    country: 'Rwanda',
    reviewCount: 284,
    biography:
      'Primatology researcher and luxury eco-tourism consultant based in Kigali. Claire has led habituation monitoring in Volcanoes National Park and works closely with the Dian Fossey Gorilla Fund to promote low-impact primate trekking across East Africa.',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    sortOrder: 5,
  },
  {
    slug: 'johan-van-zyl',
    name: 'Johan van Zyl',
    country: 'South Africa',
    reviewCount: 520,
    biography:
      'Former Head Ranger at Sabi Sand and award-winning wildlife photographer. Johan specializes in low-impact private safari planning, photographic hides, and luxury bush lodge architecture across the Greater Kruger, Addo, and Madikwe reserves.',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    sortOrder: 6,
  },
  {
    slug: 'patrick-mwangi',
    name: 'Patrick Mwangi',
    country: 'Kenya',
    reviewCount: 335,
    biography:
      'Kenya Professional Safari Guides Association (KPSGA) Gold-level guide with two decades of experience navigating the Mara migration river crossings, Amboseli big-tusker territories, and Samburu’s rugged Northern Frontier conservancies.',
    imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80',
    sortOrder: 7,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. New Blog Posts
// ─────────────────────────────────────────────────────────────────────────────
interface NewBlogPostDef {
  slug: string;
  title: string;
  operatorSlug: string;
  tag: string;
  excerpt: string;
  coverImageUrl: string;
  viewCount: number;
  content: string;
}

const NEW_BLOG_POSTS: NewBlogPostDef[] = [
  {
    slug: 'great-migration-guide-2026',
    title: 'The Great Migration Guide 2026: Month-by-Month Herds & River Crossings',
    operatorSlug: 'serengeti-sunrise-safaris',
    tag: 'Migration & Wildlife',
    excerpt:
      'Everything you need to know about tracking 1.5 million wildebeest through the Serengeti and Masai Mara, including calving season, rutting cycles, and the dramatic Mara River crossings.',
    coverImageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
    viewCount: 14820,
    content: `
# The Great Migration Guide 2026: Where to Be and When

The Great Wildebeest Migration is the largest terrestrial mammal movement on the planet. Over 1.5 million wildebeest, 300,000 zebras, and 200,000 gazelles circle clockwise through Tanzania's Serengeti and Kenya's Masai Mara in search of fresh rainwater and nutrient-rich grasses.

---

## Month-by-Month Movement Overview

### January to March: Southern Serengeti Calving Season
In the short-grass plains of Ndutu and southern Serengeti, an estimated 8,000 calves are born every single day. This is prime predator action season, as lions, cheetahs, and hyenas stalk the vulnerable newborns.

### April to May: The Long Rains & Western Corridor
As the southern plains dry up, the mega-herds march northwest toward the Western Corridor and the Grumeti River. Expect torrential afternoon downpours and towering Nile crocodiles lying in wait.

### July to October: The Iconic Mara River Crossings
From July to October, the herds enter northern Serengeti and Kenya's Masai Mara. This is when dramatic river crossings happen: panic, churning water, dust storms, and apex crocodile ambushes.

### November to December: The Return South
With the arrival of the short rains in late October, the herds trek back south through eastern Serengeti, preparing for another calving cycle.

---

## Insider Tips for Photographers
- **Bring Two Camera Bodies**: Lens changes in dusty vehicles will coat your sensor in grit.
- **Position for Dawn Crossings**: Mid-day crossings can take hours of waiting under the sun. Arrive early at designated crossing points (Points 1 through 4 along the Mara River).
- **Book Mobile Tented Camps**: Static lodges are often hours away from where the herds actually cross. Semi-permanent mobile camps move 2 to 3 times a year to stay directly in the path of the animals.
    `,
  },

  {
    slug: 'trekking-mountain-gorillas-bwindi-guide',
    title: 'Trekking with Mountain Gorillas in Bwindi: Permits, Gear & Fitness Guide',
    operatorSlug: 'activentures-africa-safaris',
    tag: 'Primate Safaris',
    excerpt:
      'A comprehensive practical guide to hiking through Uganda’s Bwindi Impenetrable Forest to spend one unforgettable hour with endangered mountain gorillas.',
    coverImageUrl: 'https://images.unsplash.com/photo-1551776235-dde6d482980b?auto=format&fit=crop&w=1200&q=80',
    viewCount: 11430,
    content: `
# Trekking with Mountain Gorillas in Bwindi: What You Must Know

Bwindi Impenetrable National Park in southwestern Uganda shelters roughly half of the world's remaining mountain gorillas. Trekking into the steep, mist-shrouded montane rainforest is an intensely intimate wildlife encounter.

---

## Securing Your Gorilla Permit
Uganda gorilla permits are strictly limited by the Uganda Wildlife Authority (UWA) to 8 visitors per habituated gorilla family per day.
- **Cost**: $800 USD per person for foreign non-residents (compared to $1,500 in neighboring Rwanda).
- **Habituation Experience**: An optional $1,500 permit lets you spend 4 hours with a semi-habituated family alongside UWA researchers.
- **Advance Booking**: Permits sell out 6 to 12 months ahead for peak dry seasons (June–August and December–February).

---

## Essential Gear Checklist
1. **Sturdy Hiking Boots**: Waterproof boots with deep tread and ankle support are non-negotiable.
2. **Garden Gloves**: Thick gardening gloves protect your hands when grabbing stinging nettles and thorny vines on steep inclines.
3. **Long Moisture-Wicking Pants & Gaiters**: Tuck your trousers into thick socks or gaiters to deter biting safari ants (siafu).
4. **Breathable Rain Jacket**: Rain in Bwindi can occur at any minute, even during the dry season.
5. **Camera with Fast Prime Lens**: Flash photography is strictly forbidden. A fast lens (f/2.8 or wider) is essential under the dense forest canopy.

---

## Ethical Guidelines in the Presence of Gorillas
- Always maintain a minimum distance of 7 to 10 meters (23–33 feet).
- Never visit if you feel unwell; gorillas share 98% of human DNA and are susceptible to human respiratory viruses.
- Avoid direct, prolonged eye contact with dominant silverbacks. If a gorilla approaches you, remain calm, crouch down, and follow your guide's instructions.
    `,
  },

  {
    slug: 'best-photography-lenses-african-safaris',
    title: 'Best Photography Lenses & Camera Settings for African Safaris',
    operatorSlug: 'shadows-of-africa',
    tag: 'Photography Gear',
    excerpt:
      'From 100-400mm telephotos to fast wide-angles for starry African nights: the optimal camera kit for capturing crisp wildlife and dramatic landscapes.',
    coverImageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    viewCount: 9210,
    content: `
# Best Photography Lenses & Camera Settings for African Safaris

Photographing African wildlife presents extreme challenges: fast-moving predators in harsh midday glare, followed by low-light opportunities at dawn and dusk inside vibrating 4x4 safari vehicles.

---

## The Essential Lens Trio

### 1. The Workhorse Telephoto: 100-400mm or 150-600mm
This is the lens that will stay on your camera for 75% of your safari. It gives you the flexibility to zoom from a full lion pride lounging by the road to a tight portrait of a lilac-breasted roller perched on a dead branch.

### 2. The Low-Light Fast Prime: 70-200mm f/2.8
When twilight descends and big cats begin their nocturnal hunts, an f/2.8 aperture is invaluable. It lets in 4x more light than consumer f/5.6 or f/6.3 zooms, keeping your ISO clean and shutter speeds sharp.

### 3. The Wide Angle: 16-35mm or 24-70mm
Don't get tunnel vision with telephoto lenses! Africa’s sweeping landscapes—acacia silhouettes at sunset, thunderstorm skies over the Mara, and star-filled Kalahari night skies—demand a high-quality wide-angle lens.

---

## Key Camera Settings for Game Drives
- **Minimum Shutter Speed**: Set Auto ISO with a minimum shutter speed of **1/1000s** for moving wildlife, and **1/2000s** for birds in flight or running cheetahs.
- **Focus Mode**: Continuous AF (AF-C or AI Servo) with Animal Eye Tracking enabled.
- **Drive Mode**: High-speed continuous burst shooting.
- **Support**: Instead of a bulky tripod, bring a simple **beanbag**. Rest the beanbag on the safari vehicle's open roof rail for rock-solid stability without transferring motor vibration.
    `,
  },

  {
    slug: 'hidden-gems-okavango-delta',
    title: 'Hidden Gems of the Okavango Delta: Beyond the Standard Safari',
    operatorSlug: 'pula-adventures',
    tag: 'Botswana Secrets',
    excerpt:
      'Discover secret channels, private conservancies, and intimate mokoro routes away from crowded flight-in circuits in Botswana’s UNESCO wetland.',
    coverImageUrl: 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1200&q=80',
    viewCount: 8760,
    content: `
# Hidden Gems of the Okavango Delta: Exploring the Uncharted Channels

The Okavango Delta is one of the very few inland deltas that does not flow into an ocean, instead draining into the sands of the Kalahari Basin. While most travelers stick to standard fly-in circuits, true wilderness connoisseurs venture into private conservancy concessions.

---

## 1. Khwai Community Concession
Bordering the northern sector of Moremi Game Reserve, the Khwai concession is managed directly by the local river community. Because it is a private conservancy rather than a national park, guides can legally drive off-road to follow leopard trails and conduct nighttime spotlight drives.

## 2. Silent Mokoro Trails in the Panhandle
At the northern entry of the Okavango (the Panhandle), water is permanent and deep. Far from motorized boat traffic, local polers guide you through towering 4-meter papyrus reeds where rare Pel's fishing owls nest in overhanging mangosteen trees.

## 3. Walking Safaris on Chief's Island
Chief's Island is the largest landmass in the inner Delta. During peak flood season (May to August), thousands of plains game concentrate on this high island, attracting lion prides and Africa's largest wild dog population.
    `,
  },

  {
    slug: 'malaria-free-family-safaris-south-africa',
    title: 'Malaria-Free Family Safaris in South Africa: Eastern Cape & Madikwe',
    operatorSlug: 'shadows-of-africa',
    tag: 'Family Travel',
    excerpt:
      'Traveling with young children or pregnant family members? Here is our guide to South Africa’s world-class, completely malaria-free Big Five reserves.',
    coverImageUrl: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80',
    viewCount: 7340,
    content: `
# Malaria-Free Family Safaris in South Africa

For families traveling with toddlers, young children, or expectant mothers, the requirement to take prophylactic antimalarial medication can be a major source of anxiety. Fortunately, South Africa is home to premier safari destinations that are 100% free of malaria year-round.

---

## 1. Addo Elephant National Park & Eastern Cape Concessions
Located just an hour's drive from the coastal city of Port Elizabeth (Gqeberha), Addo Elephant National Park is the third-largest national park in South Africa.
- **Highlights**: Over 600 wild elephants, black rhinos, lions, and the flightless dung beetle.
- **Accessibility**: Smooth paved roads suitable for self-drive or guided luxury safaris.
- **Family Perks**: Fenced family chalets, junior ranger programs, and close proximity to the scenic Garden Route beaches.

---

## 2. Madikwe Game Reserve (North West Province)
Resting on the Botswana border, Madikwe is a 75,000-hectare private reserve with some of the best wild dog and cheetah tracking on the continent.
- **Children's Bush Programs**: Lodges such as Jukskei and Tuningi offer specialized bush boma dinners, baking sessions, and animal spoor casting classes for young kids.

---

## Practical Tips for Safari with Kids
- Book a **private safari vehicle**: Having your own vehicle means you can return to camp whenever toddlers get restless or hungry without feeling guilty about other guests.
- Schedule afternoon pool downtime: Midday safari temperatures can be warm; lodges with shallow pools keep children engaged between morning and late-afternoon drives.
    `,
  },

  {
    slug: 'walking-safaris-south-luangwa-zambia',
    title: 'Walking Safaris in South Luangwa: Exploring Africa on Foot',
    operatorSlug: 'serengeti-sunrise-safaris',
    tag: 'Walking Safaris',
    excerpt:
      'Step out of the vehicle and into the wild. South Luangwa in Zambia is the birthplace of the African walking safari—here is what to expect on foot.',
    coverImageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80',
    viewCount: 6890,
    content: `
# Walking Safaris in South Luangwa: Africa at Foot Level

Norman Carr pioneered the walking safari in Zambia's South Luangwa Valley in the 1950s with a simple philosophy: "To see Africa properly, you have to get out of the vehicle and walk."

---

## The Sensory Experience of a Foot Safari
Inside an enclosed vehicle, your senses are insulated. On foot:
- You hear the alarm snort of an impala before you spot the leopard crouched in the leadwood branches.
- You smell the pungent wild sage crushed underfoot and the earthy scent of a nearby elephant herd.
- You examine termite architecture, ancient medicinal bark, and the intricate tracks left in river sand.

---

## Safety and Guiding Standards
Zambia enforces the most rigorous walking safari guide exams on the continent. Every walk is led by:
1. **A Senior FGASA/ZAWA Guide**: Reads the wind direction, understands animal body language, and maintains a safe buffer zone.
2. **An Armed National Park Scout**: Walks at the head of the trail carrying a high-caliber rifle for emergency deterrence.
3. **Small Group Maximums**: Groups are capped at 6 guests in single file to minimize disturbance.
    `,
  },

  {
    slug: 'what-to-pack-for-an-african-safari-checklist',
    title: 'What to Pack for an African Safari: The Essential Lightweight Checklist',
    operatorSlug: 'sunstrip-africa-safaris',
    tag: 'Packing Guide',
    excerpt:
      'Avoid overpacking fees on bush planes with this definitive safari packing guide. Learn which colors to avoid and how to pack in soft-sided duffels under 15kg.',
    coverImageUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80',
    viewCount: 18920,
    content: `
# What to Pack for an African Safari: The 15kg Luggage Rule

Light aircraft charters throughout East and Southern Africa (Cessna Caravans) strictly enforce a luggage limit of **15kg (33 lbs) per passenger**, including camera gear and hand luggage. Furthermore, bags must be **soft-sided duffels** without hard frames or rigid wheels.

---

## Colors to Pack (and Colors to Avoid)
- **Neutral Earth Tones**: Khaki, olive green, beige, and tan blend into the savannah and don't attract attention.
- **NEVER Wear Dark Blue or Black**: In East Africa, tsetse flies are intensely attracted to dark blue and black, delivering painful bites.
- **Avoid Bright White**: White stands out across miles of bush and spooks nervous prey animals like zebras and antelopes.
- **Camouflage Clothing is Illegal**: In countries like Zimbabwe, Botswana, and South Africa, wearing military-style camouflage is strictly prohibited by law for civilians.

---

## The Essential Packing List
1. 3x Lightweight long-sleeve safari shirts (UPF 50 sun protection)
2. 2x Convertible zip-off cargo pants
3. 1x Warm fleece or lightweight down jacket (dawn game drives are freezing!)
4. 1x Wide-brim safari hat with chin cord
5. 1x Pair comfortable trail walking shoes
6. High-DEET insect repellent & broad-spectrum SPF 50 sunscreen
7. International power adapter with multiple USB ports (UK Type G for East Africa, Type M for South Africa)
8. High-capacity power bank (20,000mAh) to recharge cameras during long drives
    `,
  },

  {
    slug: 'chimpanzee-tracking-gombe-stream-tanzania',
    title: 'Chimpanzee Tracking in Gombe Stream: In Jane Goodall’s Footsteps',
    operatorSlug: 'josh-dreamland-safari',
    tag: 'Wildlife Conservation',
    excerpt:
      'Journey to the shores of Lake Tanganyika where Jane Goodall revolutionized our understanding of primates, tool-making, and human evolution.',
    coverImageUrl: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=1200&q=80',
    viewCount: 5420,
    content: `
# Chimpanzee Tracking in Gombe Stream National Park

Gombe Stream National Park is Tanzania's smallest national park (only 52 square kilometers), yet its impact on science is monumental. It was here in 1960 that a young Jane Goodall first observed chimpanzees stripping leaves from twigs to fish for termites—disproving the long-held dogma that humans were the only tool-making animals.

---

## Reaching Gombe: An Adventure by Water
Gombe has no roads. Access is exclusively by wooden dhow boat across the sapphire waters of Lake Tanganyika from the frontier port town of Kigoma. The dramatic forested hills plunge directly into the crystal lake, creating a secluded sanctuary.

---

## The Trekking Experience
Hikes in Gombe can be steep and demanding, as chimpanzees forage along mountain ridges and deep river valleys. Unlike gorillas, who remain relatively static, chimpanzees are vocal, energetic, and constantly on the move. When you find a troop, you witness intense social bonding, grooming rituals, mother-infant play, and thrilling vocal pant-hoots echoing through the canopy.
    `,
  },

  {
    slug: 'kruger-vs-sabi-sand-safari-comparison',
    title: 'Kruger vs. Sabi Sand: Comparing Public Parks to Private Concessions',
    operatorSlug: 'shadows-of-africa',
    tag: 'Safari Planning',
    excerpt:
      'Public self-drive tarmac roads or unfenced private concession luxury? We break down the differences in animal sightings, vehicle limits, and costs.',
    coverImageUrl: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80',
    viewCount: 12150,
    content: `
# Kruger National Park vs. Sabi Sand Game Reserve

One of the most frequent dilemmas for travelers heading to South Africa is deciding between booking inside the state-run Kruger National Park or within an adjacent private reserve like Sabi Sand.

---

## 1. Kruger National Park (Public Reserve)
- **Tarmac & Good Gravel Roads**: Anyone can drive through in a standard rental car.
- **Budget-Friendly**: Modest SANParks conservation fees and self-catering rest camps.
- **Strict Rules**: Vehicles must remain strictly on designated roads; gates close promptly at sunset; night driving is forbidden without official park rangers.
- **Sightings Crowding**: A sighting of a lion or cheetah on the main road can easily attract 20 to 30 private cars, creating traffic jams.

---

## 2. Sabi Sand Nature Reserve (Private Concession)
- **Unfenced Wilderness**: Shares a 50km unfenced border with Kruger, allowing animals to roam completely freely.
- **Off-Road Tracking**: Specially licensed open 4x4 vehicles can drive off-road into thick bush to track leopards and lions on the move.
- **Vehicle Caps**: A strict limit of maximum **3 vehicles per animal sighting** ensures wildlife is never harassed and guests have unobstructed photography angles.
- **Night Drives**: Highly trained trackers use red-filtered spotlights to find leopards, civets, and owls after dark.
    `,
  },

  {
    slug: 'spectacle-makgadikgadi-pans-botswana',
    title: 'Spectacle of the Makgadikgadi Salt Pans: Meerkats, Baobabs, and Silence',
    operatorSlug: 'pula-adventures',
    tag: 'Botswana Landscapes',
    excerpt:
      'Experience the surreal white silence of Africa’s largest salt flats, home to habituated meerkats, the second-largest zebra migration, and ancient baobab groves.',
    coverImageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80',
    viewCount: 6110,
    content: `
# The Makgadikgadi Salt Pans: Where Nothingness is Everything

Spanning over 16,000 square kilometers in northeastern Botswana, the Makgadikgadi Pans are all that remain of the ancient Lake Makgadikgadi, which once covered an area larger than Switzerland.

---

## 1. Habituated Meerkats: Up Close and Personal
One of the most heartwarming experiences on earth is spending the dawn with habituated meerkats. Because researchers have walked with these clans for decades, they view humans not as predators, but as handy 6-foot sentinel towers to climb atop and scan for birds of prey.

## 2. The Great Zebra & Wildebeest Migration
During the wet season (November to March), summer thunderstorms transform the dry salt crust into lush green grasslands and temporary algae pools. Over 30,000 zebras and blue wildebeest migrate across the pans, accompanied by thousands of greater and lesser flamingos.

## 3. The Sound of Pure Silence
In the dry winter months, quad biking out into the dead center of the pans brings you to a place with zero light pollution, zero cellular signal, and absolute silence. At night, the Milky Way arcs from horizon to horizon with unbelievable clarity.
    `,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. New Traveler Reviews (25 high-quality approved reviews)
// ─────────────────────────────────────────────────────────────────────────────
interface NewReviewDef {
  operatorSlug: string;
  tourSlug?: string;
  travelerEmail: string;
  overallRating: number;
  guideRating: number;
  vehicleRating: number;
  valueRating: number;
  itineraryAccuracyRating: number;
  title: string;
  body: string;
  daysAgo: number;
  operatorReply?: string;
}

const NEW_REVIEWS: NewReviewDef[] = [
  {
    operatorSlug: 'pula-adventures',
    tourSlug: '7-day-moremi-okavango-predator-trail',
    travelerEmail: 'traveler@gmail.com',
    overallRating: 5.0,
    guideRating: 5.0,
    vehicleRating: 5.0,
    valueRating: 4.8,
    itineraryAccuracyRating: 5.0,
    title: 'Moremi delivered beyond our wild dreams',
    body: 'We tracked a female leopard for over two hours in the Xakanaxa woodlands. Our guide KG read every bird alarm call with pinpoint accuracy. Camp Moremi was pure luxury under canvas.',
    daysAgo: 45,
    operatorReply: 'Thank you Sarah! Tracking that leopard with you was an absolute privilege. Safe travels until next time!',
  },
  {
    operatorSlug: 'pula-adventures',
    tourSlug: '6-day-makgadikgadi-pans-kalahari-expedition',
    travelerEmail: 'liam.oconnor@example.com',
    overallRating: 4.9,
    guideRating: 5.0,
    vehicleRating: 4.8,
    valueRating: 5.0,
    itineraryAccuracyRating: 4.9,
    title: 'Meerkats climbing onto our heads at sunrise!',
    body: 'Standing in the silence of the salt pans while a wild meerkat used my shoulder as a lookout was a life highlight. The San Bushmen walk was deeply educational and humbling.',
    daysAgo: 60,
  },
  {
    operatorSlug: 'pula-adventures',
    tourSlug: '5-day-nxai-pan-baines-baobabs-chobe',
    travelerEmail: 'ana.silva@example.com',
    overallRating: 4.8,
    guideRating: 4.9,
    vehicleRating: 4.7,
    valueRating: 4.8,
    itineraryAccuracyRating: 5.0,
    title: 'Baines’ Baobabs and endless cheetah sightings',
    body: 'Nxai Pan felt completely private. We were the only vehicle at the waterhole watching a cheetah stalk springbok. Kasane river cruise on Chobe was a magnificent finale.',
    daysAgo: 72,
    operatorReply: 'Obrigado Ana! Nxai Pan remains one of Botswana’s best kept secrets. Delighted you loved it!',
  },
  {
    operatorSlug: 'sunstrip-africa-safaris',
    tourSlug: '6-day-samburu-buffalo-springs-special-five',
    travelerEmail: 'hans.mueller@example.com',
    overallRating: 5.0,
    guideRating: 5.0,
    vehicleRating: 5.0,
    valueRating: 4.9,
    itineraryAccuracyRating: 5.0,
    title: 'Ticked off all Northern Special 5 species!',
    body: 'The natural champagne spring in Buffalo Springs was so clear and refreshing. Our driver Wanjiru spotted gerenuks standing tall and Grevy’s zebras within our first morning.',
    daysAgo: 38,
    operatorReply: 'Asante sana Hans! Wanjiru sends her warmest greetings from Nairobi. Karibu Kenya!',
  },
  {
    operatorSlug: 'sunstrip-africa-safaris',
    tourSlug: '4-day-samburu-and-lake-nakuru-safari',
    travelerEmail: 'yuki.tanaka@example.com',
    overallRating: 4.7,
    guideRating: 5.0,
    vehicleRating: 4.6,
    valueRating: 4.8,
    itineraryAccuracyRating: 4.7,
    title: 'Great rhino sightings at Lake Nakuru',
    body: 'White and black rhinos grazing side-by-side along the acacia forests. The vehicle was spotless with cold water and beanbags for our heavy lenses.',
    daysAgo: 85,
  },
  {
    operatorSlug: 'shadows-of-africa',
    tourSlug: '6-day-garden-route-addo-elephant-safari',
    travelerEmail: 'daniel.morgan@example.com',
    overallRating: 5.0,
    guideRating: 5.0,
    vehicleRating: 5.0,
    valueRating: 4.9,
    itineraryAccuracyRating: 5.0,
    title: 'The ultimate malaria-free family safari',
    body: 'Traveling with an 8-year-old, we wanted complete safety without compromising on Big 5 wildlife. Addo had herds of over 50 elephants bathing at Hapoor dam. Gorah camp was immaculate.',
    daysAgo: 28,
    operatorReply: 'Thank you Daniel! We specialize in seamless family safaris and are so happy the kids loved the elephants!',
  },
  {
    operatorSlug: 'shadows-of-africa',
    tourSlug: '4-day-malamala-legendary-big-five-safari',
    travelerEmail: 'emma.clark@example.com',
    overallRating: 5.0,
    guideRating: 5.0,
    vehicleRating: 5.0,
    valueRating: 4.7,
    itineraryAccuracyRating: 5.0,
    title: 'MalaMala sets the gold standard for luxury wildlife viewing',
    body: 'Unmatched predator photography. We watched seven lions stalk a buffalo herd right through the riverbed. Never more than two other vehicles around. Worth every single dollar.',
    daysAgo: 19,
    operatorReply: 'Dear Emma, MalaMala truly is in a league of its own. It was a pleasure organizing your private bush flights.',
  },
  {
    operatorSlug: 'shadows-of-africa',
    tourSlug: '6-day-kruger-and-sabi-sand-safari',
    travelerEmail: 'maya.tran@example.com',
    overallRating: 4.9,
    guideRating: 5.0,
    vehicleRating: 4.9,
    valueRating: 4.8,
    itineraryAccuracyRating: 5.0,
    title: 'Sabi Sand night drives were thrilling',
    body: 'Watching a female leopard carry her kill up into an ebony tree while hyenas waited below was like stepping straight into a documentary. The guides were exceptionally respectful of the animals.',
    daysAgo: 50,
  },
  {
    operatorSlug: 'kili-tanzanian-expeditions',
    tourSlug: '6-day-katavi-remote-wilderness-safari',
    travelerEmail: 'lukas.weber@example.com',
    overallRating: 5.0,
    guideRating: 5.0,
    vehicleRating: 4.9,
    valueRating: 4.9,
    itineraryAccuracyRating: 5.0,
    title: 'Katavi is true raw, untamed Africa',
    body: 'No crowds, no radio chatter. Just thousands of hippos and huge buffalo herds kicking up dust clouds. Amara and his pilot coordinated every flight flawlessly.',
    daysAgo: 32,
    operatorReply: 'Habari Lukas! Western Tanzania remains wild precisely because of intrepid travelers like you. Asante sana!',
  },
  {
    operatorSlug: 'kili-tanzanian-expeditions',
    tourSlug: '5-day-serengeti-ngorongoro-big-five-safari',
    travelerEmail: 'elena.rossi@example.com',
    overallRating: 4.8,
    guideRating: 5.0,
    vehicleRating: 4.7,
    valueRating: 4.8,
    itineraryAccuracyRating: 4.9,
    title: 'Ngorongoro Crater descent took our breath away',
    body: 'Descending 600 meters into the volcanic caldera at sunrise was magical. We saw two black rhinos near Lake Magadi and a pride of lions resting in the grass.',
    daysAgo: 65,
  },
  {
    operatorSlug: 'josh-dreamland-safari',
    tourSlug: '5-day-gombe-stream-chimpanzee-trekking',
    travelerEmail: 'chloe.bennett@example.com',
    overallRating: 5.0,
    guideRating: 5.0,
    vehicleRating: 4.8,
    valueRating: 4.9,
    itineraryAccuracyRating: 5.0,
    title: 'Following Jane Goodall’s footsteps at Gombe Stream',
    body: 'Trekking through the misty rainforest and hearing the pant-hoot calls of wild chimps was spine-tingling. Sitting 10 meters from a mother and baby chimp made me cry. Lake Tanganyika was paradise.',
    daysAgo: 40,
    operatorReply: 'Thank you Chloe! Gombe holds a special place in our hearts. We are thrilled your primate trek was unforgettable.',
  },
  {
    operatorSlug: 'josh-dreamland-safari',
    tourSlug: '8-day-mid-range-great-migration-safari',
    travelerEmail: 'francois.dupont@example.com',
    overallRating: 4.9,
    guideRating: 5.0,
    vehicleRating: 4.8,
    valueRating: 5.0,
    itineraryAccuracyRating: 4.8,
    title: 'Incredible value and Mara river crossings',
    body: 'We caught a dramatic crossing with thousands of wildebeest braving the river. Joshua’s team selected wonderful mid-range lodges with delicious hot meals and charging outlets.',
    daysAgo: 95,
  },
  {
    operatorSlug: 'activentures-africa-safaris',
    tourSlug: '4-day-fly-in-luxury-bwindi-gorilla-trekking-safari',
    travelerEmail: 'priya.sharma@example.com',
    overallRating: 5.0,
    guideRating: 5.0,
    vehicleRating: 5.0,
    valueRating: 4.8,
    itineraryAccuracyRating: 5.0,
    title: 'An hour with the Rushegura gorilla family',
    body: 'The silverback passed within three meters of us, so majestic and calm. Moses and the UWA rangers paced the trek perfectly through the steep jungle. The lodge overlooking the forest was 10/10.',
    daysAgo: 22,
    operatorReply: 'Thank you Priya! The Rushegura family is magnificent. Glad the lodge and porters took great care of you.',
  },
  {
    operatorSlug: 'activentures-africa-safaris',
    tourSlug: '5-day-mid-range-chimpanzee-and-gorilla-safari-uganda',
    travelerEmail: 'daniel.morgan@example.com',
    overallRating: 4.9,
    guideRating: 5.0,
    vehicleRating: 4.8,
    valueRating: 5.0,
    itineraryAccuracyRating: 4.9,
    title: 'Chimps in Kibale and Gorillas in Bwindi',
    body: 'Uganda is truly the Pearl of Africa. Tree-climbing lions in Ishasha were an unexpected bonus! Highly recommend Activentures for permit booking reliability.',
    daysAgo: 78,
  },
  {
    operatorSlug: 'mubala-wildlife-safaris',
    tourSlug: '8-day-uganda-gorilla-and-wildlife-safari',
    travelerEmail: 'maya.tran@example.com',
    overallRating: 4.8,
    guideRating: 4.9,
    vehicleRating: 4.7,
    valueRating: 5.0,
    itineraryAccuracyRating: 4.8,
    title: 'Kazinga channel boat cruise was packed with wildlife',
    body: 'Hundreds of elephants and hippos drinking along the Kazinga Channel banks. Then Murchison Falls at sunset with the roaring Nile gorge. Superb experience!',
    daysAgo: 110,
  },
  {
    operatorSlug: 'serengeti-sunrise-safaris',
    tourSlug: '7-day-big-five-circuit',
    travelerEmail: 'hans.mueller@example.com',
    overallRating: 4.9,
    guideRating: 5.0,
    vehicleRating: 5.0,
    valueRating: 4.8,
    itineraryAccuracyRating: 4.9,
    title: 'Tarangire elephant herds were colossal',
    body: 'Ancient baobab trees with hundreds of elephants digging for roots below. Our tented camp had hot bucket showers and delicious local coffee in the morning.',
    daysAgo: 58,
  },
  {
    operatorSlug: 'serengeti-sunrise-safaris',
    tourSlug: '6-day-south-luangwa-walking-safari',
    travelerEmail: 'lukas.weber@example.com',
    overallRating: 5.0,
    guideRating: 5.0,
    vehicleRating: 4.9,
    valueRating: 5.0,
    itineraryAccuracyRating: 5.0,
    title: 'Walking among elephants in South Luangwa',
    body: 'The armed wildlife scouts and naturalist guides are phenomenal. Experiencing the Zambian bush on foot makes you feel deeply connected to nature. Bush camps were exquisite.',
    daysAgo: 42,
    operatorReply: 'Zikomo kwambiri Lukas! Walking the Luangwa Valley is the purest safari on earth. Glad you enjoyed every step.',
  },
  {
    operatorSlug: 'mara-wilderness-safaris',
    tourSlug: '3-day-masai-mara-express-fly-in-safari',
    travelerEmail: 'emma.clark@example.com',
    overallRating: 5.0,
    guideRating: 5.0,
    vehicleRating: 5.0,
    valueRating: 4.7,
    itineraryAccuracyRating: 5.0,
    title: 'Short on time, big on sightings',
    body: 'Only had three days before a conference in Nairobi. David booked our flight directly into Mara North. Saw cheetah cubs, lion prides, and black rhinos in 48 hours!',
    daysAgo: 14,
    operatorReply: 'Thank you Emma! The fly-in express maximizes every precious minute in the Mara. Safe travels!',
  },
  {
    operatorSlug: 'majestic-wins-adventures',
    tourSlug: '7-day-karibu-safari',
    travelerEmail: 'yuki.tanaka@example.com',
    overallRating: 4.8,
    guideRating: 4.9,
    vehicleRating: 4.8,
    valueRating: 4.9,
    itineraryAccuracyRating: 4.8,
    title: 'Beautiful first-time Tanzania safari',
    body: 'Baraka was such a patient and knowledgeable guide. He taught us Swahili safari terms and spotted a leopard hiding in a sausage tree from 200 meters away!',
    daysAgo: 80,
  },
  {
    operatorSlug: 'majestic-wins-adventures',
    tourSlug: '4-day-tanzania-express-safari-medium',
    travelerEmail: 'francois.dupont@example.com',
    overallRating: 4.7,
    guideRating: 4.8,
    vehicleRating: 4.6,
    valueRating: 4.9,
    itineraryAccuracyRating: 4.7,
    title: 'Great budget-friendly trip to Tarangire and Ngorongoro',
    body: 'Well-paced itinerary. Food was surprisingly hearty and tasty. Our pop-up roof cruiser was very reliable over bumpy tracks.',
    daysAgo: 105,
  },
  {
    operatorSlug: 'sunstrip-africa-safaris',
    tourSlug: '7-day-living-among-the-elephants-group-safari',
    travelerEmail: 'chloe.bennett@example.com',
    overallRating: 4.9,
    guideRating: 5.0,
    vehicleRating: 4.8,
    valueRating: 4.9,
    itineraryAccuracyRating: 5.0,
    title: 'Amboseli views of Kilimanjaro were unreal',
    body: 'Waking up to giant bull elephants walking past the snows of Mount Kilimanjaro is burned into my memory forever. Great group dynamics and lovely guide.',
    daysAgo: 52,
  },
  {
    operatorSlug: 'shadows-of-africa',
    tourSlug: '5-day-rwanda-gorillas-and-akagera',
    travelerEmail: 'priya.sharma@example.com',
    overallRating: 5.0,
    guideRating: 5.0,
    vehicleRating: 5.0,
    valueRating: 4.8,
    itineraryAccuracyRating: 5.0,
    title: 'Rwanda is clean, efficient, and wildlife rich',
    body: 'The contrast between tracking gorillas in the volcanic mist and seeing lions and rhinos in the savannas of Akagera made this the perfect compact itinerary.',
    daysAgo: 30,
    operatorReply: 'Murakoze Priya! Rwanda offers the best of both worlds in under a week. Thank you for choosing Shadows of Africa.',
  },
  {
    operatorSlug: 'shadows-of-africa',
    tourSlug: '10-day-namibia-etosha-and-sossusvlei-self-drive',
    travelerEmail: 'hans.mueller@example.com',
    overallRating: 4.8,
    guideRating: 4.9,
    vehicleRating: 5.0,
    valueRating: 4.7,
    itineraryAccuracyRating: 4.9,
    title: 'Climbing Big Daddy Dune at sunrise in Sossusvlei',
    body: 'The desert dunes of Sossusvlei and Dead Vlei are out of this world. Etosha waterholes were packed with elephants covered in white limestone clay. Perfectly prepped rental 4x4.',
    daysAgo: 88,
  },
  {
    operatorSlug: 'go-serengeti-african-tours',
    tourSlug: '9-day-tanzania-budget-safari-with-beach-holiday',
    travelerEmail: 'ana.silva@example.com',
    overallRating: 4.8,
    guideRating: 4.9,
    vehicleRating: 4.7,
    valueRating: 5.0,
    itineraryAccuracyRating: 4.8,
    title: 'Savannah dust followed by turquoise Zanzibar waters',
    body: 'The best of both worlds. Five days of intense game drives in Serengeti and Ngorongoro, ending with fresh coconut water and dhow sunset cruises in Kendwa.',
    daysAgo: 66,
  },
  {
    operatorSlug: 'shemeji-safari',
    tourSlug: '10-day-chasing-the-big-5-tented-safari',
    travelerEmail: 'liam.oconnor@example.com',
    overallRating: 4.9,
    guideRating: 5.0,
    vehicleRating: 4.8,
    valueRating: 4.8,
    itineraryAccuracyRating: 5.0,
    title: 'Full Big 5 checklist completed!',
    body: 'Rehema’s guides tracked black rhinos in Ngorongoro and a tree-climbing lion in Lake Manyara. Camp staff sang traditional welcoming songs every evening.',
    daysAgo: 115,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SEED FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Starting Comprehensive SafariAsili Dummy Data Seeding...\n');

  // 1. Ensure Travelers Exist
  console.log('👤 Seeding / verifying demo traveler accounts...');
  const travelerPasswordHash = await bcrypt.hash('TravelerPass123!', 10);
  const travelerMap = new Map<string, string>(); // email -> userId

  for (const t of DEMO_TRAVELERS) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {
        firstName: t.first,
        lastName: t.last,
        country: t.country,
        phone: t.phone,
        role: Role.TRAVELER,
        emailVerified: true,
      },
      create: {
        email: t.email,
        passwordHash: travelerPasswordHash,
        firstName: t.first,
        lastName: t.last,
        country: t.country,
        phone: t.phone,
        role: Role.TRAVELER,
        emailVerified: true,
      },
    });
    travelerMap.set(t.email, user.id);
  }
  console.log(`✅ Verified ${travelerMap.size} traveler accounts.\n`);

  // 2. Fetch Destinations and Operators
  const destinations = await prisma.destination.findMany();
  const destBySlug = new Map<string, string>(); // slug -> id
  destinations.forEach((d) => destBySlug.set(d.slug, d.id));

  const operators = await prisma.operator.findMany({
    include: { vehicles: true, user: true },
  });
  const opBySlug = new Map<string, typeof operators[number]>();
  operators.forEach((o) => opBySlug.set(o.slug, o));

  // 3. Seed New Tours covering the 8 unserved parks
  console.log('🦁 Seeding new authentic tours for unserved parks...');
  let newTourCount = 0;
  let newSlotCount = 0;

  for (let tourIdx = 0; tourIdx < NEW_TOURS.length; tourIdx++) {
    const tDef = NEW_TOURS[tourIdx];
    const operator = opBySlug.get(tDef.operatorSlug);
    if (!operator) {
      console.warn(`⚠️ Operator '${tDef.operatorSlug}' not found! Skipping tour '${tDef.slug}'`);
      continue;
    }

    // Check if tour already exists
    let tour = await prisma.tour.findUnique({ where: { slug: tDef.slug } });
    if (!tour) {
      tour = await prisma.tour.create({
        data: {
          operatorId: operator.id,
          title: tDef.title,
          slug: tDef.slug,
          durationDays: tDef.days,
          durationNights: Math.max(1, tDef.days - 1),
          minPriceUsd: tDef.minPrice,
          maxPriceUsd: tDef.maxPrice,
          comfortLevel: tDef.comfort,
          tourType: tDef.type,
          primaryCountry: tDef.country,
          startLocation: tDef.start,
          endLocation: tDef.end,
          inclusions: tDef.inclusions,
          exclusions: tDef.exclusions,
          isPublished: true,
          itineraries: {
            create: tDef.plan.map((p) => ({
              dayNumber: p.day,
              title: p.title,
              description: p.description,
              accommodationName: p.accommodationName,
              accommodationType: p.accommodationType,
              mealsIncluded: p.meals,
            })),
          },
        },
      });
      newTourCount++;
      console.log(`  + Created tour: ${tour.title} [${tour.slug}]`);
    }

    // Link destinations (both specific parks AND the country destination)
    const allDestSlugsToLink = new Set([...tDef.destSlugs]);
    const countryDestSlug = tDef.country.toLowerCase().replace(/\s+/g, '-');
    if (destBySlug.has(countryDestSlug)) {
      allDestSlugsToLink.add(countryDestSlug);
    }

    for (const dSlug of Array.from(allDestSlugsToLink)) {
      const destId = destBySlug.get(dSlug);
      if (destId) {
        await prisma.tourDestination.upsert({
          where: { tourId_destinationId: { tourId: tour.id, destinationId: destId } },
          update: {},
          create: { tourId: tour.id, destinationId: destId },
        });
      }
    }

    // Ensure TourAvailability
    await prisma.tourAvailability.upsert({
      where: { tourId: tour.id },
      update: { mode: 'SLOTS' },
      create: { tourId: tour.id, mode: 'SLOTS' },
    });

    // Create 4 active upcoming departures with staggered dates and dedicated vehicle
    const baseDay = 15 + tourIdx * 12;
    const departureIntervals = [baseDay, baseDay + 30, baseDay + 60, baseDay + 90];
    const vehicle = operator.vehicles.length > 0
      ? operator.vehicles[tourIdx % operator.vehicles.length]
      : null;

    for (let i = 0; i < departureIntervals.length; i++) {
      const departureDate = inDays(departureIntervals[i]);
      departureDate.setUTCHours(8, 0, 0, 0);

      const slot = await prisma.tourSlot.upsert({
        where: {
          tourId_startDate_departureTime: {
            tourId: tour.id,
            startDate: departureDate,
            departureTime: '08:00',
          },
        },
        update: { status: SlotStatus.OPEN },
        create: {
          tourId: tour.id,
          startDate: departureDate,
          departureTime: '08:00',
          maxTravelers: vehicle ? vehicle.seats : 6,
          bookedSeats: 0,
          status: SlotStatus.OPEN,
          note: i === 0 ? 'Guaranteed departure · small group' : 'Scheduled departure',
        },
      });
      newSlotCount++;

      // Try assigning vehicle to slot if available (safely guarded against overlap trigger)
      if (vehicle) {
        try {
          await prisma.slotVehicle.upsert({
            where: { slotId_vehicleId: { slotId: slot.id, vehicleId: vehicle.id } },
            update: {},
            create: {
              slotId: slot.id,
              vehicleId: vehicle.id,
              seats: vehicle.seats,
              bookedSeats: 0,
            },
          });
        } catch {
          // Vehicle already assigned on overlapping date, continue gracefully
        }
      }
    }
  }
  console.log(`✅ Seeded ${newTourCount} new tours and ${newSlotCount} departure slots.\n`);

  // 4. Link ALL existing and new tours to their Country Destination
  console.log('🌍 Linking every tour to its corresponding country destination...');
  const allTours = await prisma.tour.findMany({
    select: { id: true, title: true, primaryCountry: true },
  });

  let countryLinksAdded = 0;
  for (const tour of allTours) {
    const countryDestSlug = tour.primaryCountry.toLowerCase().replace(/\s+/g, '-');
    const countryDestId = destBySlug.get(countryDestSlug);
    if (countryDestId) {
      const existingLink = await prisma.tourDestination.findUnique({
        where: { tourId_destinationId: { tourId: tour.id, destinationId: countryDestId } },
      });
      if (!existingLink) {
        await prisma.tourDestination.create({
          data: {
            tourId: tour.id,
            destinationId: countryDestId,
          },
        });
        countryLinksAdded++;
      }
    }
  }
  console.log(`✅ Added ${countryLinksAdded} country destination links to tours.\n`);

  // 5. Expand Safari Experts (Add 5 new realistic experts)
  console.log('🎓 Expanding Safari Experts...');
  for (const exp of NEW_EXPERTS) {
    await prisma.expert.upsert({
      where: { slug: exp.slug },
      update: {
        name: exp.name,
        country: exp.country,
        reviewCount: exp.reviewCount,
        biography: exp.biography,
        imageUrl: exp.imageUrl,
        sortOrder: exp.sortOrder,
      },
      create: exp,
    });
    console.log(`  + Expert: ${exp.name} (${exp.country}) [${exp.slug}]`);
  }
  console.log(`✅ Experts expanded. Total experts now: ${await prisma.expert.count()}.\n`);

  // 6. Expand Blog Posts (Add 10 rich blog posts)
  console.log('📰 Expanding Blog Posts...');
  let blogCount = 0;
  for (const post of NEW_BLOG_POSTS) {
    const operator = opBySlug.get(post.operatorSlug);
    if (!operator) {
      console.warn(`⚠️ Operator '${post.operatorSlug}' not found for blog post '${post.slug}'`);
      continue;
    }

    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        tag: post.tag,
        excerpt: post.excerpt,
        content: post.content.trim(),
        coverImageUrl: post.coverImageUrl,
        viewCount: post.viewCount,
        operatorId: operator.id,
        authorId: operator.userId,
      },
      create: {
        slug: post.slug,
        title: post.title,
        tag: post.tag,
        excerpt: post.excerpt,
        content: post.content.trim(),
        coverImageUrl: post.coverImageUrl,
        viewCount: post.viewCount,
        operatorId: operator.id,
        authorId: operator.userId,
        status: 'PUBLISHED',
      },
    });
    blogCount++;
    console.log(`  + Blog: ${post.title}`);
  }
  console.log(`✅ Blog posts expanded. Total posts now: ${await prisma.blogPost.count()}.\n`);

  // 7. Expand Reviews (Add 25 realistic approved reviews)
  console.log('⭐ Expanding traveler reviews...');
  let reviewsAdded = 0;
  const tourBySlugMap = new Map<string, string>();
  (await prisma.tour.findMany({ select: { id: true, slug: true } })).forEach((t) =>
    tourBySlugMap.set(t.slug, t.id)
  );

  for (const rev of NEW_REVIEWS) {
    const operator = opBySlug.get(rev.operatorSlug);
    if (!operator) continue;

    const travelerId = travelerMap.get(rev.travelerEmail);
    if (!travelerId) continue;

    const tourId = rev.tourSlug ? tourBySlugMap.get(rev.tourSlug) ?? null : null;

    // Check if review already exists by traveler and title
    const existing = await prisma.review.findFirst({
      where: {
        travelerId,
        reviewTitle: rev.title,
      },
    });

    if (!existing) {
      const travelDate = new Date(Date.now() - rev.daysAgo * DAY_MS);
      const createdAt = new Date(travelDate.getTime() + 5 * DAY_MS);

      await prisma.review.create({
        data: {
          operatorId: operator.id,
          tourId,
          travelerId,
          overallRating: rev.overallRating,
          guideRating: rev.guideRating,
          vehicleRating: rev.vehicleRating,
          valueRating: rev.valueRating,
          itineraryAccuracyRating: rev.itineraryAccuracyRating,
          reviewTitle: rev.title,
          reviewBody: rev.body,
          travelDate,
          createdAt,
          isVerifiedBooking: true,
          status: ReviewStatus.APPROVED,
          operatorReply: rev.operatorReply ?? null,
        },
      });
      reviewsAdded++;
    }
  }
  console.log(`✅ Added ${reviewsAdded} approved traveler reviews.`);

  // Recalculate operator ratings & review counts
  for (const op of operators) {
    const revs = await prisma.review.findMany({
      where: { operatorId: op.id, status: ReviewStatus.APPROVED },
      select: { overallRating: true },
    });
    if (revs.length > 0) {
      const avg = Math.round((revs.reduce((sum, r) => sum + r.overallRating, 0) / revs.length) * 10) / 10;
      await prisma.operator.update({
        where: { id: op.id },
        data: {
          averageRating: avg,
          totalReviews: revs.length,
        },
      });
    }
  }
  console.log(`✅ Updated average ratings & review counts for all operators.\n`);

  // 8. Expand Inquiries, Leads, and Reservations
  console.log('📋 Expanding Sample Inquiries, Leads, and Demo Reservations...');
  const sarahId = travelerMap.get('traveler@gmail.com')!;
  const liamId = travelerMap.get('liam.oconnor@example.com')!;
  const danielId = travelerMap.get('daniel.morgan@example.com')!;
  const emmaId = travelerMap.get('emma.clark@example.com')!;
  const mayaId = travelerMap.get('maya.tran@example.com')!;
  const lukasId = travelerMap.get('lukas.weber@example.com')!;

  const pulaOp = opBySlug.get('pula-adventures');
  const sunstripOp = opBySlug.get('sunstrip-africa-safaris');
  const shadowsOp = opBySlug.get('shadows-of-africa');
  const kiliOp = opBySlug.get('kili-tanzanian-expeditions');
  const joshOp = opBySlug.get('josh-dreamland-safari');

  // Inquiry 1: Emma Clark asking about Botswana Moremi Safari
  const moremiTour = await prisma.tour.findUnique({ where: { slug: '7-day-moremi-okavango-predator-trail' } });
  if (moremiTour && pulaOp) {
    let inq1 = await prisma.inquiry.findFirst({
      where: { travelerId: emmaId, preferredCountry: 'Botswana' },
    });
    if (!inq1) {
      inq1 = await prisma.inquiry.create({
        data: {
          travelerId: emmaId,
          tourId: moremiTour.id,
          preferredCountry: 'Botswana',
          travelDateStart: inDays(60),
          travelDateEnd: inDays(67),
          isFlexibleDates: true,
          adultsCount: 2,
          childrenCount: 0,
          budgetPerPersonUsd: 3200,
          comfortPreference: ComfortLevel.LUXURY,
          customNotes: 'We are celebrating our 10th anniversary. Looking for private 4x4 game drives and excellent predator guides.',
          isBroadcast: false,
          status: InquiryStatus.RESPONDED,
        },
      });

      const lead1 = await prisma.inquiryLead.create({
        data: {
          inquiryId: inq1.id,
          operatorId: pulaOp.id,
          status: LeadStatus.PROPOSAL_SENT,
        },
      });

      await prisma.message.create({
        data: {
          inquiryLeadId: lead1.id,
          senderId: emmaId,
          content: 'Hi Pula Adventures! We are looking at the 7-day Moremi Predator Trail for our anniversary. Can you confirm if all game drives are strictly private?',
          attachmentUrls: [],
          createdAt: inDays(-5),
        },
      });

      await prisma.message.create({
        data: {
          inquiryLeadId: lead1.id,
          senderId: pulaOp.userId,
          content: 'Hello Emma! Congratulations on your anniversary. Yes, this tour includes your own private 4x4 Land Cruiser with a dedicated tracker throughout Moremi. We have reserved tent 4 at Camp Moremi for the best river views.',
          attachmentUrls: [],
          createdAt: inDays(-4),
        },
      });
      console.log('  + Created Inquiry 1: Botswana anniversary safari with proposal');
    }
  }

  // Inquiry 2: Daniel Morgan asking about Kenya family safari
  const samburuTour = await prisma.tour.findUnique({ where: { slug: '6-day-samburu-buffalo-springs-special-five' } });
  if (samburuTour && sunstripOp) {
    let inq2 = await prisma.inquiry.findFirst({
      where: { travelerId: danielId, preferredCountry: 'Kenya' },
    });
    if (!inq2) {
      inq2 = await prisma.inquiry.create({
        data: {
          travelerId: danielId,
          tourId: samburuTour.id,
          preferredCountry: 'Kenya',
          travelDateStart: inDays(45),
          travelDateEnd: inDays(51),
          isFlexibleDates: true,
          adultsCount: 2,
          childrenCount: 1,
          budgetPerPersonUsd: 2000,
          comfortPreference: ComfortLevel.MID_RANGE,
          customNotes: 'Traveling with an 8-year-old child. Interested in the Samburu Special 5 and swimming pool at lodges.',
          isBroadcast: true,
          status: InquiryStatus.RESPONDED,
        },
      });

      const lead2 = await prisma.inquiryLead.create({
        data: {
          inquiryId: inq2.id,
          operatorId: sunstripOp.id,
          status: LeadStatus.PROPOSAL_SENT,
        },
      });

      await prisma.message.create({
        data: {
          inquiryLeadId: lead2.id,
          senderId: danielId,
          content: 'Hello! Does Samburu Simba Lodge have a pool where our child can cool off between hot morning and afternoon game drives?',
          attachmentUrls: [],
          createdAt: inDays(-3),
        },
      });

      await prisma.message.create({
        data: {
          inquiryLeadId: lead2.id,
          senderId: sunstripOp.userId,
          content: 'Jambo Daniel! Yes, Samburu Simba Lodge features two expansive swimming pools directly overlooking the river and waterhole. It is wonderful for children.',
          attachmentUrls: [],
          createdAt: inDays(-2),
        },
      });
      console.log('  + Created Inquiry 2: Kenya family safari with operator dialogue');
    }
  }

  // Demo Reservations (covering COMPLETED, APPROVED, and PENDING)
  // Each must have a valid scheduled TourSlot to satisfy reservations_require_departure trigger!
  const reservationsToSeed = [
    // 1. Completed Safari (Sarah Jenkins - Botswana Moremi)
    {
      ref: 'SR-BOTS-CMP01',
      travelerId: sarahId,
      tourSlug: '7-day-moremi-okavango-predator-trail',
      opSlug: 'pula-adventures',
      start: inDays(-55),
      adults: 2,
      children: 0,
      total: 5700,
      status: ReservationStatus.COMPLETED,
      operatorNote: 'Trip completed successfully. Guests raved about leopard and wild dog pack encounters.',
      decidedDaysAgo: -60,
      completedDaysAgo: -48,
      messages: [
        { sender: 'traveler', body: 'We are packing our bags for Maun! Can not wait.', daysAgo: -58 },
        { sender: 'operator', body: 'Karibu Sarah! Your guide KG will be waiting at Maun Airport with cold towels and your safari briefing.', daysAgo: -57 },
        { sender: 'traveler', body: 'Thank you for the trip of a lifetime! The wild dogs on day six were unbelievable.', daysAgo: -47 },
      ],
    },
    // 2. Completed Safari (Hans Müller - Kenya Buffalo Springs)
    {
      ref: 'SR-KEN-CMP02',
      travelerId: travelerMap.get('hans.mueller@example.com')!,
      tourSlug: '6-day-samburu-buffalo-springs-special-five',
      opSlug: 'sunstrip-africa-safaris',
      start: inDays(-80),
      adults: 2,
      children: 0,
      total: 3500,
      status: ReservationStatus.COMPLETED,
      operatorNote: 'Completed. Guest loved the Champagne Spring and Grevy’s zebra photography.',
      decidedDaysAgo: -85,
      completedDaysAgo: -74,
      messages: [
        { sender: 'operator', body: 'Confirmed with Samburu Simba Lodge. Private 4x4 Land Cruiser allocated with roof hatch.', daysAgo: -84 },
        { sender: 'traveler', body: 'Danke schön! Great vehicle and driver guide Wanjiru was brilliant.', daysAgo: -73 },
      ],
    },
    // 3. Approved Upcoming Safari (Daniel Morgan - Addo South Africa)
    {
      ref: 'SR-ZAF-APP01',
      travelerId: danielId,
      tourSlug: '6-day-garden-route-addo-elephant-safari',
      opSlug: 'shadows-of-africa',
      start: inDays(25),
      adults: 2,
      children: 1,
      total: 4600,
      status: ReservationStatus.APPROVED,
      operatorNote: 'Confirmed. Gorah Elephant Camp colonial tent locked in with child rollaway bed.',
      decidedDaysAgo: -3,
      messages: [
        { sender: 'traveler', body: 'We are landing at Port Elizabeth at 11:30 AM. Will the driver meet us inside the terminal?', daysAgo: -2 },
        { sender: 'operator', body: 'Yes Daniel! Our private chauffeur will hold a SafariAsili name board right outside the luggage exit.', daysAgo: -1 },
      ],
    },
    // 4. Approved Upcoming Safari (Emma Clark - MalaMala South Africa)
    {
      ref: 'SR-ZAF-APP02',
      travelerId: emmaId,
      tourSlug: '4-day-malamala-legendary-big-five-safari',
      opSlug: 'shadows-of-africa',
      start: inDays(40),
      adults: 2,
      children: 0,
      total: 6900,
      status: ReservationStatus.APPROVED,
      operatorNote: 'Confirmed. MalaMala River suite reserved with private plunge pool.',
      decidedDaysAgo: -4,
      messages: [
        { sender: 'traveler', body: 'Please note gluten-free dietary requirements for my partner.', daysAgo: -3 },
        { sender: 'operator', body: 'Noted with the executive chef at MalaMala Main Camp. Delicious gluten-free options will be ready.', daysAgo: -2 },
      ],
    },
    // 5. Pending Booking Request (Maya Tran - Katavi Tanzania)
    {
      ref: 'SR-TZ-PND01',
      travelerId: mayaId,
      tourSlug: '6-day-katavi-remote-wilderness-safari',
      opSlug: 'kili-tanzanian-expeditions',
      start: inDays(65),
      adults: 2,
      children: 0,
      total: 7780,
      status: ReservationStatus.PENDING,
      operatorNote: 'Reviewing flight availability on the shared bush shuttle from Arusha.',
      messages: [
        { sender: 'traveler', body: 'Hello Amara! We just submitted our reservation for Katavi. Could you let us know luggage weight limits for the bush flight?', daysAgo: -1 },
      ],
    },
    // 6. Pending Booking Request (Lukas Weber - Gombe Chimpanzees)
    {
      ref: 'SR-TZ-PND02',
      travelerId: lukasId,
      tourSlug: '5-day-gombe-stream-chimpanzee-trekking',
      opSlug: 'josh-dreamland-safari',
      start: inDays(90),
      adults: 2,
      children: 0,
      total: 4300,
      status: ReservationStatus.PENDING,
      operatorNote: 'Checking TANAPA chimp permit dates for Mitumba valley.',
      messages: [
        { sender: 'traveler', body: 'Hi Joshua, we are looking forward to Gombe. Can we do two chimp treks instead of one if permits permit?', daysAgo: -1 },
      ],
    },
  ];

  for (const resDef of reservationsToSeed) {
    const existing = await prisma.reservation.findUnique({ where: { reference: resDef.ref } });
    if (existing) continue;

    const tour = await prisma.tour.findUnique({ where: { slug: resDef.tourSlug } });
    const op = opBySlug.get(resDef.opSlug);
    if (!tour || !op) continue;

    // Ensure a TourSlot exists for the reservation's tour and startDate
    const resSlotDate = new Date(resDef.start);
    resSlotDate.setUTCHours(8, 0, 0, 0);

    const slot = await prisma.tourSlot.upsert({
      where: {
        tourId_startDate_departureTime: {
          tourId: tour.id,
          startDate: resSlotDate,
          departureTime: '08:00',
        },
      },
      update: {},
      create: {
        tourId: tour.id,
        startDate: resSlotDate,
        departureTime: '08:00',
        maxTravelers: 12,
        bookedSeats: 0,
        status: SlotStatus.OPEN,
        note: 'Reserved departure',
      },
    });

    const res = await prisma.reservation.create({
      data: {
        reference: resDef.ref,
        travelerId: resDef.travelerId,
        tourId: tour.id,
        operatorId: op.id,
        slotId: slot.id,
        startDate: resSlotDate,
        adultsCount: resDef.adults,
        childrenCount: resDef.children,
        estimatedTotalUsd: resDef.total,
        status: resDef.status,
        operatorNote: resDef.operatorNote,
        decidedAt: resDef.decidedDaysAgo ? inDays(resDef.decidedDaysAgo) : null,
        completedAt: resDef.completedDaysAgo ? inDays(resDef.completedDaysAgo) : null,
      },
    });

    // Seed conversation messages for this reservation
    for (const msg of resDef.messages) {
      const senderId = msg.sender === 'traveler' ? resDef.travelerId : op.userId;
      const msgCreated = inDays(msg.daysAgo);
      await prisma.reservationMessage.create({
        data: {
          reservationId: res.id,
          senderId,
          body: msg.body,
          isRead: true,
          readAt: msgCreated,
          createdAt: msgCreated,
        },
      });
    }
    console.log(`  + Seeded Reservation ${res.reference} (${res.status}) with chat messages.`);
  }

  console.log('\n======================================================');
  console.log('🔍 RUNNING DATA INTEGRITY & VERIFICATION CHECKS');
  console.log('======================================================');

  // Check 1: Parks verification (39 parks)
  const parkDestinations = await prisma.destination.findMany({
    where: { type: { not: 'COUNTRY' } },
    include: { _count: { select: { tours: true } } },
    orderBy: { name: 'asc' },
  });

  const zeroTourParks = parkDestinations.filter((p) => p._count.tours === 0);
  console.log(`\n🏞️ Total Parks & Game Reserves: ${parkDestinations.length}`);
  console.log(`Parks with Active Tours: ${parkDestinations.length - zeroTourParks.length} / ${parkDestinations.length}`);
  if (zeroTourParks.length > 0) {
    console.error('❌ Parks with 0 tours:');
    zeroTourParks.forEach((p) => console.error(`  - ${p.slug} (${p.name}, ${p.country})`));
  } else {
    console.log('✅ ALL 39 PARKS HAVE ACTIVE BOOKABLE TOURS!');
  }

  // Check 2: Country verification (9 countries)
  const countryDestinations = await prisma.destination.findMany({
    where: { type: 'COUNTRY' },
    include: { _count: { select: { tours: true } } },
    orderBy: { name: 'asc' },
  });

  const zeroTourCountries = countryDestinations.filter((c) => c._count.tours === 0);
  console.log(`\n🌍 Total Country Destinations: ${countryDestinations.length}`);
  console.log(`Countries with Active Tours: ${countryDestinations.length - zeroTourCountries.length} / ${countryDestinations.length}`);
  if (zeroTourCountries.length > 0) {
    console.error('❌ Countries with 0 tours:');
    zeroTourCountries.forEach((c) => console.error(`  - ${c.slug} (${c.name})`));
  } else {
    console.log('✅ ALL 9 COUNTRIES HAVE ACTIVE BOOKABLE TOURS!');
  }

  // Check 3: Global Counts
  console.log('\n📊 PLATFORM TOTALS SUMMARY:');
  console.log(`- Destinations:  ${await prisma.destination.count()}`);
  console.log(`- Tours:         ${await prisma.tour.count()}`);
  console.log(`- Operators:     ${await prisma.operator.count()}`);
  console.log(`- Users:         ${await prisma.user.count()}`);
  console.log(`- Experts:       ${await prisma.expert.count()}`);
  console.log(`- Blog Posts:    ${await prisma.blogPost.count()}`);
  console.log(`- Reviews:       ${await prisma.review.count()}`);
  console.log(`- Inquiries:     ${await prisma.inquiry.count()}`);
  console.log(`- Inquiry Leads: ${await prisma.inquiryLead.count()}`);
  console.log(`- Reservations:  ${await prisma.reservation.count()}`);
  console.log(`- Tour Slots:    ${await prisma.tourSlot.count()}`);
  console.log('======================================================\n');
}

main()
  .catch((err) => {
    console.error('❌ Fatal error during seeding:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
