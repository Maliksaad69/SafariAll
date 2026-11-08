export const SAFARI_COUNTRIES = [
  'Botswana',
  'Ethiopia',
  'Kenya',
  'Madagascar',
  'Malawi',
  'Mozambique',
  'Namibia',
  'Rwanda',
  'South Africa',
  'Tanzania',
  'Uganda',
  'Zambia',
  'Zimbabwe',
] as const;

export type SafariCountry = typeof SAFARI_COUNTRIES[number];

export interface SafariCountryInfo {
  name: SafariCountry;
  slug: string;
  flag: string;
  dialCode: string;
  iso2: string;
}

export const SAFARI_COUNTRY_LIST: SafariCountryInfo[] = [
  { name: 'Botswana', slug: 'botswana', flag: '🇧🇼', dialCode: '+267', iso2: 'BW' },
  { name: 'Ethiopia', slug: 'ethiopia', flag: '🇪🇹', dialCode: '+251', iso2: 'ET' },
  { name: 'Kenya', slug: 'kenya', flag: '🇰🇪', dialCode: '+254', iso2: 'KE' },
  { name: 'Madagascar', slug: 'madagascar', flag: '🇲🇬', dialCode: '+261', iso2: 'MG' },
  { name: 'Malawi', slug: 'malawi', flag: '🇲🇼', dialCode: '+265', iso2: 'MW' },
  { name: 'Mozambique', slug: 'mozambique', flag: '🇲🇿', dialCode: '+258', iso2: 'MZ' },
  { name: 'Namibia', slug: 'namibia', flag: '🇳🇦', dialCode: '+264', iso2: 'NA' },
  { name: 'Rwanda', slug: 'rwanda', flag: '🇷🇼', dialCode: '+250', iso2: 'RW' },
  { name: 'South Africa', slug: 'south-africa', flag: '🇿🇦', dialCode: '+27', iso2: 'ZA' },
  { name: 'Tanzania', slug: 'tanzania', flag: '🇹🇿', dialCode: '+255', iso2: 'TZ' },
  { name: 'Uganda', slug: 'uganda', flag: '🇺🇬', dialCode: '+256', iso2: 'UG' },
  { name: 'Zambia', slug: 'zambia', flag: '🇿🇲', dialCode: '+260', iso2: 'ZM' },
  { name: 'Zimbabwe', slug: 'zimbabwe', flag: '🇿🇼', dialCode: '+263', iso2: 'ZW' },
];

export const COUNTRY_FLAGS: Record<string, string> = {
  Botswana: '🇧🇼',
  Ethiopia: '🇪🇹',
  Kenya: '🇰🇪',
  Madagascar: '🇲🇬',
  Malawi: '🇲🇼',
  Mozambique: '🇲🇿',
  Namibia: '🇳🇦',
  Rwanda: '🇷🇼',
  'South Africa': '🇿🇦',
  Tanzania: '🇹🇿',
  Uganda: '🇺🇬',
  Zambia: '🇿🇲',
  Zimbabwe: '🇿🇼',
};

export const COUNTRY_DIAL_CODES: Record<string, string> = {
  Botswana: '+267',
  Ethiopia: '+251',
  Kenya: '+254',
  Madagascar: '+261',
  Malawi: '+265',
  Mozambique: '+258',
  Namibia: '+264',
  Rwanda: '+250',
  'South Africa': '+27',
  Tanzania: '+255',
  Uganda: '+256',
  Zambia: '+260',
  Zimbabwe: '+263',
};

export interface CountrySeoData {
  country: SafariCountry;
  slug: string;
  flag: string;
  seoSlug: string;
  seoUrl: string;
  seoTitle: string;
  keywords: string[];
}

