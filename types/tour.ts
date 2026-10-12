export interface Tour {
  id: string;
  title: string;
  slug: string;
  primaryCountry: string;
  minPriceUsd: number;
  maxPriceUsd?: number | null;
  comfortLevel: string;
  tourType: string;
  durationDays: number;
  durationNights?: number | null;
  startLocation?: string | null;
  endLocation?: string | null;
  inclusions?: string[];
  exclusions?: string[];
  isPublished?: boolean;
  itineraries?: TourDay[];
  operatorId?: string;
  operatorName?: string | null;
  operatorSlug?: string | null;
  operatorLogo?: string | null;
  operatorRating?: number;
  operatorReviews?: number;
  operatorIsVerified?: boolean;
  destinations?: TourDestination[];
  _count?: { reservations?: number };
}

export interface TourDay {
  dayNumber: number;
  title: string;
  description?: string | null;
  accommodationName?: string | null;
  mealsIncluded?: string | null;
}

export interface TourDestination {
  destination: {
    name: string;
    slug?: string;
  };
}
