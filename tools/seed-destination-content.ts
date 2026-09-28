/**
 * Seeds the destination_sections table with real travel-guide content
 * for the sidebar topics on park & country pages.
 *
 * Run: npx tsx tools/seed-destination-content.ts
 */
import { PrismaClient, DestinationType } from '@prisma/client';

const prisma = new PrismaClient();

const SECTIONS = [
  'overview', 'parks-reserves', 'things-to-do', 'best-beaches', 'reviews',
  'wildlife', 'birds', 'best-time', 'weather-climate', 'popular-routes',
  'getting-there', 'health-safety', 'staying-safe',
] as const;

type SectionKey = (typeof SECTIONS)[number];

interface SeedDestination {
  slug: string;
  name: string;
  country: string;
  type: DestinationType;
  description: string;
  latitude?: number;
  longitude?: number;
  sections: Record<SectionKey, { title: string; body: string; bullets?: string[] }>;
}

const DATA: SeedDestination[] = [
  {
    slug: 'serengeti-national-park',
    name: 'Serengeti National Park',
    country: 'Tanzania',
    type: 'NATIONAL_PARK',
    description:
      'The Serengeti is Tanzania\u2019s oldest and most celebrated national park, a 14,750km\u00b2 sea of grass immortalized in countless wildlife documentaries. It hosts the Great Migration \u2014 over 1.5 million wildebeest, 250,000 zebra and hundreds of thousands of gazelle on their annual circular trek \u2014 and boasts the highest lion density in Africa.',
    latitude: -2.3333,
    longitude: 34.8333,
    sections: {
      'overview': {
        title: 'Overview',
        body: 'Serengeti National Park is arguably the most famous safari destination on Earth. Established in 1951, it covers 14,750km\u00b2 of endless grassland plains, Acacia woodlands and rocky kopjes in northern Tanzania, contiguous with Kenya\u2019s Masai Mara. The park\u2019s name comes from the Maasai word \u201Csiringet\u201D, meaning \u201Cthe place where the land runs on forever\u201D \u2014 a fitting description for the sweeping savannahs that support the greatest large-mammal migration on the planet.',
        bullets: [
          'UNESCO World Heritage Site since 1981',
          'Home to roughly 3,000 lions and 1,000 leopards',
          'Best accessed from Arusha by road (about 8 hours) or by scheduled flights',
        ],
      },
      'parks-reserves': {
        title: 'Parks & Reserves',
        body: 'The Serengeti sits at the heart of a greater ecosystem of protected areas. Neighboring Ngorongoro Conservation Area to the southeast allows the migration to continue onto the mineral-rich calving grounds, while Maswa Game Reserve, Grumeti and Ikorongo Game Reserves and Loliondo Game Controlled Area buffer the park on other sides. Across the Kenyan border, the Masai Mara National Reserve completes the ecosystem.',
        bullets: [
          'Ngorongoro Conservation Area \u2013 calving grounds (Dec\u2013Mar)',
          'Maswa Game Reserve \u2013 southern buffer, excellent for wild dogs',
          'Grumeti & Ikorongo Game Reserves \u2013 western corridor private concessions',
          'Masai Mara National Reserve (Kenya) \u2013 northern extension of the ecosystem',
        ],
      },
      'things-to-do': {
        title: 'Things To Do',
        body: 'Game drives are the headline act \u2014 morning and afternoon drives in open or pop-up-roof 4x4 vehicles bring you within meters of predators and herds. Hot-air balloon safaris at dawn, followed by a champagne bush breakfast, are the Serengeti\u2019s signature splurge. Selected areas also offer guided walking safaris, and a visit to a Maasai village adds a cultural dimension to the wildlife experience.',
        bullets: [
          'Year-round game drives \u2013 the classic Serengeti experience',
          'Hot-air balloon safaris over the migration herds',
          'Guided walking safaris in designated wilderness zones',
          'Maasai cultural visits on the park fringes',
          'Photography hides at Grumeti River crocodile crossings',
        ],
      },
      'best-beaches': {
        title: 'Best Beaches',
        body: 'The Serengeti is landlocked, so beach time means flying onward to the coast. Most visitors combine their safari with the white-sand beaches of Zanzibar \u2014 Nungwi and Kendwa in the north, Paje and Jambiani on the southeast coast \u2014 or the quieter islands of Pemba and Mafia. Scheduled flights connect Seronera airstrip to Zanzibar in around two hours.',
        bullets: [
          'Nungwi & Kendwa, Zanzibar \u2013 swimming-friendly, sunset dhow cruises',
          'Paje & Jambiani \u2013 kitesurfing and laid-back beach villages',
          'Mafia Island \u2013 whale sharks and marine-park snorkeling',
        ],
      },
      'reviews': {
        title: 'Reviews',
        body: 'Travelers consistently rate the Serengeti as the highlight of any Tanzanian itinerary, praising the sheer density of big cats and the scale of the migration. Common critiques are the price of park fees and the crowds around big sightings in high season \u2014 many reviewers recommend the central Seronera area for first-timers and the remote north or west for those seeking solitude.',
        bullets: [],
      },
      'wildlife': {
        title: 'Wildlife',
        body: 'The Serengeti supports around 70 large mammal species. Lion prides are exceptionally easy to find \u2014 the park holds Africa\u2019s densest lion population \u2014 while leopard favor the riverine woodland of the Seronera Valley and cheetah hunt the open plains of the southeast. Elephant and giraffe are common in the woodlands, hippo pods crowd the Retima Pool, and the migration brings 1.5 million wildebeest plus zebra and gazelle through the park in a year-long circuit. Black rhino are present in very small numbers.',
        bullets: [
          'Big Five: lion, leopard, elephant, buffalo \u2014 rhino very rare',
          'Great Migration: river crossings at Grumeti (Jun\u2013Jul) and Mara River (Jul\u2013Oct)',
          'Cheetah, spotted hyena, jackal and bat-eared fox on the plains',
        ],
      },
      'birds': {
        title: 'Birds',
        body: 'With more than 500 recorded bird species, the Serengeti is a superb birding destination year-round, and November to April brings European and intra-African migrants in breeding plumage. Look for Kori bustard \u2014 the world\u2019s heaviest flying bird \u2014 secretary birds, Fischer\u2019s lovebird, rufous-tailed weaver and the endemic grey-breasted spurfowl, found almost nowhere else.',
        bullets: [
          'Grey-breasted spurfowl \u2013 Serengeti near-endemic',
          'Lappet-faced vultures and six other vulture species at kills',
          'Lilac-breasted roller, superc Courser, Fischer\u2019s lovebird on the plains',
        ],
      },
      'best-time': {
        title: 'Best Time To Visit',
        body: 'June to October is the classic dry-season window: animals congregate at water sources, vegetation is thin and the migration usually crosses the Mara River in the north. January and February are superb for wildebeest calving on the southern plains, with predators in attendance. November to May brings greener scenery, newborn animals, lower prices and fewer vehicles \u2014 though rain can make some tracks muddy.',
        bullets: [
          'Jun\u2013Oct: best general wildlife viewing; Mara River crossings',
          'Jan\u2013Feb: wildebeest calving season on the Ndutu plains',
          'Mar\u2013May: long rains \u2014 some camps close, but rates drop sharply',
        ],
      },
      'weather-climate': {
        title: 'Weather & Climate',
        body: 'The Serengeti\u2019s altitude of 900\u20131,800m keeps temperatures pleasant rather than tropical. Daytime highs average 25\u201328\u00b0C, while nights and early game drives can be cold \u2014 pack a fleece, as June to August mornings regularly dip below 12\u00b0C. Rains fall in two seasons: short rains from November to December and long rains from March to May, usually as afternoon thunderstorms.',
        bullets: [],
      },
      'popular-routes': {
        title: 'Popular Routes',
        body: 'The classic northern-circuit route links Arusha with the Serengeti via Ngorongoro Crater and often Tarangire or Lake Manyara, typically over 5\u20137 days. Visitors with more time add the western corridor (Grumeti) or push north to Lobo and the Mara River. Fly-in itineraries use Seronera, Grumeti, Kogatende or Lobo airstrips to skip the long drives.',
        bullets: [
          'Arusha \u2013 Tarangire \u2013 Ngorongoro \u2013 Central Serengeti (5\u20137 days)',
          'Arusha \u2013 Lake Manyara \u2013 Ngorongoro \u2013 Serengeti \u2013 Zanzibar (8\u201310 days)',
          'Fly-in: Arusha \u2192 Kogatende airstrip for Mara River crossings',
        ],
      },
      'getting-there': {
        title: 'How To Get There',
        body: 'Most international visitors fly into Kilimanjaro International Airport (JRO) near Arusha. From Arusha it is an 8-hour drive to Central Serengeti, usually broken with a night in Ngorongoro or Karatu. Scheduled light-aircraft flights from Arusha (ARK) to Seronera, Grumeti, Lobo or Kogatende airstrips take 1\u20132 hours and are the standard choice for upmarket itineraries. Park entry is via Naabi Hill or Ndabaka gates.',
        bullets: [
          'By road: Arusha \u2192 Naabi Hill gate \u2248 8 hours',
          'By air: Arusha \u2192 Seronera airstrip \u2248 1h15m',
          'Entry fees: US$71 per adult per day (2026), payable by card',
        ],
      },
      'health-safety': {
        title: 'Malaria & Vaccinations',
        body: 'The Serengeti is a malaria area, though the cool, dry climate and altitude keep mosquito numbers moderate. Take prophylactics as advised by your travel clinic, use DEET repellent and cover up at dusk. A yellow fever certificate is required if arriving from a yellow-fever-endemic country; hepatitis A, typhoid and routine vaccinations are also recommended.',
        bullets: [],
      },
      'staying-safe': {
        title: 'Staying Safe',
        body: 'The Serengeti is very safe for visitors. Wildlife is the main consideration: always remain inside your vehicle outside designated walking zones, never feed animals and keep voices low near predators. Tented camps and lodges escort guests after dark. The park\u2019s tourism infrastructure is well established, and rangers patrol the main circuits; petty crime is essentially unknown inside the park.',
        bullets: [],
      },
    },
  },
  {
    slug: 'masai-mara-national-reserve',
    name: 'Masai Mara National Reserve',
    country: 'Kenya',
    type: 'NATIONAL_PARK',
    description:
      'Kenya\u2019s flagship reserve covers 1,510km\u00b2 of open savannah in the Great Rift Valley and delivers what many consider the finest big-cat viewing in Africa. Between July and October the Great Migration pours across the Mara River from the Serengeti, creating the most dramatic wildlife spectacle on the continent.',
    latitude: -1.4931,
    longitude: 35.1439,
    sections: {
      'overview': {
        title: 'Overview',
        body: 'The Masai Mara National Reserve is Kenya\u2019s most visited protected area and the northern extension of the Serengeti ecosystem. Named after the Maasai people and the Mara River, the reserve\u2019s rolling grasslands, acacia-dotted hills and riverine forest support exceptional densities of lion, cheetah, leopard and elephant. The annual wildebeest migration between July and October, with its perilous Mara River crossings, is the single most famous wildlife event in Africa.',
        bullets: [
          '1,510km\u00b2 reserve plus surrounding community conservancies',
          'Year-round big-cat viewing, peaking with the migration',
          'Easy access from Nairobi \u2014 a 45-minute flight or 5-hour drive',
        ],
      },
      'parks-reserves': {
        title: 'Parks & Reserves',
        body: 'Around the core reserve, a ring of Maasai-owned conservancies \u2014 Mara North, Olare Motorogi, Naboisho, Ol Kinyei, Lemek and others \u2014 offers exclusive, low-density game viewing with walking safaris and night drives that are not permitted inside the reserve itself. Nearby Lake Nakuru National Park and Hell\u2019s Gate National Park make easy two-center combinations.',
        bullets: [
          'Mara North Conservancy \u2013 prime leopard habitat',
          'Olare Motorogi & Naboisho \u2013 high lion densities, low vehicle numbers',
          'Lake Nakuru National Park \u2013 rhino and flamingos (2\u20133 hours away)',
        ],
      },
      'things-to-do': {
        title: 'Things To Do',
        body: 'Game drives dominate the itinerary, but the Mara offers more: dawn hot-air balloon flights ending in a champagne breakfast on the plains, guided bush walks in the conservancies, night game drives to spot nocturnal predators, and authentic Maasai village visits. Photographers can book dedicated vehicles and hides focused on the big cats and migration crossings.',
        bullets: [
          'Hot-air balloon safari over the migration (US$450\u2013550)',
          'Bush walks and night drives in the conservancies',
          'Maasai cultural experiences',
          'Specialist big-cat photography safaris',
        ],
      },
      'best-beaches': {
        title: 'Best Beaches',
        body: 'The Mara is inland, but Kenya\u2019s coast is a short flight away \u2014 most safaris pair seamlessly with a beach extension. Diani Beach near Mombasa is the classic white-sand choice; Watamu offers marine-park snorkeling and turtle nesting; and the Lamu archipelago provides an untouched, historic Swahili escape. Direct flights run from the Mara\u2019s airstrips to the coast.',
        bullets: [
          'Diani Beach \u2013 15km of powder sand south of Mombasa',
          'Watamu \u2013 Watamu Marine National Park, snorkeling and turtles',
          'Lamu \u2013 car-free Swahili island archipelago',
        ],
      },
      'reviews': {
        title: 'Reviews',
        body: 'Visitors rave about predator encounters \u2014 many report seeing all three big cats in a single day \u2014 and the professionalism of Maasai guides. The most frequent criticisms are vehicle congestion around migration river crossings in August and September, and entry fees; several reviewers recommend staying in a conservancy for a quieter experience at a similar price.',
        bullets: [],
      },
      'wildlife': {
        title: 'Wildlife',
        body: 'The Mara holds Kenya\u2019s highest lion population \u2014 roughly 850\u2013900 individuals \u2014 plus well-studied cheetah and leopard. Elephant, buffalo, giraffe, topi, eland and large hippo pods are resident year-round, while the migration brings up to 1.3 million wildebeest and 300,000 zebra across the Mara River between July and October. Black rhino survive in very small numbers in the reserve.',
        bullets: [
          'Big Five present (rhino very rare)',
          'Migration river crossings at the Mara River, Jul\u2013Oct',
          'Resident big cats mean excellent viewing in every month',
        ],
      },
      'birds': {
        title: 'Birds',
        body: 'Over 470 bird species have been recorded. Raptors are a highlight \u2014 martial eagle, bateleur, augur buzzard and the mighty crowned eagle \u2014 while the grasslands host secretary birds, Kori bustards, lilac-breasted rollers, Jackson\u2019s widowbird and, in the wet season, southern ground hornbills. November to April adds Palearctic migrants.',
        bullets: [
          'Martial eagle, bateleur and secretary bird \u2013 marquee raptors',
          'Rosy-throated longclaw and Jackson\u2019s widowbird in the grasslands',
          'Over 470 species; migrants boost the list Nov\u2013Apr',
        ],
      },
      'best-time': {
        title: 'Best Time To Visit',
        body: 'Wildlife viewing is excellent year-round, but the peak period is July to October when the migration herds are in the Mara and crossings of the Mara River peak in August\u2013September. December to February offers dry, warm conditions and superb predator sightings with fewer crowds. The long rains of March to May turn tracks muddy and some camps close, though rates are at their lowest.',
        bullets: [
          'Jul\u2013Oct: migration in residence \u2014 book 6+ months ahead',
          'Dec\u2013Feb: dry, warm and quieter',
          'Mar\u2013May: long rains, low-season rates',
        ],
      },
      'weather-climate': {
        title: 'Weather & Climate',
        body: 'At 1,500\u20132,170m altitude, the Mara has a mild highland climate. Days are warm (25\u201330\u00b0C) and nights are cool \u2014 often 10\u201312\u00b0C on early drives. Rain falls mostly from November to May, with the heaviest downpours in April and May, typically in the form of afternoon storms that clear to dramatic skies.',
        bullets: [],
      },
      'popular-routes': {
        title: 'Popular Routes',
        body: 'Most itineraries fly from Nairobi\u2019s Wilson Airport to Ol Kiombo, Keekorok or the conservancy airstrips \u2014 a 45-minute hop. Road-based safaris combine the Mara with Lake Nakuru and Hell\u2019s Gate or Amboseli over 5\u20137 days. Longer routes link the Mara with Samburu and the Kenyan coast, or continue south into Tanzania\u2019s Serengeti at the Isebania border crossing.',
        bullets: [
          'Nairobi \u2192 Masai Mara fly-in (3 days, minimal time lost)',
          'Nairobi \u2013 Nakuru \u2013 Mara road circuit (5\u20136 days)',
          'Mara \u2192 Isebania border \u2192 Serengeti combined safari (10+ days)',
        ],
      },
      'getting-there': {
        title: 'How To Get There',
        body: 'Fly into Jomo Kenyatta International Airport (NBO) in Nairobi. From there, scheduled 45-minute flights depart Wilson Airport (WIL) for Mara airstrips \u2014 the fastest and most popular option. By road the reserve is a 5\u20136 hour drive on tarmac and rough murram roads, best combined with Lake Nakuru. Park entry costs US$100 per adult per day in high season (Jul\u2013Oct) and US$70 in low season.',
        bullets: [
          'By air: Wilson Airport \u2192 Ol Kiombo/Keekorok \u2248 45 min',
          'By road: Nairobi \u2192 Sekenani gate \u2248 5\u20136 hours',
          'Entry fees: US$100/day high season, US$70/day low season',
        ],
      },
      'health-safety': {
        title: 'Malaria & Vaccinations',
        body: 'The Mara is a malaria zone \u2014 take prophylaxis, use repellent and wear long sleeves at dawn and dusk. A yellow fever certificate is required when arriving from endemic countries, and hepatitis A, typhoid and tetanus vaccinations are routinely advised. Drinking water at lodges and camps is treated; drink bottled water anyway when in doubt.',
        bullets: [],
      },
      'staying-safe': {
        title: 'Staying Safe',
        body: 'The Masai Mara is a very safe, well-policed tourist area. Standard bush rules apply: stay in your vehicle during game drives, follow camp escorts after dark and keep distance from elephants and buffalo on foot. The surrounding conservancies work closely with Maasai communities, making the region among the most secure and welcoming safari destinations in East Africa.',
        bullets: [],
      },
    },
  },
  {
    slug: 'ngorongoro-crater',
    name: 'Ngorongoro Crater',
    country: 'Tanzania',
    type: 'GAME_RESERVE',
    description:
      'The world\u2019s largest intact volcanic caldera \u2014 610m deep, 19km wide and 264km\u00b2 in area \u2014 encloses a permanent population of roughly 25,000 large mammals. Ngorongoro offers possibly the easiest Big Five viewing in East Africa, including one of the densest black-rhino populations on the continent, all inside the UNESCO-listed Ngorongoro Conservation Area.',
    latitude: -3.1833,
    longitude: 35.5,
    sections: {
      'overview': {
        title: 'Overview',
        body: 'Ngorongoro Crater is the collapsed caldera of an ancient volcano that exploded and fell in on itself two to three million years ago. Today the crater floor is a natural amphitheater of grassland, forest and soda lakes, sheltering around 25,000 large animals that rarely leave. The surrounding Ngorongoro Conservation Area is unique in allowing Maasai pastoralists to live alongside wildlife, and the caldera became a UNESCO World Heritage Site in 1979.',
        bullets: [
          'World\u2019s largest intact and unfilled volcanic caldera',
          'Virtually guaranteed black rhino and lion sightings',
          'A natural enclosure \u2014 most animals never leave the crater',
        ],
      },
      'parks-reserves': {
        title: 'Parks & Reserves',
        body: 'The Crater sits within the Ngorongoro Conservation Area, which also encompasses Empakaai and Olmoti craters, the Laetoli and Olduvai Gorge paleontological sites, and the vast Serengeti plains to the northwest. Neighboring Lake Manyara National Park and Tarangire National Park are less than two hours away, making Ngorongoro the hub of Tanzania\u2019s northern safari circuit.',
        bullets: [
          'Olduvai Gorge \u2013 \u201Ccradle of mankind\u201D paleontology museum',
          'Empakaai Crater \u2013 flamingo lake, guided rim walks',
          'Lake Manyara & Tarangire NP \u2013 easy circuit additions',
        ],
      },
      'things-to-do': {
        title: 'Things To Do',
        body: 'A full-day crater-floor game drive is the essential experience, descending the Seneto descent road at dawn for the best light and least traffic. Elsewhere in the conservation area you can hike to the flamingo-flecked lake in Empakaai Crater, trek the Olmoti crater rim waterfalls, walk with rangers on the Northern Highlands Forest Reserve trails, and tour Olduvai Gorge\u2019s world-famous archaeological site.',
        bullets: [
          'Full-day 4x4 crater-floor game drive',
          'Empakaai Crater hike with flamingo lake views',
          'Olduvai Gorge museum and excavation-site tour',
          'Guided rim walks and Maasai village visits',
        ],
      },
      'best-beaches': {
        title: 'Best Beaches',
        body: 'Ngorongoro sits at 2,200m in the Tanzanian highlands, far from the sea. Safari circuits routinely finish with a flight from Arusha or Lake Manyara to Zanzibar, where Nungwi and Kendwa, Paje and the southeast-coast villages offer the classic Indian Ocean beach finale. Matemwe is a quieter option with excellent snorkeling off Mnemba Atoll.',
        bullets: [
          'Nungwi & Kendwa, Zanzibar \u2013 classic post-safari beach',
          'Matemwe \u2013 quiet base for Mnemba Atoll snorkeling',
          'Paje \u2013 kiteboarding and relaxed beach life',
        ],
      },
      'reviews': {
        title: 'Reviews',
        body: 'Travelers describe the first view from the crater rim as unforgettable and the density of animals on the floor as unlike anywhere else \u2014 many see rhino here after missing them elsewhere in Africa. The main complaint is the number of vehicles around big sightings in high season; reviewers suggest a full-day descent starting at 6am and staying on the crater rim to be first down.',
        bullets: [],
      },
      'wildlife': {
        title: 'Wildlife',
        body: 'Around 25,000 large mammals live permanently on the crater floor, including about 6,000 resident wildebeest, 4,000 zebra, 3,000 eland and 3,000 Grant\u2019s and Thomson\u2019s gazelles. Predators are exceptional: roughly 60\u201370 lions, healthy cheetah and leopard numbers, and large buffalo herds. Ngorongoro is Tanzania\u2019s best place to see the endangered black rhino \u2014 around 30 individuals \u2014 and the soda lake draws flocks of flamingo. Giraffe are notably absent, deterred by the crater\u2019s steep walls.',
        bullets: [
          'Black rhino \u2013 among Africa\u2019s best viewing odds',
          'Approximately 60\u201370 resident lions',
          'No giraffe \u2013 the one Big Five absence on the floor',
        ],
      },
      'birds': {
        title: 'Birds',
        body: 'More than 500 bird species occur across the conservation area. Lake Magadi on the crater floor clouds pink with lesser flamingos when conditions suit, while the highland forests host turacos, barbets and the rare Abbott\u2019s starling. Endemic regional specialties such as the rufous-tailed weaver and Fischer\u2019s lovebird appear on the plains to the north.',
        bullets: [
          'Lesser flamingos on Lake Magadi',
          'Abbott\u2019s starling \u2013 rare highland-forest endemic',
          'Schalow\u2019s turaco and Hartlaub\u2019s turaco in the rim forest',
        ],
      },
      'best-time': {
        title: 'Best Time To Visit',
        body: 'Ngorongoro is a year-round destination because the crater floor holds permanent water and resident game. June to October offers dry tracks and thin vegetation; January to February coincides with migration calving on the nearby Ndutu plains. From March to May the long rains bring mist over the rim and lush green landscapes with far fewer visitors.',
        bullets: [
          'Jun\u2013Oct: dry season, best crater-floor driving conditions',
          'Jan\u2013Feb: combine with Ndutu calving season',
          'Apr\u2013May: green season \u2014 fewer vehicles, discounted rates',
        ],
      },
      'weather-climate': {
        title: 'Weather & Climate',
        body: 'The crater rim sits at about 2,300m, so expect genuinely cool highland weather \u2014 mornings can drop below 10\u00b0C and mist often blankets the rim, while the floor 600m below is noticeably warmer at 22\u201327\u00b0C midday. Rains follow the Tanzanian pattern: short rains November\u2013December, long rains March\u2013May.',
        bullets: [],
      },
      'popular-routes': {
        title: 'Popular Routes',
        body: 'Ngorongoro anchors every northern-circuit itinerary. The classic route runs Arusha \u2013 Tarangire \u2013 Lake Manyara \u2013 Ngorongoro \u2013 Serengeti and back, usually over 5\u20138 days, with the crater visited either en route to the Serengeti or on the return leg. Many travelers overnight on the rim, descending at dawn, before continuing to Seronera.',
        bullets: [
          'Arusha \u2013 Ngorongoro \u2013 Serengeti \u2013 Ngorongoro (5\u20137 days)',
          'Arusha \u2013 Tarangire \u2013 Manyara \u2013 Ngorongoro \u2013 Serengeti (8 days)',
          'Crater + Ndutu calving special (Jan\u2013Feb, 6 days)',
        ],
      },
      'getting-there': {
        title: 'How To Get There',
        body: 'From Kilimanjaro International Airport (JRO) or Arusha, the crater rim at Lodoare Gate is a 3\u20134 hour drive on good tarmac via Mto wa Mbu and Karatu. Many tours combine the drive with Lake Manyara en route. Light-aircraft flights to Lake Manyara Airstrip cut the return trip. Conservation Area entry is US$71 per adult per day, plus a separate crater-service fee of US$299 per vehicle for a half-day descent.',
        bullets: [
          'By road: Arusha \u2192 Lodoare Gate \u2248 3.5 hours',
          'By air: Arusha \u2192 Lake Manyara airstrip \u2248 30 min + transfer',
          'Fees: US$71/person/day entry + US$299/vehicle crater descent',
        ],
      },
      'health-safety': {
        title: 'Malaria & Vaccinations',
        body: 'The cool crater rim (2,300m) is lower risk for mosquitoes, but the surrounding lowlands and crater floor still warrant prophylaxis, repellent and long sleeves at dusk. Yellow fever certification applies if arriving from an endemic country; hepatitis A, typhoid and standard travel vaccinations are recommended. Altitude is modest, but visitors sensitive to cool, damp conditions should pack warm layers.',
        bullets: [],
      },
      'staying-safe': {
        title: 'Staying Safe',
        body: 'Ngorongoro is an exceptionally safe destination with a strong ranger presence and controlled access. Remain in your vehicle on the crater floor \u2014 the grasslands hide buffalo and elephant \u2014 and only walk on designated rim and highland trails with an armed ranger. Camps escort guests between tent and mess after dark as standard practice.',
        bullets: [],
      },
    },
  },
  {
    slug: 'tanzania',
    name: 'Tanzania',
    country: 'Tanzania',
    type: 'COUNTRY',
    description:
      'Tanzania, with its three safari circuits, is one of Africa\u2019s top wildlife destinations. The popular Northern circuit incorporates bucket-list landmarks such as Serengeti National Park, Ngorongoro Crater and Mt Kilimanjaro. Repeat visitors might prefer the remote wilderness vibe of the Southern or Western circuits. For some beach time, the \u2018Spice Island\u2019 of Zanzibar is only a short flight away.',
    sections: {
      'overview': {
        title: 'Overview',
        body: 'Tanzania is Africa\u2019s ultimate safari country: home to the Serengeti migration, Ngorongoro Crater, Mount Kilimanjaro and 22 national parks plus the spice-scented beaches of Zanzibar. The Northern circuit (Serengeti, Ngorongoro, Tarangire, Lake Manyara, Kilimanjaro) is the classic first-time route; the Southern circuit (Nyerere, Ruaha, Mikumi) delivers wild, uncrowded walking safaris; the remote Western circuit (Katavi, Gombe, Mahale) offers chimp trekking and genuine off-grid wilderness.',
        bullets: [
          '22 national parks and 1 conservation area across three circuits',
          'Home of the Great Migration and Africa\u2019s highest mountain',
          'English widely spoken; currency Tanzanian shilling (TZS)',
        ],
      },
      'parks-reserves': {
        title: 'Parks & Reserves',
        body: 'Tanzania protects close to 38% of its land area. Beyond the headline Northern parks, Ruaha and Nyerere (Selous) anchor the South with superb predator densities and boat safaris, while Katavi and Mahale Mountains in the West see a fraction of the visitors. The Ngorongoro Conservation Area uniquely blends wildlife protection with Maasai pastoralism, and the Zanzibar archipelago adds marine parks and Jozani Forest\u2019s endemic red colobus.',
        bullets: [
          'Serengeti NP \u2013 Great Migration and Africa\u2019s densest lion population',
          'Ngorongoro Crater \u2013 easiest Big Five viewing in East Africa',
          'Ruaha NP \u2013 10% of the world\u2019s remaining lions',
          'Nyerere NP \u2013 boat safaris and wild dogs on the Rufiji River',
          'Mahale Mountains NP \u2013 chimpanzee trekking on Lake Tanganyika',
        ],
      },
      'things-to-do': {
        title: 'Things To Do',
        body: 'Game drives are just the start. Tanzania offers multiday treks up Kilimanjaro (5,895m) and its gentler cousin Mt Meru, chimpanzee trekking at Gombe and Mahale, walking and boat safaris in the southern parks, hot-air ballooning over the Serengeti, snorkeling and diving off Zanzibar and Mafia, and cultural encounters with Maasai, Hadzabe and Chaga communities.',
        bullets: [
          'Kilimanjaro treks via Machame, Lemosho or Marangu routes',
          'Chimp trekking at Gombe Stream and Mahale Mountains',
          'Balloon safaris over Serengeti and Tarangire',
          'Diving and dhow sailing in Zanzibar and Mafia',
        ],
      },
      'best-beaches': {
        title: 'Best Beaches',
        body: 'Tanzania\u2019s 1,400km Indian Ocean coastline and its islands rank among the world\u2019s finest. Zanzibar\u2019s Nungwi and Kendwa offer postcard sand and sunset dhow cruises; Paje and Jambiani bring kitesurfing and village calm; Pemba is the diver\u2019s island; and remote Mafia Island hosts whale sharks from October to February. Mainland gems like Pangani and Bagamoyo see almost no tourists.',
        bullets: [
          'Nungwi & Kendwa \u2013 swimming-friendly, liveliest stretches',
          'Paje & Jambiani \u2013 southeast coast kitesurf and quiet villages',
          'Mafia Island \u2013 whale sharks and Chole Bay marine park',
        ],
      },
      'reviews': {
        title: 'Reviews',
        body: 'Tanzania scores among the highest-rated safari countries in traveler reviews, with the Serengeti and Ngorongoro repeatedly described as trip-of-a-lifetime destinations. Reviewers praise guide quality and the variety possible in one itinerary \u2014 bush then beach \u2014 while flagging park-fee costs and traffic around migration sightings as the few negatives.',
        bullets: [],
      },
      'wildlife': {
        title: 'Wildlife',
        body: 'Tanzania holds roughly 20% of Africa\u2019s large-mammal population. The annual migration involves 1.5 million wildebeest and hundreds of thousands of zebra; the country shelters about a third of all African lions and a significant share of the world\u2019s remaining wild dogs, found in Nyerere, Ruaha and Katavi. Elephant densities are high in Tarangire, black rhino persist in Ngorongoro, and chimpanzees live at Gombe and Mahale.',
        bullets: [
          'Big Five in the Northern circuit parks',
          'Around a third of Africa\u2019s lions live in Tanzania',
          'Wild dogs best seen in Ruaha and Nyerere',
        ],
      },
      'birds': {
        title: 'Birds',
        body: 'With over 1,100 recorded species \u2014 including more than 20 country endemics \u2014 Tanzania is a top-tier birding destination. The Eastern Arc Mountains (Udzungwa, Usambara) hold endemics like the Udzungwa forest partridge, while the Serengeti plains and Rift Valley lakes deliver spectacular raptor and flamingo displays. November to April is peak season, when migrants arrive in breeding plumage.',
        bullets: [
          'Over 1,100 species and 20+ endemics',
          'Usambara and Udzungwa mountains for forest endemics',
          'Flamingo spectacle at Lake Natron and Empakaai',
        ],
      },
      'best-time': {
        title: 'Best Time To Visit',
        body: 'June to October is the prime dry season across the country \u2014 ideal for wildlife viewing and the only comfortable time for Kilimanjaro summit attempts. January to February brings the wildebeest calving season to the southern Serengeti. The Southern and Western circuits are best avoided in the wet months of March to May, though the Northern parks remain productive, and Zanzibar is pleasant whenever the rains pause.',
        bullets: [
          'Jun\u2013Oct: dry season, best game viewing nationwide',
          'Jan\u2013Feb: calving season in the southern Serengeti',
          'Jul\u2013Oct: Mara River crossings in the far north',
        ],
      },
      'weather-climate': {
        title: 'Weather & Climate',
        body: 'Coastal and island Tanzania is hot and humid year-round (28\u201332\u00b0C), while safari parks on the plateau enjoy warm days (23\u201328\u00b0C) and cool nights. The main rains fall March to May, with a shorter wet season in November and December. Altitude matters: Ngorongoro\u2019s rim and Kilimanjaro\u2019s slopes are genuinely cold, so layers are essential on any itinerary.',
        bullets: [],
      },
      'popular-routes': {
        title: 'Popular Routes',
        body: 'The northern safari circuit is the most traveled route: Arusha \u2013 Tarangire \u2013 Lake Manyara \u2013 Ngorongoro \u2013 Serengeti, typically over 5\u201310 days and often ending with a Zanzibar flight from Arusha. Southern routes pair Nyerere and Ruaha out of Dar es Salaam for week-long fly-in safaris, while the western route to Katavi and Mahale suits returning safari veterans.',
        bullets: [
          'Northern circuit: Arusha \u2013 Tarangire \u2013 Ngorongoro \u2013 Serengeti (7 days)',
          'Bush & beach: Northern circuit + Zanzibar (10\u201312 days)',
          'Southern safari: Dar \u2013 Nyerere \u2013 Ruaha fly-in (7 days)',
        ],
      },
      'getting-there': {
        title: 'How To Get There',
        body: 'Most international flights land at Julius Nyerere International Airport (DAR) in Dar es Salaam or Kilimanjaro International Airport (JRO) between Arusha and Moshi \u2014 the latter serving the Northern circuit. Domestic carriers connect major parks via an extensive network of bush airstrips. Zanzibar receives direct regional and some international flights. Visa-on-arrival and e-visa are available to most nationalities.',
        bullets: [
          'JRO for the Northern circuit; DAR for the South and coast',
          'Domestic bush flights link Serengeti, Ruaha, Nyerere airstrips',
          'E-visa available online; US$50\u2013100 for most nationalities',
        ],
      },
      'health-safety': {
        title: 'Malaria & Vaccinations',
        body: 'Malaria is present across Tanzania below 1,800m \u2014 prophylaxis is strongly advised for all safari areas, with repellent and long clothing at dusk. A yellow fever certificate is mandatory if arriving from an endemic country. Recommended vaccinations include hepatitis A, typhoid, tetanus and rabies (for remote circuits). Zanzibar requires the same precautions as the mainland coast.',
        bullets: [],
      },
      'staying-safe': {
        title: 'Staying Safe',
        body: 'Tanzania is one of East Africa\u2019s most stable and welcoming countries, and its parks are extremely safe with a strong ranger presence. In cities, take normal precautions against petty theft \u2014 use registered taxis after dark and keep valuables out of sight. On safari, follow guide instructions around wildlife; on Kilimanjaro, choose KPAP-affiliated operators for a safe, ethical trek.',
        bullets: [],
      },
    },
  },
  {
    slug: 'kenya',
    name: 'Kenya',
    country: 'Kenya',
    type: 'COUNTRY',
    description:
      'Regardless of whether this is your first time on safari or you\u2019re a safari veteran, Kenya is a fantastic place to go looking for wildlife. The Masai Mara National Reserve and surrounding conservancies get all the attention for big cat sightings and the annual wildebeest migration. But Kenya has numerous world-class parks to explore, and it\u2019s also an excellent place to relax on a beach holiday once your safari is over.',
    sections: {
      'overview': {
        title: 'Overview',
        body: 'Kenya is the birthplace of the safari and remains one of Africa\u2019s most rewarding wildlife destinations. The Masai Mara anchors the famous migration season, Amboseli delivers textbook elephant-with-Kilimanjaro photography, and Samburu\u2019s arid north hosts unique \u201CSpecial Five\u201D species. Add the Rift Valley lakes, Tsavo\u2019s red elephants and a coastline of white-sand beaches, and Kenya covers every safari style from budget camping to ultra-luxury.',
        bullets: [
          'Home of the original safari \u2014 over a century of guiding heritage',
          'Big Five in most major parks; migration Jul\u2013Oct in the Mara',
          'Nairobi is the safari hub \u2014 parks within an hour\u2019s flight',
        ],
      },
      'parks-reserves': {
        title: 'Parks & Reserves',
        body: 'Kenya protects 23 national parks and 28 national reserves. The Masai Mara and its community conservancies headline the southwest; Amboseli sits beneath Kilimanjaro in the south; Tsavo East and West together form one of the largest protected areas on Earth; and the northern reserves of Samburu, Buffalo Springs and Shaba shelter arid-country endemics. Lake Nakuru is a rhino sanctuary, and Ol Pejeta Conservancy hosts the last northern white rhinos.',
        bullets: [
          'Masai Mara NR \u2013 big cats and the Great Migration',
          'Amboseli NP \u2013 big tusker elephants under Kilimanjaro',
          'Samburu/Buffalo Springs \u2013 Grevy\u2019s zebra, gerenuk, reticulated giraffe',
          'Tsavo East & West \u2013 vast wilderness and red-dust elephants',
        ],
      },
      'things-to-do': {
        title: 'Things To Do',
        body: 'Beyond classic game drives, Kenya offers hot-air balloon safaris over the Mara, walking and camel safaris in the north, rhino tracking on foot at Ol Pejeta, chimpanzee viewing at Sweetwaters, birding around the Rift Valley lakes, mountain climbing on Mt Kenya, and world-class kitesurfing at Diani. Cultural visits to Maasai and Samburu communities are among Africa\u2019s most authentic.',
        bullets: [
          'Balloon safari and champagne breakfast in the Mara',
          'Foot-based rhino tracking at Ol Pejeta Conservancy',
          'Mt Kenya trekking \u2014 Africa\u2019s second-highest peak',
          'Kitesurfing and diving on the Diani and Watamu coast',
        ],
      },
      'best-beaches': {
        title: 'Best Beaches',
        body: 'Kenya\u2019s 536km coastline combines white sand, marine parks and Swahili history. Diani Beach is the country\u2019s flagship \u2014 15km of powder sand south of Mombasa; Watamu pairs turtle-filled creeks with a marine national park; Kilifi is the quiet middle ground; and the Lamu archipelago offers a car-free, centuries-old Swahili world. Domestic flights link the Mara directly to Ukunda and Malindi airstrips.',
        bullets: [
          'Diani Beach \u2013 Kenya\u2019s finest white-sand strand',
          'Watamu \u2013 marine park snorkeling and Mida Creek mangroves',
          'Lamu \u2013 UNESCO-listed Swahili island culture',
        ],
      },
      'reviews': {
        title: 'Reviews',
        body: 'Kenya earns high marks for guide expertise, migration drama and the ease of combining bush and beach. Reviewers praise the conservancy model for exclusivity and night drives, and note that the Mara itself can feel crowded in August\u2013September \u2014 most recommend conservancy stays or shoulder-season travel for a quieter experience.',
        bullets: [],
      },
      'wildlife': {
        title: 'Wildlife',
        body: 'Kenya hosts all the classic safari species, with roughly 850 lions in the Mara ecosystem alone and Amboseli\u2019s celebrated big-tusker elephants. The July\u2013October migration brings over a million wildebeest into the Mara from the Serengeti. Rare species have dedicated strongholds: Grevy\u2019s zebra and gerenuk in Samburu, black and white rhino at Ol Pejeta and Lake Nakuru, and sitatunga in Saiwa Swamp.',
        bullets: [
          'Big Five reliably seen in Mara, Amboseli, Nakuru and Tsavo',
          'Special Five of the arid north: Grevy\u2019s zebra, gerenuk, oryx, Somali ostrich, reticulated giraffe',
          'Migration river crossings Jul\u2013Oct',
        ],
      },
      'birds': {
        title: 'Birds',
        body: 'Kenya\u2019s checklist of over 1,100 species is among the largest in Africa, crammed into habitats from coral reefs to glacial peaks. The Rift Valley lakes \u2014 Bogoria, Nakuru, Elmenteita \u2014 host flamingo spectacles and pelican flocks; Kakamega Forest shelters Central African lowland species at their eastern limit; and the arid north adds Somali-masai endemics. November to April is best for migrants and breeding plumage.',
        bullets: [
          'Over 1,100 species \u2014 fourth-longest checklist in Africa',
          'Flamingos and pelicans on the Rift Valley lakes',
          'Kakamega Forest \u2013 unique Guineo-Congolian rainforest birding',
        ],
      },
      'best-time': {
        title: 'Best Time To Visit',
        body: 'January to March and June to October are the prime windows \u2014 dry, sunny and excellent for game viewing. July to October adds the migration in the Mara and is peak season, requiring early bookings. April\u2013May\u2019s long rains bring dramatic afternoon storms and lush scenery at low-season prices; wildlife remains good, though some roads and camps in the north become difficult.',
        bullets: [
          'Jul\u2013Oct: migration and peak game viewing',
          'Jan\u2013Mar: dry, hot and less crowded',
          'Apr\u2013May: long rains \u2014 lowest rates, green season',
        ],
      },
      'weather-climate': {
        title: 'Weather & Climate',
        body: 'Kenya straddles the equator, but altitude tempers the heat: Nairobi and the central highlands sit at 1,500\u20132,000m with pleasant 20\u201326\u00b0C days and cool nights, while the coast is hot and humid and the arid north regularly exceeds 35\u00b0C. Rains arrive in two seasons \u2014 long rains March to May and short rains November to December \u2014 usually as afternoon thunderstorms.',
        bullets: [],
      },
      'popular-routes': {
        title: 'Popular Routes',
        body: 'The classic Kenya circuit runs Nairobi \u2013 Amboseli \u2013 Lake Nakuru \u2013 Masai Mara over 6\u20138 days. Short fly-in safaris to the Mara suit long weekends; the grand northern route adds Samburu and Ol Pejeta; and the coast safari pairs the Mara with Diani or Watamu. Cross-border itineraries link the Mara to Tanzania\u2019s Serengeti via the Isebania crossing.',
        bullets: [
          'Nairobi \u2013 Amboseli \u2013 Nakuru \u2013 Mara (7 days)',
          'Nairobi \u2013 Samburu \u2013 Ol Pejeta \u2013 Mara (8\u201310 days)',
          'Mara + Diani Beach bush-and-beach (8 days)',
        ],
      },
      'getting-there': {
        title: 'How To Get There',
        body: 'Jomo Kenyatta International Airport (NBO) in Nairobi is East Africa\u2019s busiest hub with direct flights from Europe, the Middle East and Asia. Wilson Airport handles the domestic hopper flights to Mara, Amboseli, Samburu and coastal airstrips. Mombasa\u2019s Moi International serves beach arrivals. E-visas are issued online and at arrival for most nationalities; park fees are card-payable at the gates.',
        bullets: [
          'NBO for international arrivals; WIL for bush flights',
          'Domestic flights to Mara, Amboseli, Samburu, coast \u2264 1.5h',
          'E-visa: evisa.go.ke \u2014 apply before travel',
        ],
      },
      'health-safety': {
        title: 'Malaria & Vaccinations',
        body: 'Malaria occurs in most safari areas below 2,000m \u2014 take prophylaxis, use DEET repellent and cover up at dusk; Nairobi and the highlands are lower risk. A yellow fever certificate is required when arriving from endemic countries, and hepatitis A, typhoid and routine vaccinations are recommended. Tap water is not reliably safe \u2014 stick to bottled or filtered water.',
        bullets: [],
      },
      'staying-safe': {
        title: 'Staying Safe',
        body: 'Kenya\u2019s safari circuits are safe, mature tourism destinations with professional ranger and security networks. Exercise normal urban caution in Nairobi \u2014 avoid walking at night, use ride-hailing apps and keep valuables secure. In parks, follow your guide\u2019s lead around wildlife and never exit vehicles except at designated points. Coastal resorts and conservancies maintain excellent security records.',
        bullets: [],
      },
    },
  },
  {
    slug: 'botswana',
    name: 'Botswana',
    country: 'Botswana',
    type: 'COUNTRY',
    description:
      'In and around the Okavango Delta, which can be discovered on an unforgettable game drive or mokoro trip. Elsewhere, Chobe National Park, Moremi Game Reserve and the Central Kalahari Game Reserve are world-class safari destinations, combining stunning landscapes with exceptional wildlife. Botswana is also excellent for self-drive safaris.',
    sections: {
      'overview': {
        title: 'Overview',
        body: 'Botswana practices high-value, low-volume tourism, and the result is Africa\u2019s most exclusive safari experience. The Okavango Delta \u2014 a 15,000km\u00b2 inland water wonderland and UNESCO World Heritage Site \u2014 offers mokoro trips through papyrus channels, while Chobe holds the continent\u2019s largest elephant population and the Kalahari\u2019s black-maned lions stalk the vast Central Kalahari Game Reserve. English is the official language and the pula is among Africa\u2019s most stable currencies.',
        bullets: [
          'Okavango Delta \u2013 UNESCO-listed inland delta, best May\u2013Oct',
          'Roughly 130,000 elephants \u2014 Africa\u2019s largest population',
          'High-value/low-volume policy keeps crowds thin',
        ],
      },
      'parks-reserves': {
        title: 'Parks & Reserves',
        body: 'Botswana\u2019s protected network is dominated by the Okavango Delta and Moremi Game Reserve at its heart, Chobe National Park in the north, the immense Central Kalahari Game Reserve (52,800km\u00b2), the Makgadikgadi and Nxai Pan salt-pan parks, and the remote Kgalagadi Transfrontier Park. Private concession areas around the delta offer night drives, walking safaris and off-road tracking unavailable in the national parks.',
        bullets: [
          'Moremi Game Reserve \u2013 the delta\u2019s wildlife core',
          'Chobe NP \u2013 river cruises past thousands of elephants',
          'Central Kalahari GR \u2013 black-maned lions on fossil riverbeds',
          'Makgadikgadi Pans \u2013 zebra migration and meerkats',
        ],
      },
      'things-to-do': {
        title: 'Things To Do',
        body: 'Gliding silently through delta channels in a mokoro (dugout canoe) is Botswana\u2019s signature activity, complemented by motorboat safaris, game drives and water-camp fly fishing for tigerfish. Chobe offers famous sunset river cruises; the Kalahari delivers San (Bushmen) guided walks and meerkat encounters at the pans; and the country\u2019s superb infrastructure makes it Africa\u2019s premier self-drive destination.',
        bullets: [
          'Mokoro excursions through the delta\u2019s channels',
          'Chobe River sunset cruise among bathing elephants',
          'Meerkat and quad-bike adventures on the Makgadikgadi Pans',
          'Fully outfitted 4x4 self-drive safaris',
        ],
      },
      'best-beaches': {
        title: 'Best Beaches',
        body: 'Landlocked Botswana has no coastline \u2014 but its water experiences are unique. Travelers craving sand pair Botswana with Zimbabwe\u2019s Victoria Falls (a 90-minute drive from Chobe), Namibia\u2019s Skeleton Coast, or fly via Johannesburg to Mozambique\u2019s Bazaruto Archipelago for the classic delta-then-dhow combination.',
        bullets: [
          'Victoria Falls, Zimbabwe \u2013 easy add-on from Chobe',
          'Bazaruto Archipelago, Mozambique \u2013 fly-in beach extension',
          'Makgadikgadi Pans \u2013 surreal salt-flats \u201Cbeach\u201D under the stars',
        ],
      },
      'reviews': {
        title: 'Reviews',
        body: 'Botswana consistently earns the highest satisfaction ratings in African travel reviews, with guests praising the exclusivity, the quality of guiding and the romance of water camps reachable only by light aircraft. The most common complaint is price \u2014 delta camps run US$600\u20131,500 per person per night \u2014 though reviewers overwhelmingly agree it is worth it.',
        bullets: [],
      },
      'wildlife': {
        title: 'Wildlife',
        body: 'The Okavango Delta supports all of the Big Five plus African wild dogs at their highest density anywhere \u2014 the delta and Linyanti are the best places on Earth to see them. Chobe\u2019s riverfront teems with up to 120,000 elephants in the dry season, the Kalahari holds desert-adapted black-maned lions and brown hyenas, and the Makgadikgadi hosts Africa\u2019s second-largest zebra migration.',
        bullets: [
          'Wild dogs \u2013 world\u2019s best sighting odds in the delta',
          'Chobe \u2013 Africa\u2019s largest elephant concentration',
          'Zebra migration between Okavango and Makgadikgadi (Dec\u2013Mar)',
        ],
      },
      'birds': {
        title: 'Birds',
        body: 'Botswana counts over 590 bird species, with the Okavango\u2019s wetlands the undoubted centerpiece: slaty egrets, wattled cranes, Pel\u2019s fishing owls and African skimmers patrol the channels. The Kalahari adds arid specialists such as Kori bustards, crimson-breasted shrikes and Burchell\u2019s sandgrouse. November to March brings migrants and the delta\u2019s breeding season displays.',
        bullets: [
          'Pel\u2019s fishing owl \u2013 delta twilight specialty',
          'Slaty egret and wattled crane in the permanent swamps',
          'Carmine bee-eater colonies on the sandbanks (Sep\u2013Nov)',
        ],
      },
      'best-time': {
        title: 'Best Time To Visit',
        body: 'May to October is the delta\u2019s flood season coinciding with the dry winter \u2014 water levels peak, game concentrates on the islands and mokoro trips are at their best; July to October in Chobe is elephant spectacle season. The green season of November to April brings dramatic storms, newborn antelope, migrant birds and sharply discounted rates, though some delta camps close in the wettest months.',
        bullets: [
          'May\u2013Oct: peak flood and dry season \u2014 book a year ahead',
          'Nov\u2013Apr: green season, lower rates, birding at its best',
          'Dec\u2013Mar: zebra migration on the Makgadikgadi grasslands',
        ],
      },
      'weather-climate': {
        title: 'Weather & Climate',
        body: 'Botswana\u2019s climate is semi-arid with big temperature swings: Kalahari winter nights (Jun\u2013Aug) drop near freezing while October afternoons top 40\u00b0C. Days in the dry winter season are mild and clear \u2014 perfect game-viewing weather. The single wet season runs November to March, delivering brief but violent afternoon thunderstorms that transform the pans into grasslands.',
        bullets: [],
      },
      'popular-routes': {
        title: 'Popular Routes',
        body: 'The classic fly-in delta route hops between two or three water and land camps plus Chobe, over 6\u201310 days, usually booked as a package from Maun or Kasane. Self-drivers follow the Maun \u2013 Moremi \u2013 Savuti \u2013 Chobe 4x4 trail. Popular combinations add Victoria Falls and/or the Makgadikgadi Pans, or continue south to the Kgalagadi.',
        bullets: [
          'Fly-in delta: Maun \u2013 water camp \u2013 land camp \u2013 Chobe (7 days)',
          'Self-drive: Maun \u2013 Moremi \u2013 Savuti \u2013 Chobe (8\u201310 days)',
          'Delta + Vic Falls + Caprivi combo (10 days)',
        ],
      },
      'getting-there': {
        title: 'How To Get There',
        body: 'Most visitors arrive via Sir Seretse Khama International Airport (GBE) in Gaborone or, for safari circuits, fly into Maun (MUB) or Kasane (BBK) from Johannesburg or Gaborone. Light-aircraft charters connect Maun to delta airstrips \u2014 the only way in to water camps. Chobe is a 90-minute drive from Victoria Falls or Livingstone airports. Visas are visa-free or on arrival for most Western nationalities.',
        bullets: [
          'Maun (MUB) is the delta gateway; Kasane (BBK) for Chobe',
          'Light-aircraft transfers to delta camps \u2264 45 min',
          'Johannesburg offers the best international connections',
        ],
      },
      'health-safety': {
        title: 'Malaria & Vaccinations',
        body: 'Northern Botswana \u2014 the Okavango, Chobe and Linyanti \u2014 is a malaria area during and after the wet season (November to June); prophylaxis is recommended in the delta year-round as waters sustain mosquitoes. The Kalahari is malaria-free. A yellow fever certificate is needed only when arriving from endemic countries; hepatitis A and typhoid vaccinations are standard advice.',
        bullets: [],
      },
      'staying-safe': {
        title: 'Staying Safe',
        body: 'Botswana is among Africa\u2019s safest and most politically stable countries, with a low crime rate and excellent tourism infrastructure. Wildlife presents the only real risks \u2014 elephants are genuinely dangerous: keep distance on foot, never walk between camps at night without an escort, and follow guides\u2019 instructions around hippos and crocodiles on the waterways. Self-drivers should respect the parks\u2019 strict off-road and night-driving rules.',
        bullets: [],
      },
    },
  },
  {
    slug: 'south-africa',
    name: 'South Africa',
    country: 'South Africa',
    type: 'COUNTRY',
    description:
      'South Africa is one of Africa\u2019s great wildlife destinations. Vast Kruger National Park has an abundance of animals and is one of the continent\u2019s iconic attractions. For outdoor adventure, the Blyde River Canyon is the third-largest canyon on the planet, and the jagged peaks of the Drakensberg Mountains punch into the sky. Cape Town hums with an urban beat and is fringed by white sandy beaches.',
    sections: {
      'overview': {
        title: 'Overview',
        body: 'South Africa is the world in one country \u2014 Big Five safaris in Kruger and the private Sabi Sand reserves, Cape Town\u2019s Table Mountain and Winelands, the Drakensberg amphitheater, and the Garden Route\u2019s coastline, all connected by excellent roads and domestic flights. It is the easiest African safari destination for first-timers: malaria-free parks, superb infrastructure and a weak currency make it outstanding value.',
        bullets: [
          'Malaria-free Big Five viewing in Madikwe, Addo and Eastern Cape',
          'Kruger + Sabi Sand deliver Africa\u2019s best leopard viewing',
          'World-class food, wine and Cape Town in one itinerary',
        ],
      },
      'parks-reserves': {
        title: 'Parks & Reserves',
        body: 'Kruger National Park (19,485km\u00b2) is the flagship, ringed by exclusive private reserves \u2014 Sabi Sand, MalaMala, Thornybush, Timbavati \u2014 where off-road driving and night safaris produce exceptional sightings. Further afield, Madikwe and Pilanesberg (malaria-free, near Johannesburg), Hluhluwe-iMfolozi (rhino cradle), iSimangaliso Wetland Park and Addo Elephant NP each offer distinct experiences.',
        bullets: [
          'Kruger NP \u2013 self-drive and lodge safaris in one park',
          'Sabi Sand & MalaMala \u2013 legendary leopards, off-road drives',
          'Madikwe GR \u2013 malaria-free Big Five near Jo\u2019burg',
          'Hluhluwe-iMfolozi \u2013 saved the white rhino from extinction',
        ],
      },
      'things-to-do': {
        title: 'Things To Do',
        body: 'Safaris come in every format \u2014 self-drive Kruger, guided open-vehicle drives, luxury lodge stays and walking trails. Beyond the bush: hike the Blyde River Canyon and Drakensberg, drive the Garden Route, cage-dive with great whites from Gansbaai, tour Cape winelands, visit Robben Island and whale-watch in Hermanus (Jun\u2013Nov). Night drives and bush walks are standard in the private reserves.',
        bullets: [
          'Sabi Sand game drives \u2013 off-road and after dark',
          'Garden Route road trip from Cape Town',
          'Whale watching in Hermanus and Hermanus-style bays',
          'Table Mountain cableway and Cape Point day trips',
        ],
      },
      'best-beaches': {
        title: 'Best Beaches',
        body: 'South Africa has 2,800km of coastline with genuine highlights. Cape Town\u2019s Clifton and Camps Bay are urban white-sand icons; Boulders Beach hosts a resident African penguin colony; the Garden Route offers Plettenberg Bay and Knysna; and KwaZulu-Natal\u2019s warm waters suit swimming and diving at Sodwana Bay, gateway to one of the world\u2019s southernmost coral reefs.',
        bullets: [
          'Camps Bay & Clifton \u2013 Cape Town\u2019s glitzy beaches',
          'Boulders Beach \u2013 swim alongside African penguins',
          'Sodwana Bay \u2013 coral-reef diving in a World Heritage park',
        ],
      },
      'reviews': {
        title: 'Reviews',
        body: 'Reviewers love South Africa\u2019s combination of value, ease and variety \u2014 safari, city and coast in one trip without malaria pills. Sabi Sand leopard sightings earn near-universal praise. Common cautions: self-drive visitors should observe Kruger\u2019s gate times strictly, and visitors are advised to stay alert in major cities, especially Johannesburg, using private transfers after dark.',
        bullets: [],
      },
      'wildlife': {
        title: 'Wildlife',
        body: 'Kruger alone supports 147 mammal species, including around 12,000 elephants, 2,000 lions and Africa\u2019s best-viewed leopards in the adjacent private reserves. White rhinos are a conservation success story here (though poaching remains a battle), cheetah and wild dog roam the open savannah, and the coast adds southern right whales, great white sharks and Cape fur seal colonies.',
        bullets: [
          'Big Five in Kruger, Sabi Sand, Madikwe and Addo',
          'Leopard viewing in Sabi Sand is world-famous',
          'Marine Big Five: whale, shark, seal, dolphin, penguin',
        ],
      },
      'birds': {
        title: 'Birds',
        body: 'South Africa lists over 850 species, including dozens of endemics found nowhere else. Kruger offers easy raptor and roller viewing, the Cape\u2019s fynbos hosts Cape sugarbirds and orange-breasted sunbirds, and the Western Cape is a seabird mecca \u2014 Algoa Bay and Cape Town pelagics record albatrosses and petrels. The Drakensberg adds high-altitude specials like the bearded vulture.',
        bullets: [
          'African penguin and Cape gannet colonies',
          'Endemics: Cape sugarbird, orange-breasted sunbird, Protea canary',
          'Pelagic trips from Cape Town for albatrosses',
        ],
      },
      'best-time': {
        title: 'Best Time To Visit',
        body: 'May to September is prime safari season \u2014 dry, cool and the best time for Kruger and the private reserves. Whale season runs June to November, spring wildflowers bloom in Namaqualand in August\u2013September, and Cape Town is loveliest in the dry summer (November to March). Because seasons complement each other, South Africa works year-round with sensible planning.',
        bullets: [
          'May\u2013Sep: best Kruger game viewing',
          'Jun\u2013Nov: southern right whales along the Cape coast',
          'Nov\u2013Mar: Cape Town summer and Garden Route season',
        ],
      },
      'weather-climate': {
        title: 'Weather & Climate',
        body: 'Lying mostly in the temperate Southern Hemisphere, South Africa has reversed seasons. The interior plateau enjoys hot wet summers and dry sunny winters; Cape Town has a Mediterranean pattern with winter rain; KwaZulu-Natal is subtropical. Kruger winter days (25\u00b0C) are ideal for game drives but mornings are cold \u2014 pack warm layers for open vehicles.',
        bullets: [],
      },
      'popular-routes': {
        title: 'Popular Routes',
        body: 'The most popular itinerary is the Panorama Route plus Kruger and Sabi Sand from Johannesburg (4\u20136 days), often combined with Victoria Falls or Cape Town. The Cape classics \u2014 Table Mountain, Winelands, Cape Point \u2014 take 3\u20134 days, and the Garden Route stretches from Cape Town to Port Elizabeth over 5\u20137 days. KwaZulu-Natal links Hluhluwe, iSimangaliso and the Drakensberg.',
        bullets: [
          'Jo\u2019burg \u2013 Panorama Route \u2013 Kruger/Sabi Sand (5 days)',
          'Cape Town + Winelands + Hermanus (4 days)',
          'Garden Route self-drive Cape Town \u2013 PE (6 days)',
        ],
      },
      'getting-there': {
        title: 'How To Get There',
        body: 'O.R. Tambo International Airport (JNB) in Johannesburg is Africa\u2019s busiest hub; Cape Town International (CPT) is the gateway for the west. Kruger is a 50-minute hop to Skukuza (SKK) or Hoedspruit (HDS) or a scenic 5-hour drive. Domestic low-cost carriers connect all major cities cheaply. Most Western nationalities receive visa-free entry for up to 90 days.',
        bullets: [
          'JNB for safari routes; CPT for the Cape and Garden Route',
          'Fly Jo\u2019burg \u2192 Skukuza/Hoedspruit to land inside Kruger country',
          'Visa-free entry for US, UK, EU and most visitors (90 days)',
        ],
      },
      'health-safety': {
        title: 'Malaria & Vaccinations',
        body: 'Kruger and northeastern KwaZulu-Natal are low-risk malaria areas in the wet summer months \u2014 prophylaxis is optional but repellent is wise; the rest of the country, including Madikwe, Pilanesberg, the Eastern Cape reserves and Cape Town, is entirely malaria-free. No yellow fever certificate is required unless arriving from an endemic country; routine vaccinations suffice for most visits.',
        bullets: [],
      },
      'staying-safe': {
        title: 'Staying Safe',
        body: 'South Africa\u2019s parks and tourist areas are safe, but urban crime requires street smarts: use private transfers or ride-hailing apps at night, avoid walking in city centers, keep car doors locked and never stop for hitchhikers on the N-series highways. In reserves, follow ranger instructions \u2014 baboons and hippos cause more incidents than predators. Emergency services are excellent in cities.',
        bullets: [],
      },
    },
  },
];