export const COUNTRY_SEO_DATA: Record<string, CountrySeoData> = {
  botswana: {
    country: 'Botswana',
    slug: 'botswana',
    flag: '🇧🇼',
    seoSlug: 'national-parks-and-game-reserves',
    seoUrl: '/parks/botswana/national-parks-and-game-reserves',
    seoTitle: 'Botswana National Parks & Game Reserves',
    keywords: ['Botswana national parks', 'Okavango Delta safaris', 'Chobe national park', 'Botswana game reserves', 'Kalahari wildlife'],
  },
  ethiopia: {
    country: 'Ethiopia',
    slug: 'ethiopia',
    flag: '🇪🇹',
    seoSlug: 'national-parks-and-game-reserves',
    seoUrl: '/parks/ethiopia/national-parks-and-game-reserves',
    seoTitle: 'Ethiopia National Parks & Wildlife Reserves',
    keywords: ['Ethiopia national parks', 'Ethiopia wildlife reserves', 'Simien mountains', 'Bale mountains', 'Ethiopian wolf trekking'],
  },
  kenya: {
    country: 'Kenya',
    slug: 'kenya',
    flag: '🇰🇪',
    seoSlug: 'national-parks-and-game-reserves',
    seoUrl: '/parks/kenya/national-parks-and-game-reserves',
    seoTitle: 'Kenya National Parks & Game Reserves',
    keywords: ['Kenya national parks', 'Masai Mara safaris', 'Amboseli national park', 'Kenya game reserves', 'Great Migration Kenya'],
  },
  madagascar: {
    country: 'Madagascar',
    slug: 'madagascar',
    flag: '🇲🇬',
    seoSlug: 'national-parks-and-game-reserves',
    seoUrl: '/parks/madagascar/national-parks-and-game-reserves',
    seoTitle: 'Madagascar National Parks & Nature Reserves',
    keywords: ['Madagascar national parks', 'Madagascar nature reserves', 'Andasibe-Mantadia', 'Madagascar lemurs', 'Isalo national park'],
  },
  malawi: {
    country: 'Malawi',
    slug: 'malawi',
    flag: '🇲🇼',
    seoSlug: 'national-parks-and-wildlife-reserves',
    seoUrl: '/parks/malawi/national-parks-and-wildlife-reserves',
    seoTitle: 'Malawi National Parks & Wildlife Reserves',
    keywords: ['Malawi national parks', 'Malawi wildlife reserves', 'Liwonde national park', 'Majete wildlife reserve', 'Lake Malawi safaris'],
  },
  mozambique: {
    country: 'Mozambique',
    slug: 'mozambique',
    flag: '🇲🇿',
    seoSlug: 'national-parks-and-game-reserves',
    seoUrl: '/parks/mozambique/national-parks-and-game-reserves',
    seoTitle: 'Mozambique National Parks & Wildlife Reserves',
    keywords: ['Mozambique national parks', 'Mozambique wildlife reserves', 'Gorongosa national park', 'Bazaruto archipelago', 'Mozambique safari'],
  },
  namibia: {
    country: 'Namibia',
    slug: 'namibia',
    flag: '🇳🇦',
    seoSlug: 'national-parks-and-game-reserves',
    seoUrl: '/parks/namibia/national-parks-and-game-reserves',
    seoTitle: 'Namibia National Parks & Game Reserves',
    keywords: ['Namibia national parks', 'Etosha national park', 'Sossusvlei dunes', 'Namibia game reserves', 'Skeleton Coast safaris'],
  },
  rwanda: {
    country: 'Rwanda',
    slug: 'rwanda',
    flag: '🇷🇼',
    seoSlug: 'national-parks',
    seoUrl: '/parks/rwanda/national-parks',
    seoTitle: 'Rwanda National Parks & Gorilla Trekking',
    keywords: ['Rwanda national parks', 'Volcanoes national park', 'Rwanda gorilla trekking', 'Akagera national park', 'Nyungwe forest'],
  },
  'south-africa': {
    country: 'South Africa',
    slug: 'south-africa',
    flag: '🇿🇦',
    seoSlug: 'national-parks-and-game-reserves',
    seoUrl: '/parks/south-africa/national-parks-and-game-reserves',
    seoTitle: 'South Africa National Parks & Game Reserves',
    keywords: ['South Africa national parks', 'Kruger national park', 'Sabi Sand game reserve', 'South Africa game reserves', 'Big 5 safari'],
  },
  tanzania: {
    country: 'Tanzania',
    slug: 'tanzania',
    flag: '🇹🇿',
    seoSlug: 'national-parks-and-game-reserves',
    seoUrl: '/parks/tanzania/national-parks-and-game-reserves',
    seoTitle: 'Tanzania National Parks & Game Reserves',
    keywords: ['Tanzania national parks', 'Serengeti national park', 'Ngorongoro crater', 'Tarangire', 'Tanzania game reserves'],
  },
  uganda: {
    country: 'Uganda',
    slug: 'uganda',
    flag: '🇺🇬',
    seoSlug: 'national-parks-and-wildlife-reserves',
    seoUrl: '/parks/uganda/national-parks-and-wildlife-reserves',
    seoTitle: 'Uganda National Parks & Wildlife Reserves',
    keywords: ['Uganda national parks', 'Uganda wildlife reserves', 'Bwindi impenetrable forest', 'Queen Elizabeth national park', 'Gorilla trekking Uganda'],
  },
  zambia: {
    country: 'Zambia',
    slug: 'zambia',
    flag: '🇿🇲',
    seoSlug: 'national-parks-and-game-reserves',
    seoUrl: '/parks/zambia/national-parks-and-game-reserves',
    seoTitle: 'Zambia National Parks & Game Reserves',
    keywords: ['Zambia national parks', 'South Luangwa walking safaris', 'Lower Zambezi national park', 'Victoria Falls safaris', 'Zambia game reserves'],
  },
  zimbabwe: {
    country: 'Zimbabwe',
    slug: 'zimbabwe',
    flag: '🇿🇼',
    seoSlug: 'national-parks-and-game-reserves',
    seoUrl: '/parks/zimbabwe/national-parks-and-game-reserves',
    seoTitle: 'Zimbabwe National Parks & Game Reserves',
    keywords: ['Zimbabwe national parks', 'Hwange national park', 'Mana Pools canoe safaris', 'Victoria Falls Zimbabwe', 'Zimbabwe game reserves'],
  },
};

