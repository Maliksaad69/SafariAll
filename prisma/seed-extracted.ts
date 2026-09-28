import { PrismaClient, Role, ComfortLevel, TourType, DestinationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const extractedDestinations = [
  {
    name: 'Serengeti National Park',
    slug: 'serengeti-national-park',
    country: 'Tanzania',
    type: DestinationType.NATIONAL_PARK,
    description:
      'World-famous for the Great Migration and vast savannah plains, with high densities of lions, elephants, cheetahs and wildebeest.',
    latitude: -2.3333,
    longitude: 34.8333,
    bestTimeToVisit: { jan: 'EXCELLENT', feb: 'EXCELLENT', mar: 'GOOD', apr: 'FAIR', may: 'GOOD', jun: 'EXCELLENT', jul: 'EXCELLENT', aug: 'EXCELLENT', sep: 'EXCELLENT', oct: 'EXCELLENT', nov: 'GOOD', dec: 'EXCELLENT' },
    wildlifePresent: ['Lion', 'Leopard', 'Elephant', 'Rhino', 'Buffalo', 'Cheetah', 'Wildebeest']
  },
  {
    name: 'Masai Mara National Reserve',
    slug: 'masai-mara-national-reserve',
    country: 'Kenya',
    type: DestinationType.NATIONAL_PARK,
    description:
      'Iconic Kenyan reserve famous for dramatic river crossings during the Great Migration and excellent predator viewing.',
    latitude: -1.4833,
    longitude: 35.1433,
    bestTimeToVisit: { jan: 'GOOD', feb: 'GOOD', mar: 'GOOD', apr: 'FAIR', may: 'FAIR', jun: 'GOOD', jul: 'EXCELLENT', aug: 'EXCELLENT', sep: 'EXCELLENT', oct: 'EXCELLENT', nov: 'GOOD', dec: 'GOOD' },
    wildlifePresent: ['Lion', 'Leopard', 'Elephant', 'Rhino', 'Buffalo', 'Giraffe', 'Cheetah']
  },
  {
    name: 'Ngorongoro Crater',
    slug: 'ngorongoro-crater',
    country: 'Tanzania',
    type: DestinationType.GAME_RESERVE,
    description:
      'A massive volcanic caldera with a dense concentration of wildlife and one of the best places in East Africa to spot the Big Five.',
    latitude: -3.2081,
    longitude: 35.5397,
    bestTimeToVisit: { jan: 'EXCELLENT', feb: 'EXCELLENT', mar: 'EXCELLENT', apr: 'GOOD', may: 'GOOD', jun: 'EXCELLENT', jul: 'EXCELLENT', aug: 'EXCELLENT', sep: 'EXCELLENT', oct: 'EXCELLENT', nov: 'GOOD', dec: 'EXCELLENT' },
    wildlifePresent: ['Black Rhino', 'Lion', 'Elephant', 'Hippo', 'Flamingo', 'Hyena']
  },
  {
    name: 'Tarangire National Park',
    slug: 'tarangire-national-park',
    country: 'Tanzania',
    type: DestinationType.NATIONAL_PARK,
    description:
      'Celebrated for large elephant herds, dramatic baobab trees and excellent dry-season game viewing.',
    latitude: -4.0,
    longitude: 36.2,
    bestTimeToVisit: { jan: 'GOOD', feb: 'GOOD', mar: 'GOOD', apr: 'FAIR', may: 'FAIR', jun: 'EXCELLENT', jul: 'EXCELLENT', aug: 'EXCELLENT', sep: 'EXCELLENT', oct: 'EXCELLENT', nov: 'GOOD', dec: 'GOOD' },
    wildlifePresent: ['Elephant', 'Lion', 'Giraffe', 'Impala', 'Buffalo']
  },
  {
    name: 'Amboseli National Park',
    slug: 'amboseli-national-park',
    country: 'Kenya',
    type: DestinationType.NATIONAL_PARK,
    description:
      'Famous for huge elephant herds and unforgettable views of Mount Kilimanjaro from the Kenyan plains.',
    latitude: -2.642,
    longitude: 37.255,
    bestTimeToVisit: { jan: 'GOOD', feb: 'GOOD', mar: 'GOOD', apr: 'GOOD', may: 'FAIR', jun: 'EXCELLENT', jul: 'EXCELLENT', aug: 'EXCELLENT', sep: 'EXCELLENT', oct: 'EXCELLENT', nov: 'GOOD', dec: 'GOOD' },
    wildlifePresent: ['Elephant', 'Lion', 'Buffalo', 'Giraffe', 'Cheetah']
  },
  {
    name: 'Kruger National Park',
    slug: 'kruger-national-park',
    country: 'South Africa',
    type: DestinationType.NATIONAL_PARK,
    description:
      'The flagship South African reserve with Big Five sightings, extensive road networks and a well-developed safari circuit.',
    latitude: -23.9884,
    longitude: 31.5547,
    bestTimeToVisit: { jan: 'GOOD', feb: 'GOOD', mar: 'GOOD', apr: 'FAIR', may: 'FAIR', jun: 'EXCELLENT', jul: 'EXCELLENT', aug: 'EXCELLENT', sep: 'EXCELLENT', oct: 'EXCELLENT', nov: 'GOOD', dec: 'GOOD' },
    wildlifePresent: ['Lion', 'Leopard', 'Elephant', 'Rhino', 'Buffalo']
  },
  {
    name: 'Hwange National Park',
    slug: 'hwange-national-park',
    country: 'Zimbabwe',
    type: DestinationType.NATIONAL_PARK,
    description:
      'A remote wildlife haven known for large elephant populations and dramatic dry-season gatherings at waterholes.',
    latitude: -19.0,
    longitude: 26.5,
    bestTimeToVisit: { jan: 'GOOD', feb: 'GOOD', mar: 'GOOD', apr: 'FAIR', may: 'FAIR', jun: 'EXCELLENT', jul: 'EXCELLENT', aug: 'EXCELLENT', sep: 'EXCELLENT', oct: 'EXCELLENT', nov: 'GOOD', dec: 'GOOD' },
    wildlifePresent: ['Elephant', 'Lion', 'Buffalo', 'Wild Dog', 'Giraffe']
  },
  {
    name: 'Okavango Delta',
    slug: 'okavango-delta',
    country: 'Botswana',
    type: DestinationType.COUNTRY,
    description:
      'An iconic inland delta with water-based safari experiences, mokoro excursions, and rich biodiversity.',
    latitude: -19.8,
    longitude: 22.9,
    bestTimeToVisit: { jan: 'EXCELLENT', feb: 'EXCELLENT', mar: 'GOOD', apr: 'GOOD', may: 'FAIR', jun: 'GOOD', jul: 'GOOD', aug: 'GOOD', sep: 'GOOD', oct: 'EXCELLENT', nov: 'EXCELLENT', dec: 'EXCELLENT' },
    wildlifePresent: ['Elephant', 'Lion', 'Buffalo', 'Leopard', 'Hippo', 'Crocodile']
  },
  {
    name: 'Bwindi Impenetrable National Park',
    slug: 'bwindi-impenetrable-national-park',
    country: 'Uganda',
    type: DestinationType.NATIONAL_PARK,
    description:
      'One of the world’s best places for gorilla trekking, with misty forest trails and rich biodiversity.',
    latitude: -1.05,
    longitude: 29.69,
    bestTimeToVisit: { jan: 'GOOD', feb: 'GOOD', mar: 'GOOD', apr: 'FAIR', may: 'FAIR', jun: 'EXCELLENT', jul: 'EXCELLENT', aug: 'EXCELLENT', sep: 'EXCELLENT', oct: 'GOOD', nov: 'GOOD', dec: 'GOOD' },
    wildlifePresent: ['Mountain Gorilla', 'Elephant', 'Forest Buffalo', 'Monkey', 'Birdlife']
  },
  {
    name: 'Volcanoes National Park',
    slug: 'volcanoes-national-park',
    country: 'Rwanda',
    type: DestinationType.NATIONAL_PARK,
    description:
      'A mountain-gorilla trekking legend with dramatic volcanic scenery and some of the best primate encounters in Africa.',
    latitude: -1.4833,
    longitude: 29.625,
    bestTimeToVisit: { jan: 'GOOD', feb: 'GOOD', mar: 'GOOD', apr: 'GOOD', may: 'FAIR', jun: 'EXCELLENT', jul: 'EXCELLENT', aug: 'EXCELLENT', sep: 'EXCELLENT', oct: 'GOOD', nov: 'GOOD', dec: 'GOOD' },
    wildlifePresent: ['Mountain Gorilla', 'Golden Monkey', 'Buffalo', 'Elephant']
  }
] as const;

const extractedOperators = [
  {
    email: 'info@kiliexpeditions.co.tz',
    password: 'OperatorPass123!',
    firstName: 'Amara',
    lastName: 'Mrema',
    companyName: 'Kili Tanzanian Expeditions',
    slug: 'kili-tanzanian-expeditions',
    countryOfOrigin: 'Tanzania',
    headquartersAddress: 'Arusha Tourism Complex, Arusha, Tanzania',
    registrationNumber: 'TZ-TOUR-84920',
    isVerified: true,
    overviewText: 'Premier locally owned safari operator specializing in Big Five game drives, Ngorongoro Crater tours and private tailor-made itineraries across Tanzania.',
    yearEstablished: 2012,
    priceTier: ComfortLevel.MID_RANGE,
    averageRating: 4.9,
    totalReviews: 48
  },
  {
    email: 'safari@marawilderness.co.ke',
    password: 'OperatorPass123!',
    firstName: 'David',
    lastName: 'Kimani',
    companyName: 'Mara Wilderness Safaris',
    slug: 'mara-wilderness-safaris',
    countryOfOrigin: 'Kenya',
    headquartersAddress: 'Karen Road, Nairobi, Kenya',
    registrationNumber: 'KE-MIN-39201',
    isVerified: true,
    overviewText: 'Authentic Kenyan safari experts guiding travelers through the Great Migration in Masai Mara, Amboseli and Lake Nakuru.',
    yearEstablished: 2015,
    priceTier: ComfortLevel.LUXURY,
    averageRating: 4.95,
    totalReviews: 62
  },
  {
    email: 'bookings@africanbigcats.co.za',
    password: 'OperatorPass123!',
    firstName: 'Liam',
    lastName: 'Pretorius',
    companyName: 'African Big Cats Safaris',
    slug: 'african-big-cats-safaris',
    countryOfOrigin: 'South Africa',
    headquartersAddress: 'Johannesburg, South Africa',
    registrationNumber: 'ZA-TRAVEL-22310',
    isVerified: true,
    overviewText: 'South Africa specialists focused on private reserves, luxury lodges and family-friendly safari itineraries.',
    yearEstablished: 2008,
    priceTier: ComfortLevel.LUXURY,
    averageRating: 4.8,
    totalReviews: 81
  },
  {
    email: 'hello@wildserenity.com',
    password: 'OperatorPass123!',
    firstName: 'Nadia',
    lastName: 'Moyo',
    companyName: 'Wild Serenity Safaris',
    slug: 'wild-serenity-safaris',
    countryOfOrigin: 'Zimbabwe',
    headquartersAddress: 'Harare, Zimbabwe',
    registrationNumber: 'ZW-SAF-11874',
    isVerified: true,
    overviewText: 'Adventure-first safaris across Zimbabwe, Botswana and Zambia, with a focus on remote wilderness camps and guide-led expeditions.',
    yearEstablished: 2011,
    priceTier: ComfortLevel.MID_RANGE,
    averageRating: 4.9,
    totalReviews: 57
  },
  {
    email: 'travel@gorillaforestuganda.com',
    password: 'OperatorPass123!',
    firstName: 'Joseph',
    lastName: 'Ahebwa',
    companyName: 'Gorilla Forest Uganda',
    slug: 'gorilla-forest-uganda',
    countryOfOrigin: 'Uganda',
    headquartersAddress: 'Kampala, Uganda',
    registrationNumber: 'UG-TOUR-77411',
    isVerified: true,
    overviewText: 'Gorilla trekking and rainforest wildlife specialists with bespoke Uganda and Rwanda itineraries.',
    yearEstablished: 2014,
    priceTier: ComfortLevel.MID_RANGE,
    averageRating: 4.7,
    totalReviews: 44
  }
] as const;

const extractedTours: Array<{
  title: string;
  slug: string;
  operatorSlug: string;
  durationDays: number;
  durationNights: number;
  minPriceUsd: number;
  maxPriceUsd: number;
  comfortLevel: ComfortLevel;
  tourType: TourType;
  primaryCountry: string;
  startLocation: string;
  endLocation: string;
  inclusions: string[];
  exclusions: string[];
  destinations: string[];
}> = [
  {
    title: '8-Day Tarangire, Serengeti, Ndutu Migration & Ngorongoro',
    slug: '8-day-tarangire-serengeti-ndutu-migration-ngorongoro',
    operatorSlug: 'kili-tanzanian-expeditions',
    durationDays: 8,
    durationNights: 7,
    minPriceUsd: 2850,
    maxPriceUsd: 3150,
    comfortLevel: ComfortLevel.MID_RANGE,
    tourType: TourType.PRIVATE,
    primaryCountry: 'Tanzania',
    startLocation: 'Arusha (Start)',
    endLocation: 'Kilimanjaro Airport (End)',
    inclusions: ['Private 4x4 safari vehicle', 'Lodge & tented camp accommodation', 'Park fees', 'English-speaking guide', 'Meals as specified'],
    exclusions: ['International flights', 'Visas', 'Tips', 'Personal expenses'],
    destinations: ['tarangire-national-park', 'serengeti-national-park', 'ngorongoro-crater']
  },
  {
    title: '6-Day Affordable Safari Adventure (Northern Circuit)',
    slug: '6-day-affordable-safari-adventure-northern-circuit',
    operatorSlug: 'kili-tanzanian-expeditions',
    durationDays: 6,
    durationNights: 5,
    minPriceUsd: 2315,
    maxPriceUsd: 2460,
    comfortLevel: ComfortLevel.MID_RANGE,
    tourType: TourType.PRIVATE,
    primaryCountry: 'Tanzania',
    startLocation: 'Arusha (Start)',
    endLocation: 'Arusha (End)',
    inclusions: ['Lodge & tented camp accommodation', 'Private game drives', 'All park fees', 'Meals', 'Transfer support'],
    exclusions: ['Flights', 'Visa', 'Travel insurance', 'Alcohol'],
    destinations: ['tarangire-national-park', 'serengeti-national-park', 'ngorongoro-crater']
  },
  {
    title: '3-Day Masai Mara Express Fly-in Luxury Safari',
    slug: '3-day-masai-mara-express-fly-in-luxury-safari',
    operatorSlug: 'mara-wilderness-safaris',
    durationDays: 3,
    durationNights: 2,
    minPriceUsd: 1290,
    maxPriceUsd: 1550,
    comfortLevel: ComfortLevel.LUXURY,
    tourType: TourType.FLY_IN,
    primaryCountry: 'Kenya',
    startLocation: 'Nairobi Wilson Airport',
    endLocation: 'Nairobi Wilson Airport',
    inclusions: ['Return domestic flights', 'Luxury camp accommodation', 'Game drives', 'All park fees', 'Meals'],
    exclusions: ['International flights', 'Hot air balloon experience', 'Maasai village fee'],
    destinations: ['masai-mara-national-reserve']
  },
  {
    title: '5-Day Serengeti & Ngorongoro Big Five Classic Safari',
    slug: '5-day-serengeti-ngorongoro-big-five-classic-safari',
    operatorSlug: 'kili-tanzanian-expeditions',
    durationDays: 5,
    durationNights: 4,
    minPriceUsd: 1650,
    maxPriceUsd: 2100,
    comfortLevel: ComfortLevel.MID_RANGE,
    tourType: TourType.PRIVATE,
    primaryCountry: 'Tanzania',
    startLocation: 'Arusha / Kilimanjaro Airport',
    endLocation: 'Arusha',
    inclusions: ['Private 4x4 Land Cruiser', 'Full board safari lodges', 'Professional guide', 'Unlimited game drives'],
    exclusions: ['Flights', 'Travel insurance', 'Tips', 'Alcohol'],
    destinations: ['serengeti-national-park', 'ngorongoro-crater']
  },
  {
    title: '3-Day Rwanda Uganda Gorilla Trekking Tour',
    slug: '3-day-rwanda-uganda-gorilla-trekking-tour',
    operatorSlug: 'gorilla-forest-uganda',
    durationDays: 3,
    durationNights: 2,
    minPriceUsd: 1344,
    maxPriceUsd: 1500,
    comfortLevel: ComfortLevel.MID_RANGE,
    tourType: TourType.PRIVATE,
    primaryCountry: 'Rwanda',
    startLocation: 'Kigali (Start)',
    endLocation: 'Kigali Airport (End)',
    inclusions: ['Gorilla permits', 'Lodge & resort accommodation', 'Ground transfers', 'Meals'],
    exclusions: ['International flights', 'Travel insurance', 'Personal shopping'],
    destinations: ['bwindi-impenetrable-national-park', 'volcanoes-national-park']
  },
  {
    title: '6-Day Masai Mara-Nakuru-Amboseli Kenya Safari 4x4 Jeep',
    slug: '6-day-masai-mara-nakuru-amboseli-kenya-safari-4x4-jeep',
    operatorSlug: 'mara-wilderness-safaris',
    durationDays: 6,
    durationNights: 5,
    minPriceUsd: 805,
    maxPriceUsd: 895,
    comfortLevel: ComfortLevel.BUDGET,
    tourType: TourType.SHARED_GROUP,
    primaryCountry: 'Kenya',
    startLocation: 'Nairobi (Start)',
    endLocation: 'Nairobi (End)',
    inclusions: ['Shared safari vehicle', 'Camp & hotel stays', 'Park fees', 'Meals', 'Transport'],
    exclusions: ['Flights', 'Tips', 'Personal extras'],
    destinations: ['masai-mara-national-reserve', 'amboseli-national-park']
  },
  {
    title: '4-Day Sabi Sand Safari at Umkumbe Bush Lodge',
    slug: '4-day-sabi-sand-safari-at-umkumbe-bush-lodge',
    operatorSlug: 'african-big-cats-safaris',
    durationDays: 4,
    durationNights: 3,
    minPriceUsd: 1478,
    maxPriceUsd: 1680,
    comfortLevel: ComfortLevel.LUXURY,
    tourType: TourType.PRIVATE,
    primaryCountry: 'South Africa',
    startLocation: 'Mbombela / Nelspruit (Start)',
    endLocation: 'Mbombela / Nelspruit (End)',
    inclusions: ['Luxury bush lodge', 'Big Five game drives', 'Meals', 'Transfers'],
    exclusions: ['Flights', 'Optional activities', 'Travel insurance'],
    destinations: ['kruger-national-park']
  },
  {
    title: '3-Day Budget Safari to Serengeti & Ngorongoro',
    slug: '3-day-budget-safari-to-serengeti-ngorongoro',
    operatorSlug: 'kili-tanzanian-expeditions',
    durationDays: 3,
    durationNights: 2,
    minPriceUsd: 1176,
    maxPriceUsd: 1300,
    comfortLevel: ComfortLevel.BUDGET,
    tourType: TourType.PRIVATE,
    primaryCountry: 'Tanzania',
    startLocation: 'Arusha (Start)',
    endLocation: 'Arusha (End)',
    inclusions: ['Guest house stays', 'Game drives', 'Park fees', 'Local guide'],
    exclusions: ['Flights', 'Visas', 'Tips'],
    destinations: ['serengeti-national-park', 'ngorongoro-crater']
  },
  {
    title: '6-Day Luxury Wildebeest Migration Mara River Crossing',
    slug: '6-day-luxury-wildebeest-migration-mara-river-crossing',
    operatorSlug: 'mara-wilderness-safaris',
    durationDays: 6,
    durationNights: 5,
    minPriceUsd: 3713,
    maxPriceUsd: 3815,
    comfortLevel: ComfortLevel.LUXURY,
    tourType: TourType.PRIVATE,
    primaryCountry: 'Kenya',
    startLocation: 'Arusha (Start)',
    endLocation: 'Arusha (End)',
    inclusions: ['Luxury lodge accommodation', 'Private game drives', 'Park fees', 'Guided migration tracking'],
    exclusions: ['Flights', 'Insurance', 'Tips'],
    destinations: ['masai-mara-national-reserve']
  },
  {
    title: '12-Day Bush to Beach Luxury Escape',
    slug: '12-day-bush-to-beach-luxury-escape',
    operatorSlug: 'african-big-cats-safaris',
    durationDays: 12,
    durationNights: 11,
    minPriceUsd: 4151,
    maxPriceUsd: 4680,
    comfortLevel: ComfortLevel.LUXURY,
    tourType: TourType.PRIVATE,
    primaryCountry: 'Tanzania',
    startLocation: 'Arusha (Start)',
    endLocation: 'Zanzibar (End)',
    inclusions: ['Luxury lodge stays', 'Transfers', 'Guide', 'Beach extension'],
    exclusions: ['Flights', 'Optional day trips', 'Insurance'],
    destinations: ['tarangire-national-park', 'serengeti-national-park', 'ngorongoro-crater']
  }
];

async function main() {
  console.log('🌱 Starting extracted SafariBookings dataset seed...');

  const adminPassword = await bcrypt.hash('AdminPass123!', 10);
  const travelerPassword = await bcrypt.hash('TravelerPass123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@safariasili.com' },
    update: {},
    create: {
      email: 'admin@safariasili.com',
      passwordHash: adminPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: Role.ADMIN,
      emailVerified: true,
      country: 'Kenya'
    }
  });

  await prisma.user.upsert({
    where: { email: 'traveler@gmail.com' },
    update: {},
    create: {
      email: 'traveler@gmail.com',
      passwordHash: travelerPassword,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      role: Role.TRAVELER,
      emailVerified: true,
      country: 'United Kingdom'
    }
  });

  const destinationMap = new Map<string, string>();
  for (const destination of extractedDestinations) {
    const created = await prisma.destination.upsert({
      where: { slug: destination.slug },
      update: {},
      create: {
        name: destination.name,
        slug: destination.slug,
        country: destination.country,
        type: destination.type,
        description: destination.description,
        latitude: destination.latitude,
        longitude: destination.longitude,
        bestTimeToVisit: destination.bestTimeToVisit,
        wildlifePresent: destination.wildlifePresent
      }
    });
    destinationMap.set(destination.slug, created.id);
  }

  for (const operator of extractedOperators) {
    const user = await prisma.user.upsert({
      where: { email: operator.email },
      update: {},
      create: {
        email: operator.email,
        passwordHash: await bcrypt.hash(operator.password, 10),
        firstName: operator.firstName,
        lastName: operator.lastName,
        role: Role.OPERATOR,
        emailVerified: true,
        country: operator.countryOfOrigin,
        phone: '+255 700 000 000'
      }
    });

    await prisma.operator.upsert({
      where: { userId: user.id },
      update: {
        companyName: operator.companyName,
        slug: operator.slug,
        countryOfOrigin: operator.countryOfOrigin,
        headquartersAddress: operator.headquartersAddress,
        registrationNumber: operator.registrationNumber,
        isVerified: operator.isVerified,
        overviewText: operator.overviewText,
        yearEstablished: operator.yearEstablished,
        priceTier: operator.priceTier,
        averageRating: operator.averageRating,
        totalReviews: operator.totalReviews
      },
      create: {
        userId: user.id,
        companyName: operator.companyName,
        slug: operator.slug,
        countryOfOrigin: operator.countryOfOrigin,
        headquartersAddress: operator.headquartersAddress,
        registrationNumber: operator.registrationNumber,
        isVerified: operator.isVerified,
        overviewText: operator.overviewText,
        yearEstablished: operator.yearEstablished,
        priceTier: operator.priceTier,
        averageRating: operator.averageRating,
        totalReviews: operator.totalReviews
      }
    });
  }

  for (const tour of extractedTours) {
    const operator = await prisma.operator.findUnique({ where: { slug: tour.operatorSlug } });
    if (!operator) {
      console.warn(`⚠️ Operator not found for tour: ${tour.title}`);
      continue;
    }

    const createdTour = await prisma.tour.upsert({
      where: { slug: tour.slug },
      update: {
        operatorId: operator.id,
        title: tour.title,
        durationDays: tour.durationDays,
        durationNights: tour.durationNights,
        minPriceUsd: tour.minPriceUsd,
        maxPriceUsd: tour.maxPriceUsd,
        comfortLevel: tour.comfortLevel,
        tourType: tour.tourType,
        primaryCountry: tour.primaryCountry,
        startLocation: tour.startLocation,
        endLocation: tour.endLocation,
        inclusions: tour.inclusions,
        exclusions: tour.exclusions
      },
      create: {
        operatorId: operator.id,
        title: tour.title,
        slug: tour.slug,
        durationDays: tour.durationDays,
        durationNights: tour.durationNights,
        minPriceUsd: tour.minPriceUsd,
        maxPriceUsd: tour.maxPriceUsd,
        comfortLevel: tour.comfortLevel,
        tourType: tour.tourType,
        primaryCountry: tour.primaryCountry,
        startLocation: tour.startLocation,
        endLocation: tour.endLocation,
        inclusions: tour.inclusions,
        exclusions: tour.exclusions
      }
    });

    for (const destinationSlug of tour.destinations) {
      const destinationId = destinationMap.get(destinationSlug);
      if (!destinationId) continue;

      await prisma.tourDestination.upsert({
        where: {
          tourId_destinationId: {
            tourId: createdTour.id,
            destinationId
          }
        },
        update: {},
        create: {
          tourId: createdTour.id,
          destinationId
        }
      });
    }
  }

  console.log('✅ Extracted SafariBookings-style data imported successfully.');
  console.log('You can now run: npm run db:seed:extracted');
}

main()
  .catch((error) => {
    console.error('❌ Error importing extracted safari data:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
