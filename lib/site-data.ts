export type TourComfortLevel = 'CAMPING' | 'BUDGET' | 'MID_RANGE' | 'LUXURY' | 'SUPER_LUXURY';
export type TourTypeValue = 'PRIVATE' | 'SHARED_GROUP' | 'FLY_IN' | 'SELF_DRIVE';

export interface SiteTour {
  id: string;
  title: string;
  slug: string;
  durationDays: number;
  durationNights: number;
  minPriceUsd: number;
  comfortLevel: TourComfortLevel;
  tourType: TourTypeValue;
  primaryCountry: string;
  startLocation?: string;
  inclusions: string[];
  operator: {
    companyName: string;
    slug: string;
    isVerified: boolean;
    averageRating: number;
    totalReviews: number;
  };
  destinations: {
    destination: {
      name: string;
    };
  }[];
}

export interface SiteOperator {
  id: string;
  companyName: string;
  slug: string;
  averageRating: number;
  totalReviews: number;
  officesIn: string[];
  priceRange: string;
  tourTypes: string;
  destinations: string[];
  isVerified: boolean;
  image: string;
  logo: string;
  toursCount: number;
  topTours: { name: string; price: string }[];
}

export const safariTours: SiteTour[] = [
  {
    id: 'tza-great-migration-8',
    title: '8-Day Mid-Range Great Migration Safari (July–October)',
    slug: '8-day-mid-range-great-migration-safari',
    durationDays: 8,
    durationNights: 7,
    minPriceUsd: 2859,
    comfortLevel: 'MID_RANGE',
    tourType: 'PRIVATE',
    primaryCountry: 'Tanzania',
    startLocation: 'Arusha',
    inclusions: ['Lodge & Tented Camp', 'Private tour', 'Mid-range'],
    operator: {
      companyName: 'Josh Dreamland Safari',
      slug: 'josh-dreamland-safari',
      isVerified: true,
      averageRating: 4.9,
      totalReviews: 112,
    },
    destinations: [
      { destination: { name: 'Arusha (Start)' } },
      { destination: { name: 'Lake Manyara NP' } },
      { destination: { name: 'Serengeti NP' } },
      { destination: { name: 'Ngorongoro Crater' } },
    ],
  },
  {
    id: 'tza-budget-beach-9',
    title: '9-Day Tanzania Budget Safari with Beach Holiday',
    slug: '9-day-tanzania-budget-safari-with-beach-holiday',
    durationDays: 9,
    durationNights: 8,
    minPriceUsd: 1432,
    comfortLevel: 'BUDGET',
    tourType: 'SHARED_GROUP',
    primaryCountry: 'Tanzania',
    startLocation: 'Arusha',
    inclusions: ['Camping & Hotel', 'Shared tour', 'Budget'],
    operator: {
      companyName: 'Go Serengeti African Tours',
      slug: 'go-serengeti-african-tours',
      isVerified: true,
      averageRating: 4.9,
      totalReviews: 662,
    },
    destinations: [
      { destination: { name: 'Arusha (Start)' } },
      { destination: { name: 'South Serengeti NP' } },
      { destination: { name: 'Tarangire NP' } },
      { destination: { name: 'Zanzibar Beach' } },
    ],
  },
  {
    id: 'tza-big-5-10',
    title: '10-Day Chasing the Big 5 Tented Safari',
    slug: '10-day-chasing-the-big-5-tented-safari',
    durationDays: 10,
    durationNights: 9,
    minPriceUsd: 2744,
    comfortLevel: 'MID_RANGE',
    tourType: 'PRIVATE',
    primaryCountry: 'Tanzania',
    startLocation: 'Arusha',
    inclusions: ['Lodge & Tented Camp', 'Private tour', 'Mid-range'],
    operator: {
      companyName: 'Shemeji Safari',
      slug: 'shemeji-safari',
      isVerified: true,
      averageRating: 4.9,
      totalReviews: 307,
    },
    destinations: [
      { destination: { name: 'Arusha (Start)' } },
      { destination: { name: 'Tarangire NP' } },
      { destination: { name: 'Serengeti NP' } },
      { destination: { name: 'Ngorongoro Crater' } },
    ],
  },
  {
    id: 'ken-masai-mara-7',
    title: '7 Day Living Among the Elephants Group Safari',
    slug: '7-day-living-among-the-elephants-group-safari',
    durationDays: 7,
    durationNights: 6,
    minPriceUsd: 790,
    comfortLevel: 'BUDGET',
    tourType: 'SHARED_GROUP',
    primaryCountry: 'Kenya',
    startLocation: 'Nairobi',
    inclusions: ['Tented Camp & Hotel', 'Shared tour (max 8 people)', 'Budget'],
    operator: {
      companyName: 'Sunstrip Africa Safaris',
      slug: 'sunstrip-africa-safaris',
      isVerified: true,
      averageRating: 4.8,
      totalReviews: 49,
    },
    destinations: [
      { destination: { name: 'Nairobi (Start)' } },
      { destination: { name: 'Masai Mara NR' } },
      { destination: { name: 'Amboseli NP' } },
    ],
  },
  {
    id: 'bwa-okavango-9',
    title: '9-Day Botswana Okavango & Kalahari Adventure',
    slug: '9-day-botswana-okavango-and-kalahari-adventure',
    durationDays: 9,
    durationNights: 8,
    minPriceUsd: 3360,
    comfortLevel: 'MID_RANGE',
    tourType: 'PRIVATE',
    primaryCountry: 'Botswana',
    startLocation: 'Maun',
    inclusions: ['Luxury tented camp', 'Private guide', 'Mid-range'],
    operator: {
      companyName: 'Pula Adventures',
      slug: 'pula-adventures',
      isVerified: true,
      averageRating: 4.9,
      totalReviews: 231,
    },
    destinations: [
      { destination: { name: 'Maun (Start)' } },
      { destination: { name: 'Okavango Delta' } },
      { destination: { name: 'Chobe NP' } },
      { destination: { name: 'Kalahari Desert' } },
    ],
  },
  {
    id: 'uga-gorilla-8',
    title: '8-Day Uganda Gorilla & Wildlife Safari',
    slug: '8-day-uganda-gorilla-and-wildlife-safari',
    durationDays: 8,
    durationNights: 7,
    minPriceUsd: 3190,
    comfortLevel: 'MID_RANGE',
    tourType: 'PRIVATE',
    primaryCountry: 'Uganda',
    startLocation: 'Entebbe',
    inclusions: ['Lodge & River Camp', 'Private tour', 'Mid-range'],
    operator: {
      companyName: 'Mubala Wildlife Safaris',
      slug: 'mubala-wildlife-safaris',
      isVerified: true,
      averageRating: 4.8,
      totalReviews: 204,
    },
    destinations: [
      { destination: { name: 'Entebbe (Start)' } },
      { destination: { name: 'Bwindi Impenetrable NP' } },
      { destination: { name: 'Queen Elizabeth NP' } },
      { destination: { name: 'Murchison Falls NP' } },
    ],
  },
];