async function main() {
  console.log('Seeding destination guide sections\u2026');
  let sectionCount = 0;

  for (const dest of DATA) {
    const parent = await prisma.destination.upsert({
      where: { slug: dest.slug },
      update: {
        name: dest.name,
        country: dest.country,
        type: dest.type,
        description: dest.description,
        latitude: dest.latitude,
        longitude: dest.longitude,
      },
      create: {
        name: dest.name,
        slug: dest.slug,
        country: dest.country,
        type: dest.type,
        description: dest.description,
        latitude: dest.latitude,
        longitude: dest.longitude,
      },
    });

    for (const key of SECTIONS) {
      const s = dest.sections[key];
      if (!s) continue;
      await prisma.destinationSection.upsert({
        where: { destinationId_key: { destinationId: parent.id, key } },
        update: { title: s.title, body: s.body, bulletItems: s.bullets ?? [] },
        create: {
          destinationId: parent.id,
          key,
          title: s.title,
          body: s.body,
          bulletItems: s.bullets ?? [],
          sortOrder: SECTIONS.indexOf(key),
        },
      });
      sectionCount++;
    }
    console.log(`  \u2713 ${dest.name}: ${Object.keys(dest.sections).length} sections`);
  }

  console.log(`Done. ${sectionCount} destination sections seeded.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
