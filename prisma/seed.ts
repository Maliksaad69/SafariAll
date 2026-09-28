import { PrismaClient, Role, ComfortLevel, TourType, DestinationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SafariAsili Database Seed...');

  // Hash shared password
  const adminPassword = await bcrypt.hash('AdminPass123!', 10);
  const operatorPassword = await bcrypt.hash('OperatorPass123!', 10);
  const travelerPassword = await bcrypt.hash('TravelerPass123!', 10);

  // 1. Create Super Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@safariasili.com' },
    update: {},
    create: {
      email: 'admin@safariasili.com',
      passwordHash: adminPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: Role.ADMIN,
      emailVerified: true,
      country: 'Kenya',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // 2. Create Sample Tour Operator Users & Profiles
  const opUser1 = await prisma.user.upsert({
    where: { email: 'info@kiliexpeditions.co.tz' },
    update: {},
    create: {
      email: 'info@kiliexpeditions.co.tz',
      passwordHash: operatorPassword,
      firstName: 'Amara',
      lastName: 'Mrema',
      role: Role.OPERATOR,
      emailVerified: true,
      country: 'Tanzania',
      phone: '+255 754 123 456',
    },
  });

  const operator1 = await prisma.operator.upsert({
    where: { userId: opUser1.id },
    update: {},
    create: {
      userId: opUser1.id,
      companyName: 'Kili Tanzanian Expeditions',
      slug: 'kili-tanzanian-expeditions',
      countryOfOrigin: 'Tanzania',
      headquartersAddress: 'Arusha Tourism Complex, Arusha, Tanzania',
      registrationNumber: 'TZ-TOUR-84920',
      isVerified: true,
      verificationDate: new Date(),
      overviewText: 'Premier locally owned safari operator specializing in high-end Big Five game drives, Ngorongoro Crater tours, and private tailor-made itineraries across Tanzania.',
      yearEstablished: 2012,
      priceTier: ComfortLevel.MID_RANGE,
      averageRating: 4.9,
      totalReviews: 48,
    },
  });

  const opUser2 = await prisma.user.upsert({
    where: { email: 'safari@marawilderness.co.ke' },
    update: {},
    create: {
      email: 'safari@marawilderness.co.ke',
      passwordHash: operatorPassword,
      firstName: 'David',
      lastName: 'Kimani',
      role: Role.OPERATOR,
      emailVerified: true,
      country: 'Kenya',
      phone: '+254 722 987 654',
    },
  });

  const operator2 = await prisma.operator.upsert({
    where: { userId: opUser2.id },
    update: {},
    create: {
      userId: opUser2.id,
      companyName: 'Mara Wilderness Safaris',
      slug: 'mara-wilderness-safaris',
      countryOfOrigin: 'Kenya',
      headquartersAddress: 'Karen Road, Nairobi, Kenya',
      registrationNumber: 'KE-MIN-39201',
      isVerified: true,
      verificationDate: new Date(),
      overviewText: 'Authentic Kenyan safari experts guiding travelers through the Great Migration in Masai Mara, Amboseli elephant plains, and Lake Nakuru flamingos.',
      yearEstablished: 2015,
      priceTier: ComfortLevel.LUXURY,
      averageRating: 4.95,
      totalReviews: 62,
    },
  });

  console.log('✅ 2 Verified Tour Operators created.');

  // 3. Create Key National Parks & Destinations
  const destSerengeti = await prisma.destination.upsert({
    where: { slug: 'serengeti-national-park' },
    update: {},
    create: {
      name: 'Serengeti National Park',
      slug: 'serengeti-national-park',
      country: 'Tanzania',
      type: DestinationType.NATIONAL_PARK,
      description: 'World-famous for its annual Great Wildebeest Migration and vast savanna plains teeming with lions, leopards, and cheetahs.',
      latitude: -2.3333,
      longitude: 34.8333,
      bestTimeToVisit: {
        jan: 'EXCELLENT', feb: 'EXCELLENT', mar: 'GOOD', apr: 'FAIR',
        may: 'GOOD', jun: 'EXCELLENT', jul: 'EXCELLENT', aug: 'EXCELLENT',
        sep: 'EXCELLENT', oct: 'EXCELLENT', nov: 'GOOD', dec: 'EXCELLENT'
      },
      wildlifePresent: ['Lion', 'Leopard', 'Elephant', 'Rhino', 'Buffalo', 'Cheetah', 'Wildebeest'],
    },
  });

  const destMara = await prisma.destination.upsert({
    where: { slug: 'masai-mara-national-reserve' },
    update: {},
    create: {
      name: 'Masai Mara National Reserve',
      slug: 'masai-mara-national-reserve',
      country: 'Kenya',
      type: DestinationType.NATIONAL_PARK,
      description: 'Iconic Kenyan game reserve celebrated for dramatic Mara River crossings during the Great Migration.',
      latitude: -1.4833,
      longitude: 35.1433,
      bestTimeToVisit: {
        jan: 'GOOD', feb: 'GOOD', mar: 'GOOD', apr: 'FAIR',
        may: 'FAIR', jun: 'GOOD', jul: 'EXCELLENT', aug: 'EXCELLENT',
        sep: 'EXCELLENT', oct: 'EXCELLENT', nov: 'GOOD', dec: 'GOOD'
      },
      wildlifePresent: ['Lion', 'Leopard', 'Elephant', 'Rhino', 'Buffalo', 'Giraffe'],
    },
  });

  const destNgorongoro = await prisma.destination.upsert({
    where: { slug: 'ngorongoro-crater' },
    update: {},
    create: {
      name: 'Ngorongoro Crater',
      slug: 'ngorongoro-crater',
      country: 'Tanzania',
      type: DestinationType.GAME_RESERVE,
      description: 'The world\'s largest intact volcanic caldera, home to the highest density of large mammals in Africa including rare black rhinos.',
      latitude: -3.2081,
      longitude: 35.5397,
      bestTimeToVisit: {
        jan: 'EXCELLENT', feb: 'EXCELLENT', mar: 'EXCELLENT', apr: 'GOOD',
        may: 'GOOD', jun: 'EXCELLENT', jul: 'EXCELLENT', aug: 'EXCELLENT',
        sep: 'EXCELLENT', oct: 'EXCELLENT', nov: 'GOOD', dec: 'EXCELLENT'
      },
      wildlifePresent: ['Black Rhino', 'Lion', 'Elephant', 'Hippo', 'Flamingo', 'Hyena'],
    },
  });

  console.log('✅ National Park destinations created.');

  // 4. Create Sample Safari Tours
  const tour1 = await prisma.tour.upsert({
    where: { slug: '5-day-serengeti-ngorongoro-big-five-safari' },
    update: {},
    create: {
      operatorId: operator1.id,
      title: '5-Day Serengeti & Ngorongoro Big Five Classic Safari',
      slug: '5-day-serengeti-ngorongoro-big-five-safari',
      durationDays: 5,
      durationNights: 4,
      minPriceUsd: 1650,
      maxPriceUsd: 2100,
      comfortLevel: ComfortLevel.MID_RANGE,
      tourType: TourType.PRIVATE,
      primaryCountry: 'Tanzania',
      startLocation: 'Arusha / Kilimanjaro Airport',
      endLocation: 'Arusha',
      inclusions: [
        'Private 4x4 Land Cruiser with popup roof',
        'All park entry fees & conservation permits',
        'Full board mid-range safari lodges',
        'Professional English-speaking driver guide',
        'Unlimited game drives & mineral water'
      ],
      exclusions: [
        'International flights & visa fees',
        'Tips for guide ($20/day recommended)',
        'Personal travel insurance',
        'Alcoholic beverages'
      ],
      destinations: {
        create: [
          { destinationId: destSerengeti.id },
          { destinationId: destNgorongoro.id }
        ]
      },
      itineraries: {
        create: [
          {
            dayNumber: 1,
            title: 'Arusha to Lake Manyara National Park',
            description: 'Morning pickup from Arusha. Drive to Lake Manyara for afternoon game drive searching for tree-climbing lions.',
            accommodationName: 'Manyara Wildlife Lodge',
            accommodationType: ComfortLevel.MID_RANGE,
            mealsIncluded: 'Lunch, Dinner'
          },
          {
            dayNumber: 2,
            title: 'Lake Manyara to Central Serengeti Plains',
            description: 'Drive through Ngorongoro highlands into the vast Serengeti plains. Afternoon game drive in Seronera region.',
            accommodationName: 'Serengeti Heritage Tented Camp',
            accommodationType: ComfortLevel.MID_RANGE,
            mealsIncluded: 'Breakfast, Lunch, Dinner'
          },
          {
            dayNumber: 3,
            title: 'Full Day Game Drive in Serengeti National Park',
            description: 'Full day exploring central Serengeti. Track lion prides, leopards lounging in acacia trees, and cheetah hunts.',
            accommodationName: 'Serengeti Heritage Tented Camp',
            accommodationType: ComfortLevel.MID_RANGE,
            mealsIncluded: 'Breakfast, Lunch, Dinner'
          },
          {
            dayNumber: 4,
            title: 'Serengeti to Ngorongoro Conservation Area',
            description: 'Early morning game drive in Serengeti. Afternoon transit to the rim of Ngorongoro Crater for sunset views.',
            accommodationName: 'Rhino Lodge Ngorongoro',
            accommodationType: ComfortLevel.MID_RANGE,
            mealsIncluded: 'Breakfast, Lunch, Dinner'
          },
          {
            dayNumber: 5,
            title: 'Ngorongoro Crater Floor & Return to Arusha',
            description: 'Descend 600m into the crater floor for a 5-hour game drive. Spot rare black rhinos. Return to Arusha in evening.',
            accommodationName: 'N/A (Departure)',
            accommodationType: ComfortLevel.MID_RANGE,
            mealsIncluded: 'Breakfast, Lunch'
          }
        ]
      }
    }
  });

  const tour2 = await prisma.tour.upsert({
    where: { slug: '3-day-masai-mara-express-fly-in-safari' },
    update: {},
    create: {
      operatorId: operator2.id,
      title: '3-Day Masai Mara Express Fly-in Luxury Safari',
      slug: '3-day-masai-mara-express-fly-in-safari',
      durationDays: 3,
      durationNights: 2,
      minPriceUsd: 1290,
      maxPriceUsd: 1550,
      comfortLevel: ComfortLevel.LUXURY,
      tourType: TourType.FLY_IN,
      primaryCountry: 'Kenya',
      startLocation: 'Nairobi Wilson Airport',
      endLocation: 'Nairobi Wilson Airport',
      inclusions: [
        'Return domestic flights (Nairobi to Mara airstrip)',
        'Luxury tented camp accommodation',
        'Shared 4x4 open safari vehicle game drives',
        'All park entrance fees',
        'All meals & house wines/beers'
      ],
      exclusions: [
        'International flights',
        'Hot air balloon safari ($480 addon)',
        'Maasai village cultural fee ($30)'
      ],
      destinations: {
        create: [
          { destinationId: destMara.id }
        ]
      },
      itineraries: {
        create: [
          {
            dayNumber: 1,
            title: 'Fly Nairobi to Masai Mara & Afternoon Safari',
            description: 'Board bush plane from Wilson Airport to Masai Mara. Arrive at luxury camp for lunch followed by afternoon game drive.',
            accommodationName: 'Ashnil Mara Luxury Camp',
            accommodationType: ComfortLevel.LUXURY,
            mealsIncluded: 'Lunch, Dinner'
          },
          {
            dayNumber: 2,
            title: 'Full Day Game Viewing in Masai Mara',
            description: 'Full day game drive along Mara River tracking wildebeest migration crossings and big cats.',
            accommodationName: 'Ashnil Mara Luxury Camp',
            accommodationType: ComfortLevel.LUXURY,
            mealsIncluded: 'Breakfast, Lunch, Dinner'
          },
          {
            dayNumber: 3,
            title: 'Early Morning Safari & Fly Back to Nairobi',
            description: 'Final sunrise game drive. Breakfast at camp before transferring to airstrip for return flight to Nairobi.',
            accommodationName: 'N/A (Departure)',
            accommodationType: ComfortLevel.LUXURY,
            mealsIncluded: 'Breakfast'
          }
        ]
      }
    }
  });

  console.log('✅ Sample Tours created:', tour1.title, '|', tour2.title);

  // 5. Create Sample Traveler User
  const traveler = await prisma.user.upsert({
    where: { email: 'traveler@gmail.com' },
    update: {},
    create: {
      email: 'traveler@gmail.com',
      passwordHash: travelerPassword,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      role: Role.TRAVELER,
      emailVerified: true,
      country: 'United Kingdom',
      phone: '+44 7700 900077',
    }
  });

  console.log('✅ Sample Traveler created:', traveler.email);

  console.log('\n🎉 Seed completed successfully!');
  console.log('----------------------------------------------------');
  console.log('🔑 Credentials Summary:');
  console.log('👉 ADMIN: admin@safariasili.com / AdminPass123!');
  console.log('👉 OPERATOR: info@kiliexpeditions.co.tz / OperatorPass123!');
  console.log('👉 TRAVELER: traveler@gmail.com / TravelerPass123!');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