export function getCountrySeoData(countryOrSlug: string): CountrySeoData | undefined {
  if (!countryOrSlug) return undefined;
  const normalized = countryOrSlug.trim().toLowerCase().replace(/\s+/g, '-');
  return COUNTRY_SEO_DATA[normalized] || Object.values(COUNTRY_SEO_DATA).find(
    (c) => c.country.toLowerCase() === countryOrSlug.trim().toLowerCase() || c.slug === normalized
  );
}

export function getCountrySeoUrl(countryOrSlug: string): string {
  const data = getCountrySeoData(countryOrSlug);
  if (data) return data.seoUrl;
  const slug = countryOrSlug.trim().toLowerCase().replace(/\s+/g, '-');
  return `/parks/${slug}`;
}

export function getCountrySeoTitle(countryOrSlug: string): string {
  const data = getCountrySeoData(countryOrSlug);
  if (data) return data.seoTitle;
  return `${countryOrSlug} National Parks & Game Reserves`;
}

export interface CuratedCountryData {
  id: string;
  name: string;
  slug: string;
  country: string;
  type: string;
  description: string;
  featuredImageUrl: string;
  bestTimeSummary: string;
  dailyRates: string;
  highSeason: string;
  popularityRank: number;
  rating: number;
  reviewCount: number;
  parks: { name: string; slug: string }[];
  toursCount: number;
}

