import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Sun, TrendingUp, Play } from 'lucide-react';

export const dynamic = 'force-dynamic';

const fallbackCountries = [
  {
    id: 'c1',
    name: 'Botswana',
    slug: 'botswana',
    reviews: 372,
    rating: 4.8,
    description: 'In and around the Okavango Delta, which can be discovered on an unforgettable game drive or mokoro trip. Elsewhere, Chobe National Park, Moremi Game Reserve and the Central Kalahari Game Reserve are world-class safari destinations, combining stunning landscapes with exceptional wildlife. Botswana is also excellent for self-drive safaris.',
    rates: '$193 to $878 per day',
    bestTime: 'April to October (Okavango, Moremi, Chobe), December to May (Central Kalahari, Khutse, Kgalagadi)',
    highSeason: 'July to October (Only Chobe gets crowded)',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80',
    toursCount: 557,
    parks: [
      { name: 'Chobe National Park', slug: 'chobe-national-park' },
      { name: 'Okavango Delta', slug: 'okavango-delta' },
      { name: 'Moremi Game Reserve', slug: 'moremi-game-reserve' },
      { name: 'Central Kalahari Game Reserve', slug: 'central-kalahari-game-reserve' },
      { name: 'Makgadikgadi Pans National Park', slug: 'makgadikgadi-pans-national-park' },
      { name: 'Nxai Pan National Park', slug: 'nxai-pan-national-park' }
    ],
    totalParks: 15
  },
  {
    id: 'c2',
    name: 'Kenya',
    slug: 'kenya',
    reviews: 1752,
    rating: 4.6,
    description: 'Regardless of whether this is your first time on safari or you\'re a safari veteran, Kenya is a fantastic place to go looking for wildlife. The Masai Mara National Reserve and surrounding conservancies get all the attention for big cat sightings and the annual wildebeest migration. But Kenya has numerous world-class parks to explore, and it\'s also an excellent place to relax on a beach holiday once your safari is over.',
    rates: '$173 to $696 per day',
    bestTime: 'June to October and January and February',
    highSeason: 'July to October and December to March',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=400&q=80',
    toursCount: 3113,
    parks: [
      { name: 'Amboseli National Park', slug: 'amboseli-national-park' },
      { name: 'Lake Nakuru National Park', slug: 'lake-nakuru-national-park' },
      { name: 'Masai Mara National Reserve', slug: 'masai-mara-national-reserve' },
      { name: 'Samburu National Reserve', slug: 'samburu-national-reserve' },
      { name: 'Buffalo Springs National Reserve', slug: 'buffalo-springs-national-reserve' },
      { name: 'Tsavo East National Park', slug: 'tsavo-east-national-park' }
    ],
    totalParks: 31
  },
  {
    id: 'c3',
    name: 'South Africa',
    slug: 'south-africa',
    reviews: 1320,
    rating: 4.6,
    description: 'South Africa is one of Africa\'s great wildlife destinations. Vast Kruger National Park has an abundance of animals and is one of the continent\'s iconic attractions. For outdoor adventure, the Blyde River Canyon is the third-largest canyon on the planet, and the jagged peaks of the Drakensberg Mountains punch into the sky. Cape Town hums with an urban beat and is fringed by white sandy beaches.',
    rates: '$187 to $917 per day',
    bestTime: 'May to September (Most parks), October to March (Cape Town)',
    highSeason: 'October to March (Crowded during school holidays)',
    image: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=400&q=80',
    toursCount: 1086,
    parks: [
      { name: 'Kruger National Park', slug: 'kruger-national-park' },
      { name: 'MalaMala Game Reserve', slug: 'malamala-game-reserve' },
      { name: 'Phinda Private Game Reserve', slug: 'phinda-private-game-reserve' },
      { name: 'Sabi Sand Nature Reserve', slug: 'sabi-sand-nature-reserve' },
      { name: 'Hluhluwe-iMfolozi Park', slug: 'hluhluwe-imfolozi-park' },
      { name: 'Addo Elephant National Park', slug: 'addo-elephant-national-park' }
    ],
    totalParks: 50
  },
  {
    id: 'c4',
    name: 'Tanzania',
    slug: 'tanzania',
    reviews: 2172,
    rating: 4.8,
    description: 'Tanzania, with its three safari circuits, is one of Africa\'s top wildlife destinations. The popular Northern circuit incorporates bucket-list landmarks such as Serengeti National Park, Ngorongoro Crater and Mt Kilimanjaro. Repeat visitors might prefer the remote wilderness vibe of the Southern or Western circuits. For some beach time, the \'Spice Island\' of Zanzibar is only a short flight away.',
    rates: '$229 to $659 per day',
    bestTime: 'June to October; January to February (For wildebeest calving)',
    highSeason: 'July to March (North), June to October (South and West)',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=400&q=80',
    toursCount: 7503,
    parks: [
      { name: 'Ngorongoro Crater', slug: 'ngorongoro-crater' },
      { name: 'Nyerere National Park', slug: 'nyerere-national-park' },
      { name: 'Ruaha National Park', slug: 'ruaha-national-park' },
      { name: 'Serengeti National Park', slug: 'serengeti-national-park' },
      { name: 'Gombe National Park', slug: 'gombe-national-park' },
      { name: 'Katavi National Park', slug: 'katavi-national-park' }
    ],
    totalParks: 15
  },
];