export const safariOperators: SiteOperator[] = [
  {
    id: 'op-majestic-wins',
    companyName: 'Majestic Wins Adventures',
    slug: 'majestic-wins-adventures',
    averageRating: 5.0,
    totalReviews: 16,
    officesIn: ['Tanzania'],
    priceRange: '$250 to $1,500',
    tourTypes: 'Custom mid-range & luxury tours that can start every day',
    destinations: ['Tanzania', 'Kenya', 'Rwanda', 'Uganda'],
    isVerified: true,
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=400&q=80',
    logo: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=100&q=80',
    toursCount: 30,
    topTours: [
      { name: '7-Day Karibu Safari', price: '$5,892 pp' },
      { name: '4-Day Tanzania Express Safari Medium', price: '$1,849 pp' },
      { name: '2-Day Safari to Tarangire and Ngorongoro', price: '$903 pp' },
    ],
  },
  {
    id: 'op-shadows-of-africa',
    companyName: 'Shadows of Africa',
    slug: 'shadows-of-africa',
    averageRating: 4.8,
    totalReviews: 168,
    officesIn: ['Tanzania', 'Kenya', 'Rwanda', 'South Africa', 'United States'],
    priceRange: '$250 to $1,500',
    tourTypes: 'Custom safari itineraries for couples, families and private groups',
    destinations: ['Kenya', 'Rwanda', 'South Africa', 'Tanzania', 'Uganda'],
    isVerified: true,
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80',
    logo: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=100&q=80',
    toursCount: 30,
    topTours: [
      { name: '7-Day Karibu Safari', price: '$5,892 pp' },
      { name: '4-Day Tanzania Express Safari Medium', price: '$1,849 pp' },
      { name: '2-Day Safari to Tarangire and Ngorongoro', price: '$903 pp' },
    ],
  },
  {
    id: 'op-activentures',
    companyName: 'Activentures Africa Safaris',
    slug: 'activentures-africa-safaris',
    averageRating: 5.0,
    totalReviews: 6,
    officesIn: ['Uganda', 'United States'],
    priceRange: '$190 to $1,150',
    tourTypes: 'Luxury gorilla trekking, wildlife and conservation-led tours',
    destinations: ['Kenya', 'Rwanda', 'Tanzania', 'Uganda'],
    isVerified: true,
    image: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=400&q=80',
    logo: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=100&q=80',
    toursCount: 13,
    topTours: [
      { name: '4-Day Fly-in Luxury Bwindi Gorilla Trekking Safari', price: '$2,043 pp' },
      { name: '3-Day Midrange Wildlife Game Safari Murchison Falls NP', price: '$960 pp' },
      { name: '5-Day Mid-Range Chimpanzee & Gorilla Safari Uganda', price: '$2,104 pp' },
    ],
  },
  {
    id: 'op-josh-dreamland',
    companyName: 'Josh Dreamland Safari',
    slug: 'josh-dreamland-safari',
    averageRating: 4.9,
    totalReviews: 112,
    officesIn: ['Tanzania'],
    priceRange: '$310 to $1,950',
    tourTypes: 'Tailor-made safari experiences in the Serengeti and northern circuit',
    destinations: ['Tanzania', 'Kenya'],
    isVerified: true,
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=400&q=80',
    logo: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=100&q=80',
    toursCount: 24,
    topTours: [
      { name: '8-Day Great Migration Safari', price: '$3,890 pp' },
      { name: '6-Day Northern Tanzania Explorer', price: '$2,680 pp' },
      { name: '3-Day Tarangire & Ngorongoro Escape', price: '$1,260 pp' },
    ],
  },
  {
    id: 'op-serengeti-sunrise',
    companyName: 'Serengeti Sunrise Safaris',
    slug: 'serengeti-sunrise-safaris',
    averageRating: 4.8,
    totalReviews: 98,
    officesIn: ['Tanzania', 'United States'],
    priceRange: '$300 to $1,700',
    tourTypes: 'Family road safaris and premium small-group departures',
    destinations: ['Tanzania', 'Zambia'],
    isVerified: true,
    image: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=400&q=80',
    logo: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=100&q=80',
    toursCount: 19,
    topTours: [
      { name: '7-Day Big Five Circuit', price: '$4,210 pp' },
      { name: '4-Day Family Safari', price: '$1,760 pp' },
      { name: '5-Day Southern Tanzania Wilderness', price: '$2,380 pp' },
    ],
  },
];