export const CURATED_COUNTRIES_DATA: CuratedCountryData[] = [
  {
    id: 'dest-botswana',
    name: 'Botswana',
    slug: 'botswana',
    country: 'Botswana',
    type: 'COUNTRY',
    description: 'In and around the pristine Okavango Delta, which can be discovered on a mokoro trip or game drive. Chobe National Park, Moremi Game Reserve, and the Central Kalahari combine stunning waterways with exceptional predator encounters.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    bestTimeSummary: 'May to October (Okavango, Moremi, Chobe)',
    dailyRates: '$250 to $850 per day',
    highSeason: 'July to October (Chobe gets busy)',
    popularityRank: 1,
    rating: 4.9,
    reviewCount: 372,
    parks: [
      { name: 'Okavango Delta', slug: 'okavango-delta' },
      { name: 'Chobe National Park', slug: 'chobe-national-park' },
      { name: 'Moremi Game Reserve', slug: 'moremi-game-reserve' },
      { name: 'Central Kalahari', slug: 'central-kalahari-game-reserve' },
    ],
    toursCount: 18,
  },
  {
    id: 'dest-ethiopia',
    name: 'Ethiopia',
    slug: 'ethiopia',
    country: 'Ethiopia',
    type: 'COUNTRY',
    description: 'Dramatic highland landscapes in the Simien and Bale Mountains, home to rare endemic wildlife including the Ethiopian wolf, gelada baboons, and walia ibex, alongside ancient African heritage.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
    bestTimeSummary: 'October to March (Dry, clear weather in the Simien and Bale mountains)',
    dailyRates: '$180 to $520 per day',
    highSeason: 'October to January',
    popularityRank: 2,
    rating: 4.8,
    reviewCount: 145,
    parks: [
      { name: 'Simien Mountains NP', slug: 'simien-mountains-national-park' },
      { name: 'Bale Mountains NP', slug: 'bale-mountains-national-park' },
    ],
    toursCount: 12,
  },
  {
    id: 'dest-kenya',
    name: 'Kenya',
    slug: 'kenya',
    country: 'Kenya',
    type: 'COUNTRY',
    description: 'World-renowned for the Great Migration in the Masai Mara, colossal elephant herds beneath Mount Kilimanjaro in Amboseli, and classic East African savannah game drives.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
    bestTimeSummary: 'July to October (Great Migration in Masai Mara), January to February',
    dailyRates: '$200 to $750 per day',
    highSeason: 'July to October',
    popularityRank: 3,
    rating: 4.9,
    reviewCount: 528,
    parks: [
      { name: 'Masai Mara', slug: 'masai-mara-national-reserve' },
      { name: 'Amboseli National Park', slug: 'amboseli-national-park' },
      { name: 'Lake Nakuru NP', slug: 'lake-nakuru-national-park' },
      { name: 'Tsavo National Park', slug: 'tsavo-national-park' },
    ],
    toursCount: 34,
  },
  {
    id: 'dest-madagascar',
    name: 'Madagascar',
    slug: 'madagascar',
    country: 'Madagascar',
    type: 'COUNTRY',
    description: 'An evolutionarily isolated paradise boasting over 100 species of lemurs, bizarre baobab forests, vivid chameleons, and pristine Indian Ocean coral reefs.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80',
    bestTimeSummary: 'April to November (Dry season with pleasant temperatures)',
    dailyRates: '$160 to $480 per day',
    highSeason: 'July to August, October to November',
    popularityRank: 4,
    rating: 4.8,
    reviewCount: 112,
    parks: [
      { name: 'Andasibe-Mantadia', slug: 'andasibe-mantadia-national-park' },
      { name: 'Avenue of the Baobabs', slug: 'avenue-of-the-baobabs' },
      { name: 'Isalo National Park', slug: 'isalo-national-park' },
    ],
    toursCount: 10,
  },
  {
    id: 'dest-malawi',
    name: 'Malawi',
    slug: 'malawi',
    country: 'Malawi',
    type: 'COUNTRY',
    description: 'Known as the Warm Heart of Africa, pairing the freshwater marine marvels of Lake Malawi with remarkable Big Five wildlife conservation successes in Majete and Liwonde.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1200&q=80',
    bestTimeSummary: 'May to October (Dry season for game viewing in Liwonde & Majete)',
    dailyRates: '$150 to $450 per day',
    highSeason: 'June to September',
    popularityRank: 5,
    rating: 4.7,
    reviewCount: 96,
    parks: [
      { name: 'Liwonde National Park', slug: 'liwonde-national-park' },
      { name: 'Majete Wildlife Reserve', slug: 'majete-wildlife-reserve' },
      { name: 'Lake Malawi NP', slug: 'lake-malawi-national-park' },
    ],
    toursCount: 8,
  },
  {
    id: 'dest-mozambique',
    name: 'Mozambique',
    slug: 'mozambique',
    country: 'Mozambique',
    type: 'COUNTRY',
    description: 'Combines the miraculous wilderness recovery of Gorongosa National Park with world-class marine safaris around the turquoise waters of the Bazaruto Archipelago.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    bestTimeSummary: 'May to November (Dry winter season and prime marine life sightings)',
    dailyRates: '$220 to $680 per day',
    highSeason: 'July to October',
    popularityRank: 6,
    rating: 4.8,
    reviewCount: 88,
    parks: [
      { name: 'Gorongosa National Park', slug: 'gorongosa-national-park' },
      { name: 'Bazaruto Archipelago', slug: 'bazaruto-archipelago' },
    ],
    toursCount: 9,
  },
  {
    id: 'dest-namibia',
    name: 'Namibia',
    slug: 'namibia',
    country: 'Namibia',
    type: 'COUNTRY',
    description: 'Surreal desert sceneries with the soaring red dunes of Sossusvlei, desert-adapted elephants in Damaraland, and teeming wildlife concentrations around Etosha salt pan waterholes.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80',
    bestTimeSummary: 'May to October (Dry winter season; wildlife gathers at Etosha waterholes)',
    dailyRates: '$190 to $650 per day',
    highSeason: 'July to October',
    popularityRank: 7,
    rating: 4.9,
    reviewCount: 310,
    parks: [
      { name: 'Etosha National Park', slug: 'etosha-national-park' },
      { name: 'Sossusvlei & Namib-Naukluft', slug: 'namib-naukluft-national-park' },
      { name: 'Skeleton Coast', slug: 'skeleton-coast' },
    ],
    toursCount: 22,
  },
  {
    id: 'dest-rwanda',
    name: 'Rwanda',
    slug: 'rwanda',
    country: 'Rwanda',
    type: 'COUNTRY',
    description: 'The Land of a Thousand Hills, offering bucket-list mountain gorilla encounters in Volcanoes National Park, chimpanzee tracking in Nyungwe, and Big Five viewing in Akagera.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1551776235-dde6d482980b?auto=format&fit=crop&w=1200&q=80',
    bestTimeSummary: 'June to September & December to February (Drier forest trails)',
    dailyRates: '$350 to $1,200 per day',
    highSeason: 'June to September',
    popularityRank: 8,
    rating: 4.95,
    reviewCount: 284,
    parks: [
      { name: 'Volcanoes National Park', slug: 'volcanoes-national-park' },
      { name: 'Akagera National Park', slug: 'akagera-national-park' },
      { name: 'Nyungwe Forest', slug: 'nyungwe-forest-national-park' },
    ],
    toursCount: 16,
  },
  {
    id: 'dest-south-africa',
    name: 'South Africa',
    slug: 'south-africa',
    country: 'South Africa',
    type: 'COUNTRY',
    description: 'Incomparable Big Five game viewing in Greater Kruger and Sabi Sand private reserves, seamlessly paired with scenic Winelands, the Garden Route, and vibrant Cape Town.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?auto=format&fit=crop&w=1200&q=80',
    bestTimeSummary: 'May to September (Dry winter season for Kruger and Sabi Sand)',
    dailyRates: '$180 to $750 per day',
    highSeason: 'July to November (Kruger), December to March (Cape Town)',
    popularityRank: 9,
    rating: 4.85,
    reviewCount: 640,
    parks: [
      { name: 'Kruger National Park', slug: 'kruger-national-park' },
      { name: 'Sabi Sand Game Reserve', slug: 'sabi-sand-reserve' },
      { name: 'Madikwe Game Reserve', slug: 'madikwe-game-reserve' },
    ],
    toursCount: 28,
  },
  {
    id: 'dest-tanzania',
    name: 'Tanzania',
    slug: 'tanzania',
    country: 'Tanzania',
    type: 'COUNTRY',
    description: 'The jewel of African safaris, home to the endless Serengeti plains, the dramatic Ngorongoro Crater, the elephant-rich baobabs of Tarangire, and the tropical beaches of Zanzibar.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    bestTimeSummary: 'June to October (Dry season, Great Migration Mara crossings), January to March (Calving in Southern Serengeti)',
    dailyRates: '$220 to $850 per day',
    highSeason: 'July to October & late December to February',
    popularityRank: 10,
    rating: 4.95,
    reviewCount: 890,
    parks: [
      { name: 'Serengeti National Park', slug: 'serengeti-national-park' },
      { name: 'Ngorongoro Crater', slug: 'ngorongoro-crater' },
      { name: 'Tarangire National Park', slug: 'tarangire-national-park' },
      { name: 'Lake Manyara', slug: 'lake-manyara-national-park' },
    ],
    toursCount: 42,
  },
  {
    id: 'dest-uganda',
    name: 'Uganda',
    slug: 'uganda',
    country: 'Uganda',
    type: 'COUNTRY',
    description: 'The Pearl of Africa, harboring over half of the worlds mountain gorillas in Bwindi, tree-climbing lions in Queen Elizabeth NP, and spectacular boat safaris on the Kazinga Channel.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1551776235-dde6d482980b?auto=format&fit=crop&w=1200&q=80',
    bestTimeSummary: 'June to August & December to February (Best conditions for gorilla trekking)',
    dailyRates: '$200 to $650 per day',
    highSeason: 'June to September & December to February',
    popularityRank: 11,
    rating: 4.9,
    reviewCount: 340,
    parks: [
      { name: 'Bwindi Impenetrable NP', slug: 'bwindi-impenetrable-national-park' },
      { name: 'Queen Elizabeth NP', slug: 'queen-elizabeth-national-park' },
      { name: 'Murchison Falls', slug: 'murchison-falls-national-park' },
      { name: 'Kibale Forest', slug: 'kibale-forest-national-park' },
    ],
    toursCount: 20,
  },
  {
    id: 'dest-zambia',
    name: 'Zambia',
    slug: 'zambia',
    country: 'Zambia',
    type: 'COUNTRY',
    description: 'The birthplace of the walking safari, where remote wilderness, walking expeditions in South Luangwa, canoe safaris along the Lower Zambezi, and the mighty Victoria Falls combine.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80',
    bestTimeSummary: 'May to October (Dry winter season with exceptional game viewing in South Luangwa)',
    dailyRates: '$240 to $780 per day',
    highSeason: 'July to October',
    popularityRank: 12,
    rating: 4.85,
    reviewCount: 220,
    parks: [
      { name: 'South Luangwa NP', slug: 'south-luangwa-national-park' },
      { name: 'Lower Zambezi NP', slug: 'lower-zambezi-national-park' },
      { name: 'Victoria Falls', slug: 'victoria-falls' },
      { name: 'Kafue National Park', slug: 'kafue-national-park' },
    ],
    toursCount: 15,
  },
  {
    id: 'dest-zimbabwe',
    name: 'Zimbabwe',
    slug: 'zimbabwe',
    country: 'Zimbabwe',
    type: 'COUNTRY',
    description: 'Renowned for having the highest professional guiding standards in Africa, giant elephant herds in Hwange National Park, canoe expeditions in Mana Pools, and the thunder of Victoria Falls.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
    bestTimeSummary: 'May to October (Dry season; massive elephant concentrations in Hwange)',
    dailyRates: '$210 to $720 per day',
    highSeason: 'July to October',
    popularityRank: 13,
    rating: 4.85,
    reviewCount: 245,
    parks: [
      { name: 'Hwange National Park', slug: 'hwange-national-park' },
      { name: 'Mana Pools National Park', slug: 'mana-pools-national-park' },
      { name: 'Victoria Falls', slug: 'victoria-falls' },
      { name: 'Matobo Hills', slug: 'matobo-national-park' },
    ],
    toursCount: 17,
  },
];