export default async function ParksPage() {
  const countries = fallbackCountries;

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f4f4] text-[#333] font-sans">
      <Navbar />

      <main className="flex-1 w-full mx-auto pb-10">
        {/* Top Breadcrumbs */}
        <div className="bg-[#1f1a17] text-white py-2 border-b border-[#333]">
          <div className="max-w-[1230px] mx-auto px-4 text-[12px] text-[#ccc]">
            You are here:{' '}
            <Link href="/" className="hover:underline">Home</Link>
            {' > '}
            <span className="text-white">Countries & Parks</span>
          </div>
        </div>

        {/* Hero Banner */}
        <div 
          className="relative bg-[#222] py-16"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/70"></div>
          <div className="relative max-w-[1230px] mx-auto px-4">
            <h1 className="text-[36px] font-bold text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              Countries & Parks
            </h1>
            <p className="text-[16px] font-medium text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)] max-w-2xl">
              Learn more about the major safari countries, including their highlights, wildlife, best time to visit and more.
            </p>
          </div>
        </div>

        <div className="max-w-[1230px] mx-auto px-4 py-8">
          <h2 className="text-[22px] font-bold text-[#333] mb-6" style={{ fontFamily: 'Georgia, serif' }}>
            Top-rated Safari Countries
          </h2>

          <div className="space-y-6">
            {countries.map(country => (
              <div key={country.id} className="bg-white border border-[#d5d5d5] rounded-sm flex flex-col md:flex-row shadow-sm overflow-hidden">
                
                {/* Left: Image (approx 25%) */}
                <div className="w-full md:w-[250px] relative flex-shrink-0 min-h-[200px]">
                  <img src={country.image} alt={country.name} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-3 left-3 text-white text-[12px] font-bold drop-shadow">
                    <span className="inline-flex items-center gap-2 rounded-full bg-black/45 px-2.5 py-1 backdrop-blur-sm">
                      <span className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center bg-black/60 text-white"><Play className="h-2.5 w-2.5 fill-current" /></span>
                      {country.name}
                    </span>
                  </div>
                </div>

                {/* Middle: Country Info (approx 50%) */}
                <div className="flex-1 p-5 border-r border-[#ececec]">
                  <h3 className="text-[22px] font-bold text-[#0070c0]" style={{ fontFamily: 'Georgia, serif' }}>
                    <Link href={`/parks/${country.slug}`} className="hover:underline">{country.name}</Link>
                  </h3>
                  
                  <div className="flex items-center gap-1.5 mt-1 mb-3 text-[13px] flex-wrap">
                    <div className="flex text-[#ffc107] text-[12px]">★★★★★</div>
                    <span className="font-bold text-[#333]">{country.rating.toFixed(1)}</span>
                    <span className="text-[#8a8a8a]">/5 - <Link href="/reviews" className="text-[#0070c0] hover:underline">{country.reviews} Reviews</Link></span>
                  </div>

                  <p className="text-[13px] text-[#444] mb-4 leading-relaxed">
                    {country.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[12px] mb-5">
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#f4f4f4] text-[#6b5130] flex items-center justify-center font-bold shrink-0">$$</div>
                      <div>
                        <div className="font-bold text-[#333]">Rates <span className="font-normal">(USD)</span></div>
                        <div className="text-[#555]">{country.rates}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#f4f4f4] text-[#6b5130] flex items-center justify-center font-bold shrink-0"><Sun className="h-3.5 w-3.5" /></div>
                      <div>
                        <div className="font-bold text-[#333]">Best Time</div>
                        <div className="text-[#555]">{country.bestTime}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#f4f4f4] text-[#6b5130] flex items-center justify-center font-bold shrink-0"><TrendingUp className="h-3.5 w-3.5" /></div>
                      <div>
                        <div className="font-bold text-[#333]">High Season</div>
                        <div className="text-[#555]">{country.highSeason}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[13px]">
                    <Link href={`/parks/${country.slug}`} className="border border-[#0070c0] text-[#0070c0] font-bold px-4 py-1.5 rounded-sm hover:bg-[#f0f8ff] transition">
                      More About {country.name} &gt;
                    </Link>
                    <Link href={`/tours?country=${country.name}`} className="border border-[#0070c0] text-[#0070c0] font-bold px-4 py-1.5 rounded-sm hover:bg-[#f0f8ff] transition">
                      {country.toursCount.toLocaleString()} {country.name} Tours &gt;
                    </Link>
                  </div>
                </div>

                {/* Right: Parks List (approx 25%) */}
                <div className="w-full md:w-[300px] p-5 flex-shrink-0 bg-[#fbfbfb]">
                  <h4 className="text-[14px] font-bold text-[#333] mb-3">{country.name} Parks & Reserves</h4>
                  <ul className="space-y-2 mb-4 text-[13px]">
                    {country.parks.map((park) => (
                      <li key={park.slug} className="flex gap-1.5">
                        <span className="text-[#8a8a8a]"><span className="text-[#aaa]">&gt;</span>gt;</span>
                        <Link href={`/parks/${park.slug}`} className="text-[#0070c0] hover:underline">{park.name}</Link>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/tours?country=${country.name}`} className="inline-block border border-[#0070c0] text-[#0070c0] font-bold px-4 py-1.5 rounded-sm hover:bg-[#f0f8ff] transition text-[13px]">
                    All {country.totalParks} Parks & Reserves &gt;
                  </Link>
                </div>
                
              </div>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