export const countryHighlights = [
  { name: 'Tanzania', rank: '#1', active: true },
  { name: 'Botswana', rank: '#2', active: false },
  { name: 'Kenya', rank: '#3', active: false },
  { name: 'Zambia', rank: '#4', active: false },
  { name: 'South Africa', rank: '#5', active: false },
  { name: 'Namibia', rank: '#6', active: false },
  { name: 'Uganda', rank: '#7', active: false },
  { name: 'Zimbabwe', rank: '#8', active: false },
];

export const blogPosts = [
  {
    title: 'Tanzania Safari Itinerary - How To Spend 7 to 10 Days',
    slug: 'tanzania-safari-itinerary-7-to-10-days',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Guide to Visiting Ngorongoro Crater – All You Need To Know',
    slug: 'guide-to-visiting-ngorongoro-crater',
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Survey Reveals the World\'s Politest Tourists',
    slug: 'survey-reveals-the-worlds-polite-tourists',
    image: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80',
  },
];

export function getToursByCountry(country?: string) {
  if (!country) return safariTours;
  return safariTours.filter(
    (tour) => tour.primaryCountry.toLowerCase() === country.toLowerCase()
  );
}

export function getOperatorsByCountry(country?: string) {
  if (!country) return safariOperators;
  return safariOperators.filter(
    (operator) =>
      operator.officesIn.some((office) => office.toLowerCase() === country.toLowerCase()) ||
      operator.destinations.some((destination) => destination.toLowerCase() === country.toLowerCase())
  );
}

export const safariExperts = [
  {
    id: 'expert-1',
    name: 'Stephen Bailey',
    country: 'United Kingdom',
    reviewCount: 318,
    biography: 'Stephen is a travel writer and Africa expert who has spent the last decade exploring the continent, particularly focusing on East and Southern Africa.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'expert-2',
    name: 'Harriet Akinyi',
    country: 'Kenya',
    reviewCount: 245,
    biography: 'Born and raised in Nairobi, Harriet has an intimate knowledge of Kenya and Tanzania\'s parks, and specializes in custom family safaris.',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'expert-3',
    name: 'James Visser',
    country: 'South Africa',
    reviewCount: 189,
    biography: 'A former game ranger, James now uses his expertise to design specialized photographic safaris across Botswana and South Africa.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
  }
];
