export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'SafariAsili',
    description: 'African safari marketplace connecting travelers with verified local operators.',
    url: 'https://safariasili.com',
    logo: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
    areaServed: ['Tanzania', 'Kenya', 'Botswana', 'Uganda', 'South Africa', 'Namibia', 'Zimbabwe', 'Zambia'],
    sameAs: [
      'https://www.facebook.com',
      'https://www.instagram.com',
      'https://www.linkedin.com',
    ],
  };
}

export function buildTourSchema(tour: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour?.title || 'Safari Tour',
    description: tour?.description || 'Custom safari experience designed by a verified African tour operator.',
    url: `https://safariasili.com/tours/${tour?.slug || ''}`,
    provider: {
      '@type': 'Organization',
      name: tour?.operator?.companyName || 'SafariAsili',
    },
    itinerary: {
      '@type': 'ItemList',
      itemListElement: (tour?.itineraries ?? []).map((day: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: day?.title || `Day ${day?.dayNumber || index + 1}`,
        description: day?.description || '',
      })),
    },
    offers: {
      '@type': 'Offer',
      price: tour?.minPriceUsd ?? 0,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  };
}

export function buildOperatorSchema(operator: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: operator?.companyName || 'Safari Operator',
    description: operator?.overviewText || 'Verified African safari operator.',
    url: `https://safariasili.com/operators/${operator?.slug || ''}`,
    address: {
      '@type': 'PostalAddress',
      addressCountry: operator?.countryOfOrigin || 'Tanzania',
      streetAddress: operator?.headquartersAddress || '',
    },
    aggregateRating: operator?.averageRating
      ? {
          '@type': 'AggregateRating',
          ratingValue: operator.averageRating,
          reviewCount: operator.totalReviews || 0,
        }
      : undefined,
  };
}
