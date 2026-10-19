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
  /** Upcoming scheduled departures: how many are still bookable, and the next open one */
  departures?: { total: number; open: number; nextOpen: string | null; seatsLeft: number };
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

// All catalog data (tours, operators, countries, experts, blog posts) lives in
// Postgres; see lib/catalog.ts for the queries that produce these shapes.
