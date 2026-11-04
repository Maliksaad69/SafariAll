"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../Working Projects/SafariAll/prisma/seed.ts
var import_client = require("@prisma/client");
var import_bcryptjs = __toESM(require("bcryptjs"));

// ../../Working Projects/SafariAll/prisma/catalog-data.ts
var CATALOG_DESTINATIONS = [
  {
    "id": "2c680e59-6b5b-4f73-81bd-62ea1f384ed4",
    "name": "Botswana",
    "slug": "botswana",
    "country": "Botswana",
    "type": "COUNTRY",
    "description": "In and around the Okavango Delta, which can be discovered on an unforgettable game drive or mokoro trip. Elsewhere, Chobe National Park, Moremi Game Reserve and the Central Kalahari Game Reserve are world-class safari destinations, combining stunning landscapes with exceptional wildlife. Botswana is also excellent for self-drive safaris.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    "latitude": -22.33,
    "longitude": 24.68,
    "bestTimeToVisit": null,
    "wildlifePresent": null,
    "bestTimeSummary": "April to October (Okavango, Moremi, Chobe), December to May (Central Kalahari, Khutse, Kgalagadi)",
    "dailyRates": "$193 to $878 per day",
    "highSeason": "July to October (Only Chobe gets crowded)",
    "popularityRank": 2,
    "rating": 4.8,
    "reviewCount": 372
  },
  {
    "id": "bda958ca-0181-496c-9a9a-fa3f108f7e52",
    "name": "Kenya",
    "slug": "kenya",
    "country": "Kenya",
    "type": "COUNTRY",
    "description": "Regardless of whether this is your first time on safari or you're a safari veteran, Kenya is a fantastic place to go looking for wildlife. The Masai Mara National Reserve and surrounding conservancies get all the attention for big cat sightings and the annual wildebeest migration. But Kenya has numerous world-class parks to explore, and it's also an excellent place to relax on a beach holiday once your safari is over.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80",
    "latitude": -0.02,
    "longitude": 37.91,
    "bestTimeToVisit": null,
    "wildlifePresent": null,
    "bestTimeSummary": "June to October and January and February",
    "dailyRates": "$173 to $696 per day",
    "highSeason": "July to October and December to March",
    "popularityRank": 3,
    "rating": 4.6,
    "reviewCount": 1752
  },
  {
    "id": "4e44e6c3-0fce-41a7-8684-828cb99608d3",
    "name": "Zambia",
    "slug": "zambia",
    "country": "Zambia",
    "type": "COUNTRY",
    "description": "Zambia is the home of the walking safari. South Luangwa has some of the best leopard viewing in Africa, the Lower Zambezi offers canoe safaris past elephant herds, and Victoria Falls thunders on the border with Zimbabwe. Camps are small and owner-run, so it feels wild and uncrowded.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80",
    "latitude": -13.13,
    "longitude": 27.85,
    "bestTimeToVisit": null,
    "wildlifePresent": null,
    "bestTimeSummary": "June to October (Dry season)",
    "dailyRates": "$260 to $910 per day",
    "highSeason": "August to October",
    "popularityRank": 4,
    "rating": 4.8,
    "reviewCount": 284
  },
  {
    "id": "50eafda4-e46e-4452-bc07-dc24cf627d25",
    "name": "Namibia",
    "slug": "namibia",
    "country": "Namibia",
    "type": "COUNTRY",
    "description": "Namibia is a land of vast deserts, towering red dunes and wide open skies. Etosha National Park is one of the easiest places in Africa to see rhino and lion at waterholes, while Sossusvlei and the Skeleton Coast offer some of the most striking landscapes on Earth. Good roads make it ideal for self-drive safaris.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80",
    "latitude": -22.96,
    "longitude": 18.49,
    "bestTimeToVisit": null,
    "wildlifePresent": null,
    "bestTimeSummary": "May to October",
    "dailyRates": "$150 to $720 per day",
    "highSeason": "July to October",
    "popularityRank": 6,
    "rating": 4.7,
    "reviewCount": 498
  },
  {
    "id": "f8889113-3b88-46c0-ada0-8fb0dd4b2da4",
    "name": "Ngorongoro Crater",
    "slug": "ngorongoro-crater",
    "country": "Tanzania",
    "type": "GAME_RESERVE",
    "description": "The world\xE2\u20AC\u2122s largest intact volcanic caldera \xE2\u20AC\u201D 610m deep, 19km wide and 264km\xC2\xB2 in area \xE2\u20AC\u201D encloses a permanent population of roughly 25,000 large mammals. Ngorongoro offers possibly the easiest Big Five viewing in East Africa, including one of the densest black-rhino populations on the continent, all inside the UNESCO-listed Ngorongoro Conservation Area.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
    "latitude": -3.1833,
    "longitude": 35.5,
    "bestTimeToVisit": {
      "apr": "GOOD",
      "aug": "EXCELLENT",
      "dec": "EXCELLENT",
      "feb": "EXCELLENT",
      "jan": "EXCELLENT",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "EXCELLENT",
      "may": "GOOD",
      "nov": "GOOD",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Black Rhino",
        "Lion",
        "Elephant",
        "Hippo",
        "Flamingo",
        "Hyena"
      ],
      "Count": 6
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "5459dbb7-8608-490b-8671-c3190be6b1c8",
    "name": "Tanzania",
    "slug": "tanzania",
    "country": "Tanzania",
    "type": "COUNTRY",
    "description": "Tanzania, with its three safari circuits, is one of Africa's top wildlife destinations. The popular Northern circuit incorporates bucket-list landmarks such as Serengeti National Park, Ngorongoro Crater and Mt Kilimanjaro. Repeat visitors might prefer the remote wilderness vibe of the Southern or Western circuits. For some beach time, the 'Spice Island' of Zanzibar is only a short flight away.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
    "latitude": -6.37,
    "longitude": 34.89,
    "bestTimeToVisit": null,
    "wildlifePresent": null,
    "bestTimeSummary": "June to October; January to February (For wildebeest calving)",
    "dailyRates": "$229 to $659 per day",
    "highSeason": "July to March (North), June to October (South and West)",
    "popularityRank": 1,
    "rating": 4.8,
    "reviewCount": 2172
  },
  {
    "id": "16843c98-d29a-422a-b0d2-474801ace36a",
    "name": "South Africa",
    "slug": "south-africa",
    "country": "South Africa",
    "type": "COUNTRY",
    "description": "South Africa is one of Africa's great wildlife destinations. Vast Kruger National Park has an abundance of animals and is one of the continent's iconic attractions. For outdoor adventure, the Blyde River Canyon is the third-largest canyon on the planet, and the jagged peaks of the Drakensberg Mountains punch into the sky. Cape Town hums with an urban beat and is fringed by white sandy beaches.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80",
    "latitude": -30.56,
    "longitude": 22.94,
    "bestTimeToVisit": null,
    "wildlifePresent": null,
    "bestTimeSummary": "May to September (Most parks), October to March (Cape Town)",
    "dailyRates": "$187 to $917 per day",
    "highSeason": "October to March (Crowded during school holidays)",
    "popularityRank": 5,
    "rating": 4.6,
    "reviewCount": 1320
  },
  {
    "id": "9e6b195c-aadb-4141-81c2-eb378188d1f6",
    "name": "Uganda",
    "slug": "uganda",
    "country": "Uganda",
    "type": "COUNTRY",
    "description": "Uganda is the best place in Africa to combine mountain gorilla trekking with a classic savannah safari. Bwindi Impenetrable Forest is home to almost half the world's mountain gorillas, Kibale has the region's best chimpanzee tracking, and Queen Elizabeth and Murchison Falls parks offer lions, elephants and Nile boat trips.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=80",
    "latitude": 1.37,
    "longitude": 32.29,
    "bestTimeToVisit": null,
    "wildlifePresent": null,
    "bestTimeSummary": "June to August and December to February",
    "dailyRates": "$180 to $820 per day",
    "highSeason": "June to September and December to February",
    "popularityRank": 7,
    "rating": 4.7,
    "reviewCount": 642
  },
  {
    "id": "55511666-cf14-421a-b773-eeee05ab308f",
    "name": "Masai Mara National Reserve",
    "slug": "masai-mara-national-reserve",
    "country": "Kenya",
    "type": "NATIONAL_PARK",
    "description": "Kenya\xE2\u20AC\u2122s flagship reserve covers 1,510km\xC2\xB2 of open savannah in the Great Rift Valley and delivers what many consider the finest big-cat viewing in Africa. Between July and October the Great Migration pours across the Mara River from the Serengeti, creating the most dramatic wildlife spectacle on the continent.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80",
    "latitude": -1.4931,
    "longitude": 35.1439,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "GOOD",
      "feb": "GOOD",
      "jan": "GOOD",
      "jul": "EXCELLENT",
      "jun": "GOOD",
      "mar": "GOOD",
      "may": "FAIR",
      "nov": "GOOD",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Lion",
        "Leopard",
        "Elephant",
        "Rhino",
        "Buffalo",
        "Giraffe"
      ],
      "Count": 6
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "75ac6bb7-c754-48e5-8bee-6d3c14aca686",
    "name": "Rwanda",
    "slug": "rwanda",
    "country": "Rwanda",
    "type": "COUNTRY",
    "description": "Rwanda is small, safe and easy to travel. Volcanoes National Park offers world-class mountain gorilla trekking, Nyungwe Forest protects chimpanzees and other primates, and Akagera National Park has been restored as a Big Five savannah reserve.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=80",
    "latitude": -1.94,
    "longitude": 29.87,
    "bestTimeToVisit": null,
    "wildlifePresent": null,
    "bestTimeSummary": "June to September and December to February",
    "dailyRates": "$250 to $1,500 per day",
    "highSeason": "June to September",
    "popularityRank": 9,
    "rating": 4.8,
    "reviewCount": 356
  },
  {
    "id": "36fc4915-b27d-4bc3-ae09-b527efe45a77",
    "name": "Tarangire National Park",
    "slug": "tarangire-national-park",
    "country": "Tanzania",
    "type": "NATIONAL_PARK",
    "description": "Famous for its ancient baobab trees and some of the largest elephant herds in Tanzania, which gather along the Tarangire River in the dry season.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80",
    "latitude": -4.16,
    "longitude": 36.09,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "FAIR",
      "feb": "FAIR",
      "jan": "FAIR",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "FAIR",
      "may": "GOOD",
      "nov": "GOOD",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Elephant",
        "Lion",
        "Leopard",
        "Buffalo",
        "Giraffe"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "3a24c00c-fa37-4c35-a727-30a288f90129",
    "name": "Lake Manyara National Park",
    "slug": "lake-manyara-national-park",
    "country": "Tanzania",
    "type": "NATIONAL_PARK",
    "description": "A compact park below the Rift Valley escarpment, known for groundwater forest, flamingos on the soda lake and tree-climbing lions.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
    "latitude": -3.53,
    "longitude": 35.82,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "FAIR",
      "feb": "FAIR",
      "jan": "FAIR",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "FAIR",
      "may": "GOOD",
      "nov": "GOOD",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Elephant",
        "Giraffe",
        "Baboon",
        "Flamingo",
        "Lion"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "fc1d1251-15e0-4dea-bf78-efbe434a914b",
    "name": "Nyerere National Park",
    "slug": "nyerere-national-park",
    "country": "Tanzania",
    "type": "NATIONAL_PARK",
    "description": "Africa's largest protected area, formerly the Selous Game Reserve, offering boat safaris on the Rufiji River and excellent African wild dog sightings.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80",
    "latitude": -8.8,
    "longitude": 37.8,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "FAIR",
      "feb": "FAIR",
      "jan": "FAIR",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "FAIR",
      "may": "GOOD",
      "nov": "GOOD",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Wild dog",
        "Elephant",
        "Lion",
        "Hippo",
        "Buffalo"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "e3ca55d0-31b2-480c-9d18-e8e0e9dbc56b",
    "name": "Ruaha National Park",
    "slug": "ruaha-national-park",
    "country": "Tanzania",
    "type": "NATIONAL_PARK",
    "description": "A remote and rugged park with very large lion prides, big elephant numbers and few visitors, centred on the Great Ruaha River.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
    "latitude": -7.67,
    "longitude": 34.93,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "FAIR",
      "feb": "FAIR",
      "jan": "FAIR",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "FAIR",
      "may": "GOOD",
      "nov": "GOOD",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Lion",
        "Elephant",
        "Kudu",
        "Wild dog",
        "Leopard"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "febe8ce7-8ff4-4bec-9a8a-df0057411bb1",
    "name": "Gombe National Park",
    "slug": "gombe-national-park",
    "country": "Tanzania",
    "type": "NATIONAL_PARK",
    "description": "A small forested park on Lake Tanganyika where Jane Goodall began her chimpanzee research. Chimp trekking is the main activity.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=80",
    "latitude": -4.67,
    "longitude": 29.63,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "FAIR",
      "feb": "FAIR",
      "jan": "FAIR",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "FAIR",
      "may": "GOOD",
      "nov": "GOOD",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Chimpanzee",
        "Baboon",
        "Red colobus"
      ],
      "Count": 3
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "f7cfe70b-7822-4458-950b-e0dca896f7a8",
    "name": "Katavi National Park",
    "slug": "katavi-national-park",
    "country": "Tanzania",
    "type": "NATIONAL_PARK",
    "description": "One of Tanzania's wildest parks, where huge buffalo herds and crowded hippo pools draw predators in the late dry season.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80",
    "latitude": -6.85,
    "longitude": 31.25,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "FAIR",
      "feb": "FAIR",
      "jan": "FAIR",
      "jul": "EXCELLENT",
      "jun": "GOOD",
      "mar": "FAIR",
      "may": "FAIR",
      "nov": "GOOD",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Buffalo",
        "Hippo",
        "Lion",
        "Crocodile",
        "Elephant"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "c84f6c57-8b2d-411f-9ba5-285f2eb8ca3e",
    "name": "Zanzibar",
    "slug": "zanzibar",
    "country": "Tanzania",
    "type": "ISLAND",
    "description": "The 'Spice Island' off Tanzania's coast, with white beaches, the historic Stone Town and Jozani Forest's red colobus monkeys. The classic beach finish to a safari.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80",
    "latitude": -6.16,
    "longitude": 39.2,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "GOOD",
      "feb": "EXCELLENT",
      "jan": "EXCELLENT",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "GOOD",
      "may": "GOOD",
      "nov": "GOOD",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Red colobus",
        "Dolphin",
        "Sea turtle"
      ],
      "Count": 3
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "084d55cf-f2d5-4f56-97ca-8ac00cb4087c",
    "name": "Amboseli National Park",
    "slug": "amboseli-national-park",
    "country": "Kenya",
    "type": "NATIONAL_PARK",
    "description": "Best known for big-tusked elephants framed by Mount Kilimanjaro, with open plains and swamps that make wildlife easy to spot.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80",
    "latitude": -2.65,
    "longitude": 37.26,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "GOOD",
      "feb": "EXCELLENT",
      "jan": "EXCELLENT",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "GOOD",
      "may": "GOOD",
      "nov": "GOOD",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Elephant",
        "Lion",
        "Buffalo",
        "Hippo",
        "Zebra"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "90fca831-5d85-4cdf-bbe5-b0049b30bafd",
    "name": "Lake Nakuru National Park",
    "slug": "lake-nakuru-national-park",
    "country": "Kenya",
    "type": "NATIONAL_PARK",
    "description": "A Rift Valley soda lake and rhino sanctuary, one of the best places in Kenya to see both black and white rhino.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80",
    "latitude": -0.37,
    "longitude": 36.09,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "GOOD",
      "feb": "EXCELLENT",
      "jan": "EXCELLENT",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "GOOD",
      "may": "GOOD",
      "nov": "GOOD",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Rhino",
        "Flamingo",
        "Lion",
        "Rothschild giraffe",
        "Leopard"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "29a7d6bf-7860-46a6-900a-05f01a4e2e96",
    "name": "Samburu National Reserve",
    "slug": "samburu-national-reserve",
    "country": "Kenya",
    "type": "GAME_RESERVE",
    "description": "A semi-arid reserve along the Ewaso Ng'iro River, home to the 'Samburu Special Five' found only in northern Kenya.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80",
    "latitude": 0.57,
    "longitude": 37.53,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "GOOD",
      "feb": "EXCELLENT",
      "jan": "EXCELLENT",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "GOOD",
      "may": "GOOD",
      "nov": "GOOD",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Grevy zebra",
        "Reticulated giraffe",
        "Gerenuk",
        "Leopard",
        "Elephant"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "0a5b6408-4b91-4f8d-846e-b02dcdd6cc16",
    "name": "Tsavo East National Park",
    "slug": "tsavo-east-national-park",
    "country": "Kenya",
    "type": "NATIONAL_PARK",
    "description": "One of Kenya's largest parks, famous for its red-dust elephants and easy access from the coast at Mombasa.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80",
    "latitude": -2.76,
    "longitude": 38.77,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "GOOD",
      "feb": "EXCELLENT",
      "jan": "EXCELLENT",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "GOOD",
      "may": "GOOD",
      "nov": "GOOD",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Red elephant",
        "Lion",
        "Buffalo",
        "Lesser kudu"
      ],
      "Count": 4
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "97102495-84e6-436a-8eb1-e7edf0227c86",
    "name": "Chobe National Park",
    "slug": "chobe-national-park",
    "country": "Botswana",
    "type": "NATIONAL_PARK",
    "description": "Home to one of the largest elephant populations on Earth, best seen from a boat on the Chobe River at sunset.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80",
    "latitude": -18.6,
    "longitude": 24.5,
    "bestTimeToVisit": {
      "apr": "GOOD",
      "aug": "EXCELLENT",
      "dec": "FAIR",
      "feb": "FAIR",
      "jan": "FAIR",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "FAIR",
      "may": "EXCELLENT",
      "nov": "GOOD",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Elephant",
        "Buffalo",
        "Lion",
        "Hippo",
        "Sable"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "d1496a97-dfd3-49d9-b792-8cb74bd520ad",
    "name": "Okavango Delta",
    "slug": "okavango-delta",
    "country": "Botswana",
    "type": "NATURAL_WONDER",
    "description": "A vast inland delta and UNESCO World Heritage Site where floodwaters create a maze of channels explored by mokoro canoe, on foot and by vehicle.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    "latitude": -19.3,
    "longitude": 22.9,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "FAIR",
      "feb": "FAIR",
      "jan": "FAIR",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "FAIR",
      "may": "GOOD",
      "nov": "GOOD",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Lion",
        "Leopard",
        "Wild dog",
        "Elephant",
        "Red lechwe"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "d41df8c6-bfb3-4dbe-8ecb-85318acd4631",
    "name": "Moremi Game Reserve",
    "slug": "moremi-game-reserve",
    "country": "Botswana",
    "type": "GAME_RESERVE",
    "description": "The protected eastern heart of the Okavango Delta, combining water and dry land for some of the best predator viewing in Africa.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    "latitude": -19.2,
    "longitude": 23.4,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "FAIR",
      "feb": "FAIR",
      "jan": "FAIR",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "FAIR",
      "may": "GOOD",
      "nov": "GOOD",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Wild dog",
        "Lion",
        "Leopard",
        "Elephant",
        "Buffalo"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "2f275b73-0b8f-4251-ba67-d2a69a046e07",
    "name": "Central Kalahari Game Reserve",
    "slug": "central-kalahari-game-reserve",
    "country": "Botswana",
    "type": "GAME_RESERVE",
    "description": "An enormous, remote desert reserve that comes alive after summer rains, when springbok and gemsbok gather on fossil river valleys.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80",
    "latitude": -22,
    "longitude": 23.5,
    "bestTimeToVisit": {
      "apr": "EXCELLENT",
      "aug": "FAIR",
      "dec": "EXCELLENT",
      "feb": "EXCELLENT",
      "jan": "EXCELLENT",
      "jul": "FAIR",
      "jun": "FAIR",
      "mar": "EXCELLENT",
      "may": "GOOD",
      "nov": "GOOD",
      "oct": "FAIR",
      "sep": "FAIR"
    },
    "wildlifePresent": {
      "value": [
        "Black-maned lion",
        "Cheetah",
        "Gemsbok",
        "Springbok",
        "Brown hyena"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "61c5a145-5f24-453d-bdfa-64f6723199a4",
    "name": "Makgadikgadi Pans National Park",
    "slug": "makgadikgadi-pans-national-park",
    "country": "Botswana",
    "type": "NATIONAL_PARK",
    "description": "Huge salt pans with a zebra migration in the wet season and habituated meerkats in the dry season.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80",
    "latitude": -20.7,
    "longitude": 25.2,
    "bestTimeToVisit": {
      "apr": "EXCELLENT",
      "aug": "GOOD",
      "dec": "EXCELLENT",
      "feb": "EXCELLENT",
      "jan": "EXCELLENT",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "EXCELLENT",
      "may": "GOOD",
      "nov": "GOOD",
      "oct": "FAIR",
      "sep": "FAIR"
    },
    "wildlifePresent": {
      "value": [
        "Zebra",
        "Meerkat",
        "Brown hyena",
        "Flamingo"
      ],
      "Count": 4
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "ea4950a4-027b-4b94-8cfb-e486a8845631",
    "name": "Nxai Pan National Park",
    "slug": "nxai-pan-national-park",
    "country": "Botswana",
    "type": "NATIONAL_PARK",
    "description": "Grassy fossil pans and the famous Baines' Baobabs, at their best in the green season when plains game arrive.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80",
    "latitude": -19.9,
    "longitude": 24.8,
    "bestTimeToVisit": {
      "apr": "EXCELLENT",
      "aug": "FAIR",
      "dec": "EXCELLENT",
      "feb": "EXCELLENT",
      "jan": "EXCELLENT",
      "jul": "FAIR",
      "jun": "FAIR",
      "mar": "EXCELLENT",
      "may": "GOOD",
      "nov": "GOOD",
      "oct": "FAIR",
      "sep": "FAIR"
    },
    "wildlifePresent": {
      "value": [
        "Zebra",
        "Springbok",
        "Lion",
        "Cheetah"
      ],
      "Count": 4
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "6d53a473-4153-4478-b4e2-87ca0e20a77b",
    "name": "Kruger National Park",
    "slug": "kruger-national-park",
    "country": "South Africa",
    "type": "NATIONAL_PARK",
    "description": "South Africa's flagship park, almost two million hectares with excellent Big Five viewing, good roads and options from self-drive to luxury lodges.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80",
    "latitude": -23.99,
    "longitude": 31.55,
    "bestTimeToVisit": {
      "apr": "GOOD",
      "aug": "EXCELLENT",
      "dec": "FAIR",
      "feb": "FAIR",
      "jan": "FAIR",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "FAIR",
      "may": "EXCELLENT",
      "nov": "FAIR",
      "oct": "GOOD",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Lion",
        "Leopard",
        "Elephant",
        "Rhino",
        "Buffalo"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "ea1b85dc-d35f-4bcc-9ecc-7069996745f3",
    "name": "MalaMala Game Reserve",
    "slug": "malamala-game-reserve",
    "country": "South Africa",
    "type": "GAME_RESERVE",
    "description": "A private reserve bordering Kruger, with unfenced boundaries, very exclusive traffic and outstanding leopard sightings.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80",
    "latitude": -24.8,
    "longitude": 31.53,
    "bestTimeToVisit": {
      "apr": "GOOD",
      "aug": "EXCELLENT",
      "dec": "FAIR",
      "feb": "FAIR",
      "jan": "FAIR",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "FAIR",
      "may": "EXCELLENT",
      "nov": "FAIR",
      "oct": "GOOD",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Leopard",
        "Lion",
        "Elephant",
        "Rhino",
        "Buffalo"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "7ecf0fd9-eb8d-4c76-8aa4-7af77c4439dc",
    "name": "Phinda Private Game Reserve",
    "slug": "phinda-private-game-reserve",
    "country": "South Africa",
    "type": "GAME_RESERVE",
    "description": "A KwaZulu-Natal reserve with seven different habitats, known for cheetah and rhino conservation, close to the Indian Ocean coast.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80",
    "latitude": -27.8,
    "longitude": 32.35,
    "bestTimeToVisit": {
      "apr": "GOOD",
      "aug": "EXCELLENT",
      "dec": "FAIR",
      "feb": "FAIR",
      "jan": "FAIR",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "FAIR",
      "may": "EXCELLENT",
      "nov": "FAIR",
      "oct": "GOOD",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Cheetah",
        "Rhino",
        "Lion",
        "Elephant"
      ],
      "Count": 4
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "325e3920-c657-4edb-9a36-bcdf9fde014f",
    "name": "Sabi Sand Nature Reserve",
    "slug": "sabi-sand-nature-reserve",
    "country": "South Africa",
    "type": "NATURE_RESERVE",
    "description": "A group of private reserves next to Kruger, famous for relaxed leopards and luxury lodges with off-road game drives.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80",
    "latitude": -24.85,
    "longitude": 31.45,
    "bestTimeToVisit": {
      "apr": "GOOD",
      "aug": "EXCELLENT",
      "dec": "FAIR",
      "feb": "FAIR",
      "jan": "FAIR",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "FAIR",
      "may": "EXCELLENT",
      "nov": "FAIR",
      "oct": "GOOD",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Leopard",
        "Lion",
        "Elephant",
        "Rhino",
        "Buffalo"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "623aa1c3-0d50-4ead-bae3-e28f5ba253f2",
    "name": "Addo Elephant National Park",
    "slug": "addo-elephant-national-park",
    "country": "South Africa",
    "type": "NATIONAL_PARK",
    "description": "A malaria-free park on the Eastern Cape, with more than 600 elephants and a marine section for whales and great white sharks.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80",
    "latitude": -33.48,
    "longitude": 25.75,
    "bestTimeToVisit": {
      "apr": "EXCELLENT",
      "aug": "EXCELLENT",
      "dec": "EXCELLENT",
      "feb": "EXCELLENT",
      "jan": "EXCELLENT",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "EXCELLENT",
      "may": "EXCELLENT",
      "nov": "EXCELLENT",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Elephant",
        "Lion",
        "Buffalo",
        "Southern right whale"
      ],
      "Count": 4
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "b15d842c-34ee-4d1c-a0a7-c9895fcb24dc",
    "name": "Bwindi Impenetrable National Park",
    "slug": "bwindi-impenetrable-national-park",
    "country": "Uganda",
    "type": "NATIONAL_PARK",
    "description": "An ancient rainforest that protects nearly half of the world's mountain gorillas. Guided treks visit habituated gorilla families.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=80",
    "latitude": -1.06,
    "longitude": 29.66,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "GOOD",
      "feb": "EXCELLENT",
      "jan": "EXCELLENT",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "GOOD",
      "may": "GOOD",
      "nov": "FAIR",
      "oct": "FAIR",
      "sep": "GOOD"
    },
    "wildlifePresent": {
      "value": [
        "Mountain gorilla",
        "Chimpanzee",
        "Forest elephant",
        "L'Hoest monkey"
      ],
      "Count": 4
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "9c2b179c-0f79-437d-b84d-30eee3da3313",
    "name": "Queen Elizabeth National Park",
    "slug": "queen-elizabeth-national-park",
    "country": "Uganda",
    "type": "NATIONAL_PARK",
    "description": "Uganda's most visited savannah park, known for the Kazinga Channel boat trip and the tree-climbing lions of Ishasha.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=80",
    "latitude": -0.2,
    "longitude": 29.9,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "GOOD",
      "feb": "EXCELLENT",
      "jan": "EXCELLENT",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "GOOD",
      "may": "GOOD",
      "nov": "FAIR",
      "oct": "FAIR",
      "sep": "GOOD"
    },
    "wildlifePresent": {
      "value": [
        "Tree-climbing lion",
        "Hippo",
        "Elephant",
        "Chimpanzee",
        "Buffalo"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "cb4dd5d8-59b6-47da-ad56-324fb3c96662",
    "name": "Murchison Falls National Park",
    "slug": "murchison-falls-national-park",
    "country": "Uganda",
    "type": "NATIONAL_PARK",
    "description": "Where the Nile forces through a 7-metre gorge. Game drives on the north bank and a boat trip to the base of the falls.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=80",
    "latitude": 2.28,
    "longitude": 31.8,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "GOOD",
      "feb": "EXCELLENT",
      "jan": "EXCELLENT",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "GOOD",
      "may": "GOOD",
      "nov": "FAIR",
      "oct": "FAIR",
      "sep": "GOOD"
    },
    "wildlifePresent": {
      "value": [
        "Giraffe",
        "Elephant",
        "Lion",
        "Hippo",
        "Shoebill"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "ded914c3-9f36-4421-a54c-0f7fea77fc4d",
    "name": "South Luangwa National Park",
    "slug": "south-luangwa-national-park",
    "country": "Zambia",
    "type": "NATIONAL_PARK",
    "description": "The birthplace of the walking safari, with dense wildlife along the Luangwa River and excellent night drives for leopard.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80",
    "latitude": -13.08,
    "longitude": 31.8,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "FAIR",
      "feb": "FAIR",
      "jan": "FAIR",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "FAIR",
      "may": "GOOD",
      "nov": "GOOD",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Leopard",
        "Lion",
        "Wild dog",
        "Thornicroft giraffe",
        "Hippo"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "94244faf-8d2a-4665-b21d-868592ce4f6d",
    "name": "Lower Zambezi National Park",
    "slug": "lower-zambezi-national-park",
    "country": "Zambia",
    "type": "NATIONAL_PARK",
    "description": "A riverside park opposite Mana Pools, best explored by canoe and boat, with elephants crossing between the islands.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80",
    "latitude": -15.4,
    "longitude": 29.6,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "FAIR",
      "feb": "FAIR",
      "jan": "FAIR",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "FAIR",
      "may": "GOOD",
      "nov": "GOOD",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Elephant",
        "Hippo",
        "Buffalo",
        "Lion",
        "Crocodile"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "f1e1d801-8ce7-4b81-9605-8c0f1e59e0d3",
    "name": "Etosha National Park",
    "slug": "etosha-national-park",
    "country": "Namibia",
    "type": "NATIONAL_PARK",
    "description": "A huge salt pan surrounded by waterholes where rhino, lion and elephant gather in the dry season. Ideal for self-drive.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80",
    "latitude": -18.85,
    "longitude": 16.33,
    "bestTimeToVisit": {
      "apr": "GOOD",
      "aug": "EXCELLENT",
      "dec": "FAIR",
      "feb": "FAIR",
      "jan": "FAIR",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "FAIR",
      "may": "EXCELLENT",
      "nov": "GOOD",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Black rhino",
        "Lion",
        "Elephant",
        "Springbok",
        "Giraffe"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "5489d3fd-9970-4016-a50b-75cefb2e8949",
    "name": "Sossusvlei",
    "slug": "sossusvlei",
    "country": "Namibia",
    "type": "NATURAL_WONDER",
    "description": "The towering red dunes of the Namib Desert and the white clay pan of Deadvlei, among the most photographed landscapes in Africa.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80",
    "latitude": -24.73,
    "longitude": 15.29,
    "bestTimeToVisit": {
      "apr": "EXCELLENT",
      "aug": "EXCELLENT",
      "dec": "EXCELLENT",
      "feb": "EXCELLENT",
      "jan": "EXCELLENT",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "EXCELLENT",
      "may": "EXCELLENT",
      "nov": "EXCELLENT",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Oryx",
        "Springbok",
        "Ostrich"
      ],
      "Count": 3
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "28c217ab-298b-4a38-af72-ba7233b2da7c",
    "name": "Hwange National Park",
    "slug": "hwange-national-park",
    "country": "Zimbabwe",
    "type": "NATIONAL_PARK",
    "description": "Zimbabwe's largest park, with tens of thousands of elephants drawn to pumped waterholes in the dry season.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80",
    "latitude": -19,
    "longitude": 26.5,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "FAIR",
      "feb": "FAIR",
      "jan": "FAIR",
      "jul": "EXCELLENT",
      "jun": "GOOD",
      "mar": "FAIR",
      "may": "FAIR",
      "nov": "GOOD",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Elephant",
        "Lion",
        "Wild dog",
        "Sable",
        "Buffalo"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "03a9ee6c-f0c6-47c2-b2ab-8e3f3614e54e",
    "name": "Mana Pools National Park",
    "slug": "mana-pools-national-park",
    "country": "Zimbabwe",
    "type": "NATIONAL_PARK",
    "description": "A UNESCO site on the Zambezi floodplain known for walking safaris, canoeing and elephants standing on their hind legs to feed.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80",
    "latitude": -15.75,
    "longitude": 29.4,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "FAIR",
      "feb": "FAIR",
      "jan": "FAIR",
      "jul": "EXCELLENT",
      "jun": "GOOD",
      "mar": "FAIR",
      "may": "FAIR",
      "nov": "GOOD",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Elephant",
        "Wild dog",
        "Lion",
        "Hippo",
        "Eland"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "af4fedbb-bf03-4c54-96d0-bab67ca6dc19",
    "name": "Victoria Falls",
    "slug": "victoria-falls",
    "country": "Zimbabwe",
    "type": "NATURAL_WONDER",
    "description": "One of the world's largest waterfalls, 'The Smoke that Thunders', on the Zambezi between Zimbabwe and Zambia.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80",
    "latitude": -17.92,
    "longitude": 25.86,
    "bestTimeToVisit": {
      "apr": "EXCELLENT",
      "aug": "GOOD",
      "dec": "FAIR",
      "feb": "EXCELLENT",
      "jan": "GOOD",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "EXCELLENT",
      "may": "EXCELLENT",
      "nov": "FAIR",
      "oct": "FAIR",
      "sep": "FAIR"
    },
    "wildlifePresent": {
      "value": [
        "Elephant",
        "Buffalo",
        "Hippo"
      ],
      "Count": 3
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "f7cbafbd-feed-4000-bbe4-309688c93bdb",
    "name": "Zimbabwe",
    "slug": "zimbabwe",
    "country": "Zimbabwe",
    "type": "COUNTRY",
    "description": "Zimbabwe has superb guiding and wild, uncrowded parks. Hwange is famous for its huge elephant herds, Mana Pools offers walking and canoeing along the Zambezi, and Victoria Falls is one of the natural wonders of the world.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80",
    "latitude": -19.02,
    "longitude": 29.15,
    "bestTimeToVisit": null,
    "wildlifePresent": null,
    "bestTimeSummary": "July to October",
    "dailyRates": "$170 to $780 per day",
    "highSeason": "August to October",
    "popularityRank": 8,
    "rating": 4.7,
    "reviewCount": 231
  },
  {
    "id": "12fe89f3-3a12-40a9-be90-ca793fd95384",
    "name": "Buffalo Springs National Reserve",
    "slug": "buffalo-springs-national-reserve",
    "country": "Kenya",
    "type": "GAME_RESERVE",
    "description": "Samburu\xE2\u20AC\u2122s quieter neighbour across the river, with natural springs, palm groves and the same northern Kenyan wildlife.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80",
    "latitude": 0.53,
    "longitude": 37.6,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "GOOD",
      "feb": "EXCELLENT",
      "jan": "EXCELLENT",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "GOOD",
      "may": "GOOD",
      "nov": "GOOD",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Elephant",
        "Lion",
        "Grevy zebra",
        "Oryx"
      ],
      "Count": 4
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "badc1354-056a-478b-9e96-335674907dc5",
    "name": "Hluhluwe-iMfolozi Park",
    "slug": "hluhluwe-imfolozi-park",
    "country": "South Africa",
    "type": "NATIONAL_PARK",
    "description": "Africa's oldest proclaimed reserve and the place where the white rhino was saved from extinction.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80",
    "latitude": -28.22,
    "longitude": 31.95,
    "bestTimeToVisit": {
      "apr": "GOOD",
      "aug": "EXCELLENT",
      "dec": "FAIR",
      "feb": "FAIR",
      "jan": "FAIR",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "FAIR",
      "may": "EXCELLENT",
      "nov": "FAIR",
      "oct": "GOOD",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "White rhino",
        "Black rhino",
        "Lion",
        "Elephant",
        "Buffalo"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "023588d3-884a-4486-a987-5e9c7e9c015c",
    "name": "Volcanoes National Park",
    "slug": "volcanoes-national-park",
    "country": "Rwanda",
    "type": "NATIONAL_PARK",
    "description": "Bamboo-covered volcanoes in the Virunga range, where Dian Fossey studied mountain gorillas. Rwanda\xE2\u20AC\u2122s premier gorilla trekking park.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=80",
    "latitude": -1.48,
    "longitude": 29.53,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "GOOD",
      "feb": "EXCELLENT",
      "jan": "EXCELLENT",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "GOOD",
      "may": "GOOD",
      "nov": "FAIR",
      "oct": "GOOD",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Mountain gorilla",
        "Golden monkey"
      ],
      "Count": 2
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "2239a52a-9f27-4df0-89e9-525e9622c3fc",
    "name": "Akagera National Park",
    "slug": "akagera-national-park",
    "country": "Rwanda",
    "type": "NATIONAL_PARK",
    "description": "Rwanda's savannah park, restored with reintroduced lions and rhinos to become a Big Five destination.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=80",
    "latitude": -1.88,
    "longitude": 30.72,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "GOOD",
      "feb": "EXCELLENT",
      "jan": "EXCELLENT",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "GOOD",
      "may": "GOOD",
      "nov": "FAIR",
      "oct": "GOOD",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Lion",
        "Rhino",
        "Elephant",
        "Giraffe",
        "Hippo"
      ],
      "Count": 5
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  },
  {
    "id": "36f605b8-2d57-424e-9fd7-60c064fe054e",
    "name": "Serengeti National Park",
    "slug": "serengeti-national-park",
    "country": "Tanzania",
    "type": "NATIONAL_PARK",
    "description": "The Serengeti is Tanzania\xE2\u20AC\u2122s oldest and most celebrated national park, a 14,750km\xC2\xB2 sea of grass immortalized in countless wildlife documentaries. It hosts the Great Migration \xE2\u20AC\u201D over 1.5 million wildebeest, 250,000 zebra and hundreds of thousands of gazelle on their annual circular trek \xE2\u20AC\u201D and boasts the highest lion density in Africa.",
    "featuredImageUrl": "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
    "latitude": -2.3333,
    "longitude": 34.8333,
    "bestTimeToVisit": {
      "apr": "FAIR",
      "aug": "EXCELLENT",
      "dec": "EXCELLENT",
      "feb": "EXCELLENT",
      "jan": "EXCELLENT",
      "jul": "EXCELLENT",
      "jun": "EXCELLENT",
      "mar": "GOOD",
      "may": "GOOD",
      "nov": "GOOD",
      "oct": "EXCELLENT",
      "sep": "EXCELLENT"
    },
    "wildlifePresent": {
      "value": [
        "Lion",
        "Leopard",
        "Elephant",
        "Rhino",
        "Buffalo",
        "Cheetah",
        "Wildebeest"
      ],
      "Count": 7
    },
    "bestTimeSummary": null,
    "dailyRates": null,
    "highSeason": null,
    "popularityRank": null,
    "rating": null,
    "reviewCount": 0
  }
];
var CATALOG_SECTIONS = [
  {
    "id": "bbe98156-f860-4f9e-96d8-38cfe5c8d957",
    "destinationId": "36f605b8-2d57-424e-9fd7-60c064fe054e",
    "key": "overview",
    "title": "Overview",
    "body": "Serengeti National Park is arguably the most famous safari destination on Earth. Established in 1951, it covers 14,750km\xC2\xB2 of endless grassland plains, Acacia woodlands and rocky kopjes in northern Tanzania, contiguous with Kenya\xE2\u20AC\u2122s Masai Mara. The park\xE2\u20AC\u2122s name comes from the Maasai word \xE2\u20AC\u0153siringet\xE2\u20AC\x9D, meaning \xE2\u20AC\u0153the place where the land runs on forever\xE2\u20AC\x9D \xE2\u20AC\u201D a fitting description for the sweeping savannahs that support the greatest large-mammal migration on the planet.",
    "bulletItems": [
      "UNESCO World Heritage Site since 1981",
      "Home to roughly 3",
      "000 lions and 1",
      "000 leopards",
      "Best accessed from Arusha by road (about 8 hours) or by scheduled flights"
    ],
    "sortOrder": 0
  },
  {
    "id": "5b5ee030-e714-4a76-b657-de0a5cfe8bae",
    "destinationId": "36f605b8-2d57-424e-9fd7-60c064fe054e",
    "key": "parks-reserves",
    "title": "Parks & Reserves",
    "body": "The Serengeti sits at the heart of a greater ecosystem of protected areas. Neighboring Ngorongoro Conservation Area to the southeast allows the migration to continue onto the mineral-rich calving grounds, while Maswa Game Reserve, Grumeti and Ikorongo Game Reserves and Loliondo Game Controlled Area buffer the park on other sides. Across the Kenyan border, the Masai Mara National Reserve completes the ecosystem.",
    "bulletItems": [
      "Ngorongoro Conservation Area \xE2\u20AC\u201C calving grounds (Dec\xE2\u20AC\u201CMar)",
      "Maswa Game Reserve \xE2\u20AC\u201C southern buffer",
      " excellent for wild dogs",
      "Grumeti & Ikorongo Game Reserves \xE2\u20AC\u201C western corridor private concessions",
      "Masai Mara National Reserve (Kenya) \xE2\u20AC\u201C northern extension of the ecosystem"
    ],
    "sortOrder": 1
  },
  {
    "id": "69328f6f-f476-46d7-a77a-3e8b82a5957f",
    "destinationId": "36f605b8-2d57-424e-9fd7-60c064fe054e",
    "key": "things-to-do",
    "title": "Things To Do",
    "body": "Game drives are the headline act \xE2\u20AC\u201D morning and afternoon drives in open or pop-up-roof 4x4 vehicles bring you within meters of predators and herds. Hot-air balloon safaris at dawn, followed by a champagne bush breakfast, are the Serengeti\xE2\u20AC\u2122s signature splurge. Selected areas also offer guided walking safaris, and a visit to a Maasai village adds a cultural dimension to the wildlife experience.",
    "bulletItems": [
      "Year-round game drives \xE2\u20AC\u201C the classic Serengeti experience",
      "Hot-air balloon safaris over the migration herds",
      "Guided walking safaris in designated wilderness zones",
      "Maasai cultural visits on the park fringes",
      "Photography hides at Grumeti River crocodile crossings"
    ],
    "sortOrder": 2
  },
  {
    "id": "8ee3bdfd-ef45-4012-811d-f9b30562ae41",
    "destinationId": "36f605b8-2d57-424e-9fd7-60c064fe054e",
    "key": "best-beaches",
    "title": "Best Beaches",
    "body": "The Serengeti is landlocked, so beach time means flying onward to the coast. Most visitors combine their safari with the white-sand beaches of Zanzibar \xE2\u20AC\u201D Nungwi and Kendwa in the north, Paje and Jambiani on the southeast coast \xE2\u20AC\u201D or the quieter islands of Pemba and Mafia. Scheduled flights connect Seronera airstrip to Zanzibar in around two hours.",
    "bulletItems": [
      "Nungwi & Kendwa",
      " Zanzibar \xE2\u20AC\u201C swimming-friendly",
      " sunset dhow cruises",
      "Paje & Jambiani \xE2\u20AC\u201C kitesurfing and laid-back beach villages",
      "Mafia Island \xE2\u20AC\u201C whale sharks and marine-park snorkeling"
    ],
    "sortOrder": 3
  },
  {
    "id": "fd869e0e-6acf-4893-aa06-2226be1d43c3",
    "destinationId": "36f605b8-2d57-424e-9fd7-60c064fe054e",
    "key": "reviews",
    "title": "Reviews",
    "body": "Travelers consistently rate the Serengeti as the highlight of any Tanzanian itinerary, praising the sheer density of big cats and the scale of the migration. Common critiques are the price of park fees and the crowds around big sightings in high season \xE2\u20AC\u201D many reviewers recommend the central Seronera area for first-timers and the remote north or west for those seeking solitude.",
    "bulletItems": [],
    "sortOrder": 4
  },
  {
    "id": "d7fa574c-bc36-4744-b321-8f95baa1bb32",
    "destinationId": "36f605b8-2d57-424e-9fd7-60c064fe054e",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "The Serengeti supports around 70 large mammal species. Lion prides are exceptionally easy to find \xE2\u20AC\u201D the park holds Africa\xE2\u20AC\u2122s densest lion population \xE2\u20AC\u201D while leopard favor the riverine woodland of the Seronera Valley and cheetah hunt the open plains of the southeast. Elephant and giraffe are common in the woodlands, hippo pods crowd the Retima Pool, and the migration brings 1.5 million wildebeest plus zebra and gazelle through the park in a year-long circuit. Black rhino are present in very small numbers.",
    "bulletItems": [
      "Big Five: lion",
      " leopard",
      " elephant",
      " buffalo \xE2\u20AC\u201D rhino very rare",
      "Great Migration: river crossings at Grumeti (Jun\xE2\u20AC\u201CJul) and Mara River (Jul\xE2\u20AC\u201COct)",
      "Cheetah",
      " spotted hyena",
      " jackal and bat-eared fox on the plains"
    ],
    "sortOrder": 5
  },
  {
    "id": "78ced083-67ea-4742-a2e0-4d6fd55c408f",
    "destinationId": "36f605b8-2d57-424e-9fd7-60c064fe054e",
    "key": "birds",
    "title": "Birds",
    "body": "With more than 500 recorded bird species, the Serengeti is a superb birding destination year-round, and November to April brings European and intra-African migrants in breeding plumage. Look for Kori bustard \xE2\u20AC\u201D the world\xE2\u20AC\u2122s heaviest flying bird \xE2\u20AC\u201D secretary birds, Fischer\xE2\u20AC\u2122s lovebird, rufous-tailed weaver and the endemic grey-breasted spurfowl, found almost nowhere else.",
    "bulletItems": [
      "Grey-breasted spurfowl \xE2\u20AC\u201C Serengeti near-endemic",
      "Lappet-faced vultures and six other vulture species at kills",
      "Lilac-breasted roller",
      " superc Courser",
      " Fischer\xE2\u20AC\u2122s lovebird on the plains"
    ],
    "sortOrder": 6
  },
  {
    "id": "7700a9b1-bb9a-4533-b0f8-cacf29fa7be8",
    "destinationId": "36f605b8-2d57-424e-9fd7-60c064fe054e",
    "key": "best-time",
    "title": "Best Time To Visit",
    "body": "June to October is the classic dry-season window: animals congregate at water sources, vegetation is thin and the migration usually crosses the Mara River in the north. January and February are superb for wildebeest calving on the southern plains, with predators in attendance. November to May brings greener scenery, newborn animals, lower prices and fewer vehicles \xE2\u20AC\u201D though rain can make some tracks muddy.",
    "bulletItems": [
      "Jun\xE2\u20AC\u201COct: best general wildlife viewing; Mara River crossings",
      "Jan\xE2\u20AC\u201CFeb: wildebeest calving season on the Ndutu plains",
      "Mar\xE2\u20AC\u201CMay: long rains \xE2\u20AC\u201D some camps close",
      " but rates drop sharply"
    ],
    "sortOrder": 7
  },
  {
    "id": "673b8613-30a3-4c0b-a0ea-7344f557e8cc",
    "destinationId": "36f605b8-2d57-424e-9fd7-60c064fe054e",
    "key": "weather-climate",
    "title": "Weather & Climate",
    "body": "The Serengeti\xE2\u20AC\u2122s altitude of 900\xE2\u20AC\u201C1,800m keeps temperatures pleasant rather than tropical. Daytime highs average 25\xE2\u20AC\u201C28\xC2\xB0C, while nights and early game drives can be cold \xE2\u20AC\u201D pack a fleece, as June to August mornings regularly dip below 12\xC2\xB0C. Rains fall in two seasons: short rains from November to December and long rains from March to May, usually as afternoon thunderstorms.",
    "bulletItems": [],
    "sortOrder": 8
  },
  {
    "id": "36926750-e541-472b-98f6-02e62f8c8ee2",
    "destinationId": "36f605b8-2d57-424e-9fd7-60c064fe054e",
    "key": "popular-routes",
    "title": "Popular Routes",
    "body": "The classic northern-circuit route links Arusha with the Serengeti via Ngorongoro Crater and often Tarangire or Lake Manyara, typically over 5\xE2\u20AC\u201C7 days. Visitors with more time add the western corridor (Grumeti) or push north to Lobo and the Mara River. Fly-in itineraries use Seronera, Grumeti, Kogatende or Lobo airstrips to skip the long drives.",
    "bulletItems": [
      "Arusha \xE2\u20AC\u201C Tarangire \xE2\u20AC\u201C Ngorongoro \xE2\u20AC\u201C Central Serengeti (5\xE2\u20AC\u201C7 days)",
      "Arusha \xE2\u20AC\u201C Lake Manyara \xE2\u20AC\u201C Ngorongoro \xE2\u20AC\u201C Serengeti \xE2\u20AC\u201C Zanzibar (8\xE2\u20AC\u201C10 days)",
      "Fly-in: Arusha \xE2\u2020\u2019 Kogatende airstrip for Mara River crossings"
    ],
    "sortOrder": 9
  },
  {
    "id": "df253ecc-6b51-4ef9-96b7-f7e7b620d003",
    "destinationId": "e3ca55d0-31b2-480c-9d18-e8e0e9dbc56b",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "June to October, when animals concentrate on the river. January to April is good for birding.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "56b13c9f-f0e3-44bc-82f6-84b8d043e9f4",
    "destinationId": "e3ca55d0-31b2-480c-9d18-e8e0e9dbc56b",
    "key": "getting-there",
    "title": "Getting There",
    "body": "Scheduled flights to Msembe airstrip at park headquarters (also Jongomeru). By road it is about 130 km from Iringa.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "56fda210-b8e8-40bf-a7ec-cdf993b71871",
    "destinationId": "36f605b8-2d57-424e-9fd7-60c064fe054e",
    "key": "getting-there",
    "title": "How To Get There",
    "body": "Most international visitors fly into Kilimanjaro International Airport (JRO) near Arusha. From Arusha it is an 8-hour drive to Central Serengeti, usually broken with a night in Ngorongoro or Karatu. Scheduled light-aircraft flights from Arusha (ARK) to Seronera, Grumeti, Lobo or Kogatende airstrips take 1\xE2\u20AC\u201C2 hours and are the standard choice for upmarket itineraries. Park entry is via Naabi Hill or Ndabaka gates.",
    "bulletItems": [
      "By road: Arusha \xE2\u2020\u2019 Naabi Hill gate \xE2\u2030\u02C6 8 hours",
      "By air: Arusha \xE2\u2020\u2019 Seronera airstrip \xE2\u2030\u02C6 1h15m",
      "Entry fees: US$71 per adult per day (2026)",
      " payable by card"
    ],
    "sortOrder": 10
  },
  {
    "id": "250bfaad-4cff-48f2-a3c1-68764e35a504",
    "destinationId": "36f605b8-2d57-424e-9fd7-60c064fe054e",
    "key": "health-safety",
    "title": "Malaria & Vaccinations",
    "body": "The Serengeti is a malaria area, though the cool, dry climate and altitude keep mosquito numbers moderate. Take prophylactics as advised by your travel clinic, use DEET repellent and cover up at dusk. A yellow fever certificate is required if arriving from a yellow-fever-endemic country; hepatitis A, typhoid and routine vaccinations are also recommended.",
    "bulletItems": [],
    "sortOrder": 11
  },
  {
    "id": "6c1a9fd2-6a32-4752-96b6-0bde733ae2ef",
    "destinationId": "36f605b8-2d57-424e-9fd7-60c064fe054e",
    "key": "staying-safe",
    "title": "Staying Safe",
    "body": "The Serengeti is very safe for visitors. Wildlife is the main consideration: always remain inside your vehicle outside designated walking zones, never feed animals and keep voices low near predators. Tented camps and lodges escort guests after dark. The park\xE2\u20AC\u2122s tourism infrastructure is well established, and rangers patrol the main circuits; petty crime is essentially unknown inside the park.",
    "bulletItems": [],
    "sortOrder": 12
  },
  {
    "id": "8fb33ab0-574e-4568-b337-61ee7f954c5e",
    "destinationId": "55511666-cf14-421a-b773-eeee05ab308f",
    "key": "overview",
    "title": "Overview",
    "body": "The Masai Mara National Reserve is Kenya\xE2\u20AC\u2122s most visited protected area and the northern extension of the Serengeti ecosystem. Named after the Maasai people and the Mara River, the reserve\xE2\u20AC\u2122s rolling grasslands, acacia-dotted hills and riverine forest support exceptional densities of lion, cheetah, leopard and elephant. The annual wildebeest migration between July and October, with its perilous Mara River crossings, is the single most famous wildlife event in Africa.",
    "bulletItems": [
      "1",
      "510km\xC2\xB2 reserve plus surrounding community conservancies",
      "Year-round big-cat viewing",
      " peaking with the migration",
      "Easy access from Nairobi \xE2\u20AC\u201D a 45-minute flight or 5-hour drive"
    ],
    "sortOrder": 0
  },
  {
    "id": "0c538be4-dc38-47c1-a3af-2ec1212eefc9",
    "destinationId": "55511666-cf14-421a-b773-eeee05ab308f",
    "key": "parks-reserves",
    "title": "Parks & Reserves",
    "body": "Around the core reserve, a ring of Maasai-owned conservancies \xE2\u20AC\u201D Mara North, Olare Motorogi, Naboisho, Ol Kinyei, Lemek and others \xE2\u20AC\u201D offers exclusive, low-density game viewing with walking safaris and night drives that are not permitted inside the reserve itself. Nearby Lake Nakuru National Park and Hell\xE2\u20AC\u2122s Gate National Park make easy two-center combinations.",
    "bulletItems": [
      "Mara North Conservancy \xE2\u20AC\u201C prime leopard habitat",
      "Olare Motorogi & Naboisho \xE2\u20AC\u201C high lion densities",
      " low vehicle numbers",
      "Lake Nakuru National Park \xE2\u20AC\u201C rhino and flamingos (2\xE2\u20AC\u201C3 hours away)"
    ],
    "sortOrder": 1
  },
  {
    "id": "a9a9feec-7d2f-40ab-bae6-35e7bb304b5b",
    "destinationId": "55511666-cf14-421a-b773-eeee05ab308f",
    "key": "things-to-do",
    "title": "Things To Do",
    "body": "Game drives dominate the itinerary, but the Mara offers more: dawn hot-air balloon flights ending in a champagne breakfast on the plains, guided bush walks in the conservancies, night game drives to spot nocturnal predators, and authentic Maasai village visits. Photographers can book dedicated vehicles and hides focused on the big cats and migration crossings.",
    "bulletItems": [
      "Hot-air balloon safari over the migration (US$450\xE2\u20AC\u201C550)",
      "Bush walks and night drives in the conservancies",
      "Maasai cultural experiences",
      "Specialist big-cat photography safaris"
    ],
    "sortOrder": 2
  },
  {
    "id": "30b298f8-0f99-490b-9064-bd28eb39c6f3",
    "destinationId": "55511666-cf14-421a-b773-eeee05ab308f",
    "key": "best-beaches",
    "title": "Best Beaches",
    "body": "The Mara is inland, but Kenya\xE2\u20AC\u2122s coast is a short flight away \xE2\u20AC\u201D most safaris pair seamlessly with a beach extension. Diani Beach near Mombasa is the classic white-sand choice; Watamu offers marine-park snorkeling and turtle nesting; and the Lamu archipelago provides an untouched, historic Swahili escape. Direct flights run from the Mara\xE2\u20AC\u2122s airstrips to the coast.",
    "bulletItems": [
      "Diani Beach \xE2\u20AC\u201C 15km of powder sand south of Mombasa",
      "Watamu \xE2\u20AC\u201C Watamu Marine National Park",
      " snorkeling and turtles",
      "Lamu \xE2\u20AC\u201C car-free Swahili island archipelago"
    ],
    "sortOrder": 3
  },
  {
    "id": "38c37713-d7ec-4e40-8d03-ec07b5e5b7eb",
    "destinationId": "55511666-cf14-421a-b773-eeee05ab308f",
    "key": "reviews",
    "title": "Reviews",
    "body": "Visitors rave about predator encounters \xE2\u20AC\u201D many report seeing all three big cats in a single day \xE2\u20AC\u201D and the professionalism of Maasai guides. The most frequent criticisms are vehicle congestion around migration river crossings in August and September, and entry fees; several reviewers recommend staying in a conservancy for a quieter experience at a similar price.",
    "bulletItems": [],
    "sortOrder": 4
  },
  {
    "id": "6ca631ed-0bc7-4568-95aa-ecc963e50da8",
    "destinationId": "55511666-cf14-421a-b773-eeee05ab308f",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "The Mara holds Kenya\xE2\u20AC\u2122s highest lion population \xE2\u20AC\u201D roughly 850\xE2\u20AC\u201C900 individuals \xE2\u20AC\u201D plus well-studied cheetah and leopard. Elephant, buffalo, giraffe, topi, eland and large hippo pods are resident year-round, while the migration brings up to 1.3 million wildebeest and 300,000 zebra across the Mara River between July and October. Black rhino survive in very small numbers in the reserve.",
    "bulletItems": [
      "Big Five present (rhino very rare)",
      "Migration river crossings at the Mara River",
      " Jul\xE2\u20AC\u201COct",
      "Resident big cats mean excellent viewing in every month"
    ],
    "sortOrder": 5
  },
  {
    "id": "e73e1e30-783c-46ed-8e85-f4281579e631",
    "destinationId": "55511666-cf14-421a-b773-eeee05ab308f",
    "key": "birds",
    "title": "Birds",
    "body": "Over 470 bird species have been recorded. Raptors are a highlight \xE2\u20AC\u201D martial eagle, bateleur, augur buzzard and the mighty crowned eagle \xE2\u20AC\u201D while the grasslands host secretary birds, Kori bustards, lilac-breasted rollers, Jackson\xE2\u20AC\u2122s widowbird and, in the wet season, southern ground hornbills. November to April adds Palearctic migrants.",
    "bulletItems": [
      "Martial eagle",
      " bateleur and secretary bird \xE2\u20AC\u201C marquee raptors",
      "Rosy-throated longclaw and Jackson\xE2\u20AC\u2122s widowbird in the grasslands",
      "Over 470 species; migrants boost the list Nov\xE2\u20AC\u201CApr"
    ],
    "sortOrder": 6
  },
  {
    "id": "7c5add88-3237-4b97-b4a4-1b1da137d9c0",
    "destinationId": "55511666-cf14-421a-b773-eeee05ab308f",
    "key": "best-time",
    "title": "Best Time To Visit",
    "body": "Wildlife viewing is excellent year-round, but the peak period is July to October when the migration herds are in the Mara and crossings of the Mara River peak in August\xE2\u20AC\u201CSeptember. December to February offers dry, warm conditions and superb predator sightings with fewer crowds. The long rains of March to May turn tracks muddy and some camps close, though rates are at their lowest.",
    "bulletItems": [
      "Jul\xE2\u20AC\u201COct: migration in residence \xE2\u20AC\u201D book 6+ months ahead",
      "Dec\xE2\u20AC\u201CFeb: dry",
      " warm and quieter",
      "Mar\xE2\u20AC\u201CMay: long rains",
      " low-season rates"
    ],
    "sortOrder": 7
  },
  {
    "id": "504d44a4-b388-4694-a9f4-75b14a7ce80e",
    "destinationId": "55511666-cf14-421a-b773-eeee05ab308f",
    "key": "weather-climate",
    "title": "Weather & Climate",
    "body": "At 1,500\xE2\u20AC\u201C2,170m altitude, the Mara has a mild highland climate. Days are warm (25\xE2\u20AC\u201C30\xC2\xB0C) and nights are cool \xE2\u20AC\u201D often 10\xE2\u20AC\u201C12\xC2\xB0C on early drives. Rain falls mostly from November to May, with the heaviest downpours in April and May, typically in the form of afternoon storms that clear to dramatic skies.",
    "bulletItems": [],
    "sortOrder": 8
  },
  {
    "id": "735d3eb1-c2aa-43f6-bd37-17e627375ca4",
    "destinationId": "55511666-cf14-421a-b773-eeee05ab308f",
    "key": "popular-routes",
    "title": "Popular Routes",
    "body": "Most itineraries fly from Nairobi\xE2\u20AC\u2122s Wilson Airport to Ol Kiombo, Keekorok or the conservancy airstrips \xE2\u20AC\u201D a 45-minute hop. Road-based safaris combine the Mara with Lake Nakuru and Hell\xE2\u20AC\u2122s Gate or Amboseli over 5\xE2\u20AC\u201C7 days. Longer routes link the Mara with Samburu and the Kenyan coast, or continue south into Tanzania\xE2\u20AC\u2122s Serengeti at the Isebania border crossing.",
    "bulletItems": [
      "Nairobi \xE2\u2020\u2019 Masai Mara fly-in (3 days",
      " minimal time lost)",
      "Nairobi \xE2\u20AC\u201C Nakuru \xE2\u20AC\u201C Mara road circuit (5\xE2\u20AC\u201C6 days)",
      "Mara \xE2\u2020\u2019 Isebania border \xE2\u2020\u2019 Serengeti combined safari (10+ days)"
    ],
    "sortOrder": 9
  },
  {
    "id": "b1716a64-fafe-4490-a1e5-01c7d11085f5",
    "destinationId": "55511666-cf14-421a-b773-eeee05ab308f",
    "key": "getting-there",
    "title": "How To Get There",
    "body": "Fly into Jomo Kenyatta International Airport (NBO) in Nairobi. From there, scheduled 45-minute flights depart Wilson Airport (WIL) for Mara airstrips \xE2\u20AC\u201D the fastest and most popular option. By road the reserve is a 5\xE2\u20AC\u201C6 hour drive on tarmac and rough murram roads, best combined with Lake Nakuru. Park entry costs US$100 per adult per day in high season (Jul\xE2\u20AC\u201COct) and US$70 in low season.",
    "bulletItems": [
      "By air: Wilson Airport \xE2\u2020\u2019 Ol Kiombo/Keekorok \xE2\u2030\u02C6 45 min",
      "By road: Nairobi \xE2\u2020\u2019 Sekenani gate \xE2\u2030\u02C6 5\xE2\u20AC\u201C6 hours",
      "Entry fees: US$100/day high season",
      " US$70/day low season"
    ],
    "sortOrder": 10
  },
  {
    "id": "4c38a03b-ad04-4071-8b24-fb7ff488dc86",
    "destinationId": "55511666-cf14-421a-b773-eeee05ab308f",
    "key": "health-safety",
    "title": "Malaria & Vaccinations",
    "body": "The Mara is a malaria zone \xE2\u20AC\u201D take prophylaxis, use repellent and wear long sleeves at dawn and dusk. A yellow fever certificate is required when arriving from endemic countries, and hepatitis A, typhoid and tetanus vaccinations are routinely advised. Drinking water at lodges and camps is treated; drink bottled water anyway when in doubt.",
    "bulletItems": [],
    "sortOrder": 11
  },
  {
    "id": "62ca0fef-28d9-4858-af3e-084d78d7675b",
    "destinationId": "55511666-cf14-421a-b773-eeee05ab308f",
    "key": "staying-safe",
    "title": "Staying Safe",
    "body": "The Masai Mara is a very safe, well-policed tourist area. Standard bush rules apply: stay in your vehicle during game drives, follow camp escorts after dark and keep distance from elephants and buffalo on foot. The surrounding conservancies work closely with Maasai communities, making the region among the most secure and welcoming safari destinations in East Africa.",
    "bulletItems": [],
    "sortOrder": 12
  },
  {
    "id": "e37b9255-1e71-4acc-8660-064afe14d413",
    "destinationId": "f8889113-3b88-46c0-ada0-8fb0dd4b2da4",
    "key": "overview",
    "title": "Overview",
    "body": "Ngorongoro Crater is the collapsed caldera of an ancient volcano that exploded and fell in on itself two to three million years ago. Today the crater floor is a natural amphitheater of grassland, forest and soda lakes, sheltering around 25,000 large animals that rarely leave. The surrounding Ngorongoro Conservation Area is unique in allowing Maasai pastoralists to live alongside wildlife, and the caldera became a UNESCO World Heritage Site in 1979.",
    "bulletItems": [
      "World\xE2\u20AC\u2122s largest intact and unfilled volcanic caldera",
      "Virtually guaranteed black rhino and lion sightings",
      "A natural enclosure \xE2\u20AC\u201D most animals never leave the crater"
    ],
    "sortOrder": 0
  },
  {
    "id": "95198b19-fd1d-4592-8347-61f24df0da0f",
    "destinationId": "f8889113-3b88-46c0-ada0-8fb0dd4b2da4",
    "key": "parks-reserves",
    "title": "Parks & Reserves",
    "body": "The Crater sits within the Ngorongoro Conservation Area, which also encompasses Empakaai and Olmoti craters, the Laetoli and Olduvai Gorge paleontological sites, and the vast Serengeti plains to the northwest. Neighboring Lake Manyara National Park and Tarangire National Park are less than two hours away, making Ngorongoro the hub of Tanzania\xE2\u20AC\u2122s northern safari circuit.",
    "bulletItems": [
      "Olduvai Gorge \xE2\u20AC\u201C \xE2\u20AC\u0153cradle of mankind\xE2\u20AC\x9D paleontology museum",
      "Empakaai Crater \xE2\u20AC\u201C flamingo lake",
      " guided rim walks",
      "Lake Manyara & Tarangire NP \xE2\u20AC\u201C easy circuit additions"
    ],
    "sortOrder": 1
  },
  {
    "id": "3a0acacf-9231-46d4-9559-6d366b43ef4e",
    "destinationId": "f8889113-3b88-46c0-ada0-8fb0dd4b2da4",
    "key": "things-to-do",
    "title": "Things To Do",
    "body": "A full-day crater-floor game drive is the essential experience, descending the Seneto descent road at dawn for the best light and least traffic. Elsewhere in the conservation area you can hike to the flamingo-flecked lake in Empakaai Crater, trek the Olmoti crater rim waterfalls, walk with rangers on the Northern Highlands Forest Reserve trails, and tour Olduvai Gorge\xE2\u20AC\u2122s world-famous archaeological site.",
    "bulletItems": [
      "Full-day 4x4 crater-floor game drive",
      "Empakaai Crater hike with flamingo lake views",
      "Olduvai Gorge museum and excavation-site tour",
      "Guided rim walks and Maasai village visits"
    ],
    "sortOrder": 2
  },
  {
    "id": "9cf8c933-2d2c-4d00-9b4a-7bb28953c96d",
    "destinationId": "f8889113-3b88-46c0-ada0-8fb0dd4b2da4",
    "key": "best-beaches",
    "title": "Best Beaches",
    "body": "Ngorongoro sits at 2,200m in the Tanzanian highlands, far from the sea. Safari circuits routinely finish with a flight from Arusha or Lake Manyara to Zanzibar, where Nungwi and Kendwa, Paje and the southeast-coast villages offer the classic Indian Ocean beach finale. Matemwe is a quieter option with excellent snorkeling off Mnemba Atoll.",
    "bulletItems": [
      "Nungwi & Kendwa",
      " Zanzibar \xE2\u20AC\u201C classic post-safari beach",
      "Matemwe \xE2\u20AC\u201C quiet base for Mnemba Atoll snorkeling",
      "Paje \xE2\u20AC\u201C kiteboarding and relaxed beach life"
    ],
    "sortOrder": 3
  },
  {
    "id": "170816f3-97ef-49b9-9e45-87209409eede",
    "destinationId": "f8889113-3b88-46c0-ada0-8fb0dd4b2da4",
    "key": "reviews",
    "title": "Reviews",
    "body": "Travelers describe the first view from the crater rim as unforgettable and the density of animals on the floor as unlike anywhere else \xE2\u20AC\u201D many see rhino here after missing them elsewhere in Africa. The main complaint is the number of vehicles around big sightings in high season; reviewers suggest a full-day descent starting at 6am and staying on the crater rim to be first down.",
    "bulletItems": [],
    "sortOrder": 4
  },
  {
    "id": "a149ac31-0695-415a-bd5c-436a68e63cb8",
    "destinationId": "f8889113-3b88-46c0-ada0-8fb0dd4b2da4",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Around 25,000 large mammals live permanently on the crater floor, including about 6,000 resident wildebeest, 4,000 zebra, 3,000 eland and 3,000 Grant\xE2\u20AC\u2122s and Thomson\xE2\u20AC\u2122s gazelles. Predators are exceptional: roughly 60\xE2\u20AC\u201C70 lions, healthy cheetah and leopard numbers, and large buffalo herds. Ngorongoro is Tanzania\xE2\u20AC\u2122s best place to see the endangered black rhino \xE2\u20AC\u201D around 30 individuals \xE2\u20AC\u201D and the soda lake draws flocks of flamingo. Giraffe are notably absent, deterred by the crater\xE2\u20AC\u2122s steep walls.",
    "bulletItems": [
      "Black rhino \xE2\u20AC\u201C among Africa\xE2\u20AC\u2122s best viewing odds",
      "Approximately 60\xE2\u20AC\u201C70 resident lions",
      "No giraffe \xE2\u20AC\u201C the one Big Five absence on the floor"
    ],
    "sortOrder": 5
  },
  {
    "id": "63f4b845-d3ed-4df9-99ed-51c74ced34d9",
    "destinationId": "f8889113-3b88-46c0-ada0-8fb0dd4b2da4",
    "key": "birds",
    "title": "Birds",
    "body": "More than 500 bird species occur across the conservation area. Lake Magadi on the crater floor clouds pink with lesser flamingos when conditions suit, while the highland forests host turacos, barbets and the rare Abbott\xE2\u20AC\u2122s starling. Endemic regional specialties such as the rufous-tailed weaver and Fischer\xE2\u20AC\u2122s lovebird appear on the plains to the north.",
    "bulletItems": [
      "Lesser flamingos on Lake Magadi",
      "Abbott\xE2\u20AC\u2122s starling \xE2\u20AC\u201C rare highland-forest endemic",
      "Schalow\xE2\u20AC\u2122s turaco and Hartlaub\xE2\u20AC\u2122s turaco in the rim forest"
    ],
    "sortOrder": 6
  },
  {
    "id": "13a9af8f-88ba-4116-83c2-73ffe6301b63",
    "destinationId": "e3ca55d0-31b2-480c-9d18-e8e0e9dbc56b",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Ruaha National Park:",
    "bulletItems": [
      "Game drives along the Great Ruaha River",
      "Walking safaris",
      "Birding"
    ],
    "sortOrder": 4
  },
  {
    "id": "2b3ffce1-839d-4e7e-801f-604d42e34296",
    "destinationId": "f8889113-3b88-46c0-ada0-8fb0dd4b2da4",
    "key": "best-time",
    "title": "Best Time To Visit",
    "body": "Ngorongoro is a year-round destination because the crater floor holds permanent water and resident game. June to October offers dry tracks and thin vegetation; January to February coincides with migration calving on the nearby Ndutu plains. From March to May the long rains bring mist over the rim and lush green landscapes with far fewer visitors.",
    "bulletItems": [
      "Jun\xE2\u20AC\u201COct: dry season",
      " best crater-floor driving conditions",
      "Jan\xE2\u20AC\u201CFeb: combine with Ndutu calving season",
      "Apr\xE2\u20AC\u201CMay: green season \xE2\u20AC\u201D fewer vehicles",
      " discounted rates"
    ],
    "sortOrder": 7
  },
  {
    "id": "07e7d959-8c43-406a-86f8-0daae55e3853",
    "destinationId": "f8889113-3b88-46c0-ada0-8fb0dd4b2da4",
    "key": "weather-climate",
    "title": "Weather & Climate",
    "body": "The crater rim sits at about 2,300m, so expect genuinely cool highland weather \xE2\u20AC\u201D mornings can drop below 10\xC2\xB0C and mist often blankets the rim, while the floor 600m below is noticeably warmer at 22\xE2\u20AC\u201C27\xC2\xB0C midday. Rains follow the Tanzanian pattern: short rains November\xE2\u20AC\u201CDecember, long rains March\xE2\u20AC\u201CMay.",
    "bulletItems": [],
    "sortOrder": 8
  },
  {
    "id": "942c55cc-cee5-4e13-866b-1a7db1323a0e",
    "destinationId": "f8889113-3b88-46c0-ada0-8fb0dd4b2da4",
    "key": "popular-routes",
    "title": "Popular Routes",
    "body": "Ngorongoro anchors every northern-circuit itinerary. The classic route runs Arusha \xE2\u20AC\u201C Tarangire \xE2\u20AC\u201C Lake Manyara \xE2\u20AC\u201C Ngorongoro \xE2\u20AC\u201C Serengeti and back, usually over 5\xE2\u20AC\u201C8 days, with the crater visited either en route to the Serengeti or on the return leg. Many travelers overnight on the rim, descending at dawn, before continuing to Seronera.",
    "bulletItems": [
      "Arusha \xE2\u20AC\u201C Ngorongoro \xE2\u20AC\u201C Serengeti \xE2\u20AC\u201C Ngorongoro (5\xE2\u20AC\u201C7 days)",
      "Arusha \xE2\u20AC\u201C Tarangire \xE2\u20AC\u201C Manyara \xE2\u20AC\u201C Ngorongoro \xE2\u20AC\u201C Serengeti (8 days)",
      "Crater + Ndutu calving special (Jan\xE2\u20AC\u201CFeb",
      " 6 days)"
    ],
    "sortOrder": 9
  },
  {
    "id": "09e18e18-0a63-4182-b1f8-34238b735644",
    "destinationId": "f8889113-3b88-46c0-ada0-8fb0dd4b2da4",
    "key": "getting-there",
    "title": "How To Get There",
    "body": "From Kilimanjaro International Airport (JRO) or Arusha, the crater rim at Lodoare Gate is a 3\xE2\u20AC\u201C4 hour drive on good tarmac via Mto wa Mbu and Karatu. Many tours combine the drive with Lake Manyara en route. Light-aircraft flights to Lake Manyara Airstrip cut the return trip. Conservation Area entry is US$71 per adult per day, plus a separate crater-service fee of US$299 per vehicle for a half-day descent.",
    "bulletItems": [
      "By road: Arusha \xE2\u2020\u2019 Lodoare Gate \xE2\u2030\u02C6 3.5 hours",
      "By air: Arusha \xE2\u2020\u2019 Lake Manyara airstrip \xE2\u2030\u02C6 30 min + transfer",
      "Fees: US$71/person/day entry + US$299/vehicle crater descent"
    ],
    "sortOrder": 10
  },
  {
    "id": "3a17d1c3-e1f5-4d3a-ab82-c43d086c824b",
    "destinationId": "f8889113-3b88-46c0-ada0-8fb0dd4b2da4",
    "key": "health-safety",
    "title": "Malaria & Vaccinations",
    "body": "The cool crater rim (2,300m) is lower risk for mosquitoes, but the surrounding lowlands and crater floor still warrant prophylaxis, repellent and long sleeves at dusk. Yellow fever certification applies if arriving from an endemic country; hepatitis A, typhoid and standard travel vaccinations are recommended. Altitude is modest, but visitors sensitive to cool, damp conditions should pack warm layers.",
    "bulletItems": [],
    "sortOrder": 11
  },
  {
    "id": "2c06220b-563b-4af4-a1a5-5f0f77177755",
    "destinationId": "f8889113-3b88-46c0-ada0-8fb0dd4b2da4",
    "key": "staying-safe",
    "title": "Staying Safe",
    "body": "Ngorongoro is an exceptionally safe destination with a strong ranger presence and controlled access. Remain in your vehicle on the crater floor \xE2\u20AC\u201D the grasslands hide buffalo and elephant \xE2\u20AC\u201D and only walk on designated rim and highland trails with an armed ranger. Camps escort guests between tent and mess after dark as standard practice.",
    "bulletItems": [],
    "sortOrder": 12
  },
  {
    "id": "444682ad-d065-4df7-89b4-0c6f2c9b9a57",
    "destinationId": "5459dbb7-8608-490b-8671-c3190be6b1c8",
    "key": "overview",
    "title": "Overview",
    "body": "Tanzania is Africa\xE2\u20AC\u2122s ultimate safari country: home to the Serengeti migration, Ngorongoro Crater, Mount Kilimanjaro and 22 national parks plus the spice-scented beaches of Zanzibar. The Northern circuit (Serengeti, Ngorongoro, Tarangire, Lake Manyara, Kilimanjaro) is the classic first-time route; the Southern circuit (Nyerere, Ruaha, Mikumi) delivers wild, uncrowded walking safaris; the remote Western circuit (Katavi, Gombe, Mahale) offers chimp trekking and genuine off-grid wilderness.",
    "bulletItems": [
      "22 national parks and 1 conservation area across three circuits",
      "Home of the Great Migration and Africa\xE2\u20AC\u2122s highest mountain",
      "English widely spoken; currency Tanzanian shilling (TZS)"
    ],
    "sortOrder": 0
  },
  {
    "id": "46b238a2-de2f-4b64-a8c0-6ea5a7e9c4a3",
    "destinationId": "5459dbb7-8608-490b-8671-c3190be6b1c8",
    "key": "parks-reserves",
    "title": "Parks & Reserves",
    "body": "Tanzania protects close to 38% of its land area. Beyond the headline Northern parks, Ruaha and Nyerere (Selous) anchor the South with superb predator densities and boat safaris, while Katavi and Mahale Mountains in the West see a fraction of the visitors. The Ngorongoro Conservation Area uniquely blends wildlife protection with Maasai pastoralism, and the Zanzibar archipelago adds marine parks and Jozani Forest\xE2\u20AC\u2122s endemic red colobus.",
    "bulletItems": [
      "Serengeti NP \xE2\u20AC\u201C Great Migration and Africa\xE2\u20AC\u2122s densest lion population",
      "Ngorongoro Crater \xE2\u20AC\u201C easiest Big Five viewing in East Africa",
      "Ruaha NP \xE2\u20AC\u201C 10% of the world\xE2\u20AC\u2122s remaining lions",
      "Nyerere NP \xE2\u20AC\u201C boat safaris and wild dogs on the Rufiji River",
      "Mahale Mountains NP \xE2\u20AC\u201C chimpanzee trekking on Lake Tanganyika"
    ],
    "sortOrder": 1
  },
  {
    "id": "a4f4aabd-746e-452d-878c-77e5bab93860",
    "destinationId": "5459dbb7-8608-490b-8671-c3190be6b1c8",
    "key": "things-to-do",
    "title": "Things To Do",
    "body": "Game drives are just the start. Tanzania offers multiday treks up Kilimanjaro (5,895m) and its gentler cousin Mt Meru, chimpanzee trekking at Gombe and Mahale, walking and boat safaris in the southern parks, hot-air ballooning over the Serengeti, snorkeling and diving off Zanzibar and Mafia, and cultural encounters with Maasai, Hadzabe and Chaga communities.",
    "bulletItems": [
      "Kilimanjaro treks via Machame",
      " Lemosho or Marangu routes",
      "Chimp trekking at Gombe Stream and Mahale Mountains",
      "Balloon safaris over Serengeti and Tarangire",
      "Diving and dhow sailing in Zanzibar and Mafia"
    ],
    "sortOrder": 2
  },
  {
    "id": "f2b6967e-4864-4962-9d0f-ce7e7cfc82ef",
    "destinationId": "5459dbb7-8608-490b-8671-c3190be6b1c8",
    "key": "best-beaches",
    "title": "Best Beaches",
    "body": "Tanzania\xE2\u20AC\u2122s 1,400km Indian Ocean coastline and its islands rank among the world\xE2\u20AC\u2122s finest. Zanzibar\xE2\u20AC\u2122s Nungwi and Kendwa offer postcard sand and sunset dhow cruises; Paje and Jambiani bring kitesurfing and village calm; Pemba is the diver\xE2\u20AC\u2122s island; and remote Mafia Island hosts whale sharks from October to February. Mainland gems like Pangani and Bagamoyo see almost no tourists.",
    "bulletItems": [
      "Nungwi & Kendwa \xE2\u20AC\u201C swimming-friendly",
      " liveliest stretches",
      "Paje & Jambiani \xE2\u20AC\u201C southeast coast kitesurf and quiet villages",
      "Mafia Island \xE2\u20AC\u201C whale sharks and Chole Bay marine park"
    ],
    "sortOrder": 3
  },
  {
    "id": "f0a0a682-f376-49b7-a4cd-16de23a9870a",
    "destinationId": "5459dbb7-8608-490b-8671-c3190be6b1c8",
    "key": "reviews",
    "title": "Reviews",
    "body": "Tanzania scores among the highest-rated safari countries in traveler reviews, with the Serengeti and Ngorongoro repeatedly described as trip-of-a-lifetime destinations. Reviewers praise guide quality and the variety possible in one itinerary \xE2\u20AC\u201D bush then beach \xE2\u20AC\u201D while flagging park-fee costs and traffic around migration sightings as the few negatives.",
    "bulletItems": [],
    "sortOrder": 4
  },
  {
    "id": "ba2a6dad-61a2-410a-946b-9ce15a1963d1",
    "destinationId": "90fca831-5d85-4cdf-bbe5-b0049b30bafd",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Both black and white rhinos, Rothschild\xE2\u20AC\u2122s giraffe, and at times more than a million lesser and greater flamingos.",
    "bulletItems": [
      "Black rhino",
      "White rhino",
      "Rothschild giraffe",
      "Lion",
      "Leopard",
      "Flamingo"
    ],
    "sortOrder": 1
  },
  {
    "id": "901b26f9-de99-4faf-bc12-8379f099edd6",
    "destinationId": "5459dbb7-8608-490b-8671-c3190be6b1c8",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Tanzania holds roughly 20% of Africa\xE2\u20AC\u2122s large-mammal population. The annual migration involves 1.5 million wildebeest and hundreds of thousands of zebra; the country shelters about a third of all African lions and a significant share of the world\xE2\u20AC\u2122s remaining wild dogs, found in Nyerere, Ruaha and Katavi. Elephant densities are high in Tarangire, black rhino persist in Ngorongoro, and chimpanzees live at Gombe and Mahale.",
    "bulletItems": [
      "Big Five in the Northern circuit parks",
      "Around a third of Africa\xE2\u20AC\u2122s lions live in Tanzania",
      "Wild dogs best seen in Ruaha and Nyerere"
    ],
    "sortOrder": 5
  },
  {
    "id": "55f3adc1-64e3-4bdb-9c0f-dc4da5975686",
    "destinationId": "5459dbb7-8608-490b-8671-c3190be6b1c8",
    "key": "birds",
    "title": "Birds",
    "body": "With over 1,100 recorded species \xE2\u20AC\u201D including more than 20 country endemics \xE2\u20AC\u201D Tanzania is a top-tier birding destination. The Eastern Arc Mountains (Udzungwa, Usambara) hold endemics like the Udzungwa forest partridge, while the Serengeti plains and Rift Valley lakes deliver spectacular raptor and flamingo displays. November to April is peak season, when migrants arrive in breeding plumage.",
    "bulletItems": [
      "Over 1",
      "100 species and 20+ endemics",
      "Usambara and Udzungwa mountains for forest endemics",
      "Flamingo spectacle at Lake Natron and Empakaai"
    ],
    "sortOrder": 6
  },
  {
    "id": "9b7acfb3-b000-4b03-85f3-25b0dbe36fa3",
    "destinationId": "5459dbb7-8608-490b-8671-c3190be6b1c8",
    "key": "best-time",
    "title": "Best Time To Visit",
    "body": "June to October is the prime dry season across the country \xE2\u20AC\u201D ideal for wildlife viewing and the only comfortable time for Kilimanjaro summit attempts. January to February brings the wildebeest calving season to the southern Serengeti. The Southern and Western circuits are best avoided in the wet months of March to May, though the Northern parks remain productive, and Zanzibar is pleasant whenever the rains pause.",
    "bulletItems": [
      "Jun\xE2\u20AC\u201COct: dry season",
      " best game viewing nationwide",
      "Jan\xE2\u20AC\u201CFeb: calving season in the southern Serengeti",
      "Jul\xE2\u20AC\u201COct: Mara River crossings in the far north"
    ],
    "sortOrder": 7
  },
  {
    "id": "87373468-1258-4e90-b221-6ce8038417b7",
    "destinationId": "5459dbb7-8608-490b-8671-c3190be6b1c8",
    "key": "weather-climate",
    "title": "Weather & Climate",
    "body": "Coastal and island Tanzania is hot and humid year-round (28\xE2\u20AC\u201C32\xC2\xB0C), while safari parks on the plateau enjoy warm days (23\xE2\u20AC\u201C28\xC2\xB0C) and cool nights. The main rains fall March to May, with a shorter wet season in November and December. Altitude matters: Ngorongoro\xE2\u20AC\u2122s rim and Kilimanjaro\xE2\u20AC\u2122s slopes are genuinely cold, so layers are essential on any itinerary.",
    "bulletItems": [],
    "sortOrder": 8
  },
  {
    "id": "5cae2d3f-fd7c-4003-87e3-236e1ca69dee",
    "destinationId": "5459dbb7-8608-490b-8671-c3190be6b1c8",
    "key": "popular-routes",
    "title": "Popular Routes",
    "body": "The northern safari circuit is the most traveled route: Arusha \xE2\u20AC\u201C Tarangire \xE2\u20AC\u201C Lake Manyara \xE2\u20AC\u201C Ngorongoro \xE2\u20AC\u201C Serengeti, typically over 5\xE2\u20AC\u201C10 days and often ending with a Zanzibar flight from Arusha. Southern routes pair Nyerere and Ruaha out of Dar es Salaam for week-long fly-in safaris, while the western route to Katavi and Mahale suits returning safari veterans.",
    "bulletItems": [
      "Northern circuit: Arusha \xE2\u20AC\u201C Tarangire \xE2\u20AC\u201C Ngorongoro \xE2\u20AC\u201C Serengeti (7 days)",
      "Bush & beach: Northern circuit + Zanzibar (10\xE2\u20AC\u201C12 days)",
      "Southern safari: Dar \xE2\u20AC\u201C Nyerere \xE2\u20AC\u201C Ruaha fly-in (7 days)"
    ],
    "sortOrder": 9
  },
  {
    "id": "c9504a03-0a2c-483a-9146-78ab0d50482b",
    "destinationId": "5459dbb7-8608-490b-8671-c3190be6b1c8",
    "key": "getting-there",
    "title": "How To Get There",
    "body": "Most international flights land at Julius Nyerere International Airport (DAR) in Dar es Salaam or Kilimanjaro International Airport (JRO) between Arusha and Moshi \xE2\u20AC\u201D the latter serving the Northern circuit. Domestic carriers connect major parks via an extensive network of bush airstrips. Zanzibar receives direct regional and some international flights. Visa-on-arrival and e-visa are available to most nationalities.",
    "bulletItems": [
      "JRO for the Northern circuit; DAR for the South and coast",
      "Domestic bush flights link Serengeti",
      " Ruaha",
      " Nyerere airstrips",
      "E-visa available online; US$50\xE2\u20AC\u201C100 for most nationalities"
    ],
    "sortOrder": 10
  },
  {
    "id": "6f8878e2-4b6b-43c8-a59c-1deff10a1738",
    "destinationId": "5459dbb7-8608-490b-8671-c3190be6b1c8",
    "key": "health-safety",
    "title": "Malaria & Vaccinations",
    "body": "Malaria is present across Tanzania below 1,800m \xE2\u20AC\u201D prophylaxis is strongly advised for all safari areas, with repellent and long clothing at dusk. A yellow fever certificate is mandatory if arriving from an endemic country. Recommended vaccinations include hepatitis A, typhoid, tetanus and rabies (for remote circuits). Zanzibar requires the same precautions as the mainland coast.",
    "bulletItems": [],
    "sortOrder": 11
  },
  {
    "id": "ca1b0291-dab0-49be-b626-8a6f3cf39688",
    "destinationId": "5459dbb7-8608-490b-8671-c3190be6b1c8",
    "key": "staying-safe",
    "title": "Staying Safe",
    "body": "Tanzania is one of East Africa\xE2\u20AC\u2122s most stable and welcoming countries, and its parks are extremely safe with a strong ranger presence. In cities, take normal precautions against petty theft \xE2\u20AC\u201D use registered taxis after dark and keep valuables out of sight. On safari, follow guide instructions around wildlife; on Kilimanjaro, choose KPAP-affiliated operators for a safe, ethical trek.",
    "bulletItems": [],
    "sortOrder": 12
  },
  {
    "id": "2d256323-5e18-4bb9-a2fc-30b68639d212",
    "destinationId": "bda958ca-0181-496c-9a9a-fa3f108f7e52",
    "key": "overview",
    "title": "Overview",
    "body": "Kenya is the birthplace of the safari and remains one of Africa\xE2\u20AC\u2122s most rewarding wildlife destinations. The Masai Mara anchors the famous migration season, Amboseli delivers textbook elephant-with-Kilimanjaro photography, and Samburu\xE2\u20AC\u2122s arid north hosts unique \xE2\u20AC\u0153Special Five\xE2\u20AC\x9D species. Add the Rift Valley lakes, Tsavo\xE2\u20AC\u2122s red elephants and a coastline of white-sand beaches, and Kenya covers every safari style from budget camping to ultra-luxury.",
    "bulletItems": [
      "Home of the original safari \xE2\u20AC\u201D over a century of guiding heritage",
      "Big Five in most major parks; migration Jul\xE2\u20AC\u201COct in the Mara",
      "Nairobi is the safari hub \xE2\u20AC\u201D parks within an hour\xE2\u20AC\u2122s flight"
    ],
    "sortOrder": 0
  },
  {
    "id": "dd6a504b-b76a-4a5e-8ce2-02a92b88c237",
    "destinationId": "bda958ca-0181-496c-9a9a-fa3f108f7e52",
    "key": "parks-reserves",
    "title": "Parks & Reserves",
    "body": "Kenya protects 23 national parks and 28 national reserves. The Masai Mara and its community conservancies headline the southwest; Amboseli sits beneath Kilimanjaro in the south; Tsavo East and West together form one of the largest protected areas on Earth; and the northern reserves of Samburu, Buffalo Springs and Shaba shelter arid-country endemics. Lake Nakuru is a rhino sanctuary, and Ol Pejeta Conservancy hosts the last northern white rhinos.",
    "bulletItems": [
      "Masai Mara NR \xE2\u20AC\u201C big cats and the Great Migration",
      "Amboseli NP \xE2\u20AC\u201C big tusker elephants under Kilimanjaro",
      "Samburu/Buffalo Springs \xE2\u20AC\u201C Grevy\xE2\u20AC\u2122s zebra",
      " gerenuk",
      " reticulated giraffe",
      "Tsavo East & West \xE2\u20AC\u201C vast wilderness and red-dust elephants"
    ],
    "sortOrder": 1
  },
  {
    "id": "ddd61dec-aeb2-4ad4-b995-d98483b4f962",
    "destinationId": "bda958ca-0181-496c-9a9a-fa3f108f7e52",
    "key": "things-to-do",
    "title": "Things To Do",
    "body": "Beyond classic game drives, Kenya offers hot-air balloon safaris over the Mara, walking and camel safaris in the north, rhino tracking on foot at Ol Pejeta, chimpanzee viewing at Sweetwaters, birding around the Rift Valley lakes, mountain climbing on Mt Kenya, and world-class kitesurfing at Diani. Cultural visits to Maasai and Samburu communities are among Africa\xE2\u20AC\u2122s most authentic.",
    "bulletItems": [
      "Balloon safari and champagne breakfast in the Mara",
      "Foot-based rhino tracking at Ol Pejeta Conservancy",
      "Mt Kenya trekking \xE2\u20AC\u201D Africa\xE2\u20AC\u2122s second-highest peak",
      "Kitesurfing and diving on the Diani and Watamu coast"
    ],
    "sortOrder": 2
  },
  {
    "id": "f27de543-2e84-46b2-a5fe-fb7d69bc66bd",
    "destinationId": "bda958ca-0181-496c-9a9a-fa3f108f7e52",
    "key": "best-beaches",
    "title": "Best Beaches",
    "body": "Kenya\xE2\u20AC\u2122s 536km coastline combines white sand, marine parks and Swahili history. Diani Beach is the country\xE2\u20AC\u2122s flagship \xE2\u20AC\u201D 15km of powder sand south of Mombasa; Watamu pairs turtle-filled creeks with a marine national park; Kilifi is the quiet middle ground; and the Lamu archipelago offers a car-free, centuries-old Swahili world. Domestic flights link the Mara directly to Ukunda and Malindi airstrips.",
    "bulletItems": [
      "Diani Beach \xE2\u20AC\u201C Kenya\xE2\u20AC\u2122s finest white-sand strand",
      "Watamu \xE2\u20AC\u201C marine park snorkeling and Mida Creek mangroves",
      "Lamu \xE2\u20AC\u201C UNESCO-listed Swahili island culture"
    ],
    "sortOrder": 3
  },
  {
    "id": "ed575c6c-4709-4689-846a-2a5e877cc102",
    "destinationId": "bda958ca-0181-496c-9a9a-fa3f108f7e52",
    "key": "reviews",
    "title": "Reviews",
    "body": "Kenya earns high marks for guide expertise, migration drama and the ease of combining bush and beach. Reviewers praise the conservancy model for exclusivity and night drives, and note that the Mara itself can feel crowded in August\xE2\u20AC\u201CSeptember \xE2\u20AC\u201D most recommend conservancy stays or shoulder-season travel for a quieter experience.",
    "bulletItems": [],
    "sortOrder": 4
  },
  {
    "id": "59a06fbb-9342-4a53-9f5b-a237c63d376c",
    "destinationId": "bda958ca-0181-496c-9a9a-fa3f108f7e52",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Kenya hosts all the classic safari species, with roughly 850 lions in the Mara ecosystem alone and Amboseli\xE2\u20AC\u2122s celebrated big-tusker elephants. The July\xE2\u20AC\u201COctober migration brings over a million wildebeest into the Mara from the Serengeti. Rare species have dedicated strongholds: Grevy\xE2\u20AC\u2122s zebra and gerenuk in Samburu, black and white rhino at Ol Pejeta and Lake Nakuru, and sitatunga in Saiwa Swamp.",
    "bulletItems": [
      "Big Five reliably seen in Mara",
      " Amboseli",
      " Nakuru and Tsavo",
      "Special Five of the arid north: Grevy\xE2\u20AC\u2122s zebra",
      " gerenuk",
      " oryx",
      " Somali ostrich",
      " reticulated giraffe",
      "Migration river crossings Jul\xE2\u20AC\u201COct"
    ],
    "sortOrder": 5
  },
  {
    "id": "543643a2-464a-4601-8d69-f72ec55949f2",
    "destinationId": "bda958ca-0181-496c-9a9a-fa3f108f7e52",
    "key": "birds",
    "title": "Birds",
    "body": "Kenya\xE2\u20AC\u2122s checklist of over 1,100 species is among the largest in Africa, crammed into habitats from coral reefs to glacial peaks. The Rift Valley lakes \xE2\u20AC\u201D Bogoria, Nakuru, Elmenteita \xE2\u20AC\u201D host flamingo spectacles and pelican flocks; Kakamega Forest shelters Central African lowland species at their eastern limit; and the arid north adds Somali-masai endemics. November to April is best for migrants and breeding plumage.",
    "bulletItems": [
      "Over 1",
      "100 species \xE2\u20AC\u201D fourth-longest checklist in Africa",
      "Flamingos and pelicans on the Rift Valley lakes",
      "Kakamega Forest \xE2\u20AC\u201C unique Guineo-Congolian rainforest birding"
    ],
    "sortOrder": 6
  },
  {
    "id": "c1c615dd-63fc-48ed-aaa6-ccbb7085accc",
    "destinationId": "bda958ca-0181-496c-9a9a-fa3f108f7e52",
    "key": "best-time",
    "title": "Best Time To Visit",
    "body": "January to March and June to October are the prime windows \xE2\u20AC\u201D dry, sunny and excellent for game viewing. July to October adds the migration in the Mara and is peak season, requiring early bookings. April\xE2\u20AC\u201CMay\xE2\u20AC\u2122s long rains bring dramatic afternoon storms and lush scenery at low-season prices; wildlife remains good, though some roads and camps in the north become difficult.",
    "bulletItems": [
      "Jul\xE2\u20AC\u201COct: migration and peak game viewing",
      "Jan\xE2\u20AC\u201CMar: dry",
      " hot and less crowded",
      "Apr\xE2\u20AC\u201CMay: long rains \xE2\u20AC\u201D lowest rates",
      " green season"
    ],
    "sortOrder": 7
  },
  {
    "id": "aca01456-fb85-4cfd-9faf-4183d4399ec0",
    "destinationId": "bda958ca-0181-496c-9a9a-fa3f108f7e52",
    "key": "weather-climate",
    "title": "Weather & Climate",
    "body": "Kenya straddles the equator, but altitude tempers the heat: Nairobi and the central highlands sit at 1,500\xE2\u20AC\u201C2,000m with pleasant 20\xE2\u20AC\u201C26\xC2\xB0C days and cool nights, while the coast is hot and humid and the arid north regularly exceeds 35\xC2\xB0C. Rains arrive in two seasons \xE2\u20AC\u201D long rains March to May and short rains November to December \xE2\u20AC\u201D usually as afternoon thunderstorms.",
    "bulletItems": [],
    "sortOrder": 8
  },
  {
    "id": "0d40e537-7088-46c2-ad75-cc27caee3199",
    "destinationId": "bda958ca-0181-496c-9a9a-fa3f108f7e52",
    "key": "popular-routes",
    "title": "Popular Routes",
    "body": "The classic Kenya circuit runs Nairobi \xE2\u20AC\u201C Amboseli \xE2\u20AC\u201C Lake Nakuru \xE2\u20AC\u201C Masai Mara over 6\xE2\u20AC\u201C8 days. Short fly-in safaris to the Mara suit long weekends; the grand northern route adds Samburu and Ol Pejeta; and the coast safari pairs the Mara with Diani or Watamu. Cross-border itineraries link the Mara to Tanzania\xE2\u20AC\u2122s Serengeti via the Isebania crossing.",
    "bulletItems": [
      "Nairobi \xE2\u20AC\u201C Amboseli \xE2\u20AC\u201C Nakuru \xE2\u20AC\u201C Mara (7 days)",
      "Nairobi \xE2\u20AC\u201C Samburu \xE2\u20AC\u201C Ol Pejeta \xE2\u20AC\u201C Mara (8\xE2\u20AC\u201C10 days)",
      "Mara + Diani Beach bush-and-beach (8 days)"
    ],
    "sortOrder": 9
  },
  {
    "id": "889a3e10-9d46-40b8-9534-d48afa8f49cf",
    "destinationId": "bda958ca-0181-496c-9a9a-fa3f108f7e52",
    "key": "getting-there",
    "title": "How To Get There",
    "body": "Jomo Kenyatta International Airport (NBO) in Nairobi is East Africa\xE2\u20AC\u2122s busiest hub with direct flights from Europe, the Middle East and Asia. Wilson Airport handles the domestic hopper flights to Mara, Amboseli, Samburu and coastal airstrips. Mombasa\xE2\u20AC\u2122s Moi International serves beach arrivals. E-visas are issued online and at arrival for most nationalities; park fees are card-payable at the gates.",
    "bulletItems": [
      "NBO for international arrivals; WIL for bush flights",
      "Domestic flights to Mara",
      " Amboseli",
      " Samburu",
      " coast \xE2\u2030\xA4 1.5h",
      "E-visa: evisa.go.ke \xE2\u20AC\u201D apply before travel"
    ],
    "sortOrder": 10
  },
  {
    "id": "baea6a54-1738-40aa-a58a-1469be43648e",
    "destinationId": "bda958ca-0181-496c-9a9a-fa3f108f7e52",
    "key": "health-safety",
    "title": "Malaria & Vaccinations",
    "body": "Malaria occurs in most safari areas below 2,000m \xE2\u20AC\u201D take prophylaxis, use DEET repellent and cover up at dusk; Nairobi and the highlands are lower risk. A yellow fever certificate is required when arriving from endemic countries, and hepatitis A, typhoid and routine vaccinations are recommended. Tap water is not reliably safe \xE2\u20AC\u201D stick to bottled or filtered water.",
    "bulletItems": [],
    "sortOrder": 11
  },
  {
    "id": "b299b90d-b951-440d-a71a-aaecff4928aa",
    "destinationId": "bda958ca-0181-496c-9a9a-fa3f108f7e52",
    "key": "staying-safe",
    "title": "Staying Safe",
    "body": "Kenya\xE2\u20AC\u2122s safari circuits are safe, mature tourism destinations with professional ranger and security networks. Exercise normal urban caution in Nairobi \xE2\u20AC\u201D avoid walking at night, use ride-hailing apps and keep valuables secure. In parks, follow your guide\xE2\u20AC\u2122s lead around wildlife and never exit vehicles except at designated points. Coastal resorts and conservancies maintain excellent security records.",
    "bulletItems": [],
    "sortOrder": 12
  },
  {
    "id": "07c1dd56-3670-4f8d-9873-2efc82a627a7",
    "destinationId": "2c680e59-6b5b-4f73-81bd-62ea1f384ed4",
    "key": "overview",
    "title": "Overview",
    "body": "Botswana practices high-value, low-volume tourism, and the result is Africa\xE2\u20AC\u2122s most exclusive safari experience. The Okavango Delta \xE2\u20AC\u201D a 15,000km\xC2\xB2 inland water wonderland and UNESCO World Heritage Site \xE2\u20AC\u201D offers mokoro trips through papyrus channels, while Chobe holds the continent\xE2\u20AC\u2122s largest elephant population and the Kalahari\xE2\u20AC\u2122s black-maned lions stalk the vast Central Kalahari Game Reserve. English is the official language and the pula is among Africa\xE2\u20AC\u2122s most stable currencies.",
    "bulletItems": [
      "Okavango Delta \xE2\u20AC\u201C UNESCO-listed inland delta",
      " best May\xE2\u20AC\u201COct",
      "Roughly 130",
      "000 elephants \xE2\u20AC\u201D Africa\xE2\u20AC\u2122s largest population",
      "High-value/low-volume policy keeps crowds thin"
    ],
    "sortOrder": 0
  },
  {
    "id": "a5daf9b8-e55e-4a32-a2d7-96edb7989d2a",
    "destinationId": "2c680e59-6b5b-4f73-81bd-62ea1f384ed4",
    "key": "staying-safe",
    "title": "Staying Safe",
    "body": "Botswana is among Africa\xE2\u20AC\u2122s safest and most politically stable countries, with a low crime rate and excellent tourism infrastructure. Wildlife presents the only real risks \xE2\u20AC\u201D elephants are genuinely dangerous: keep distance on foot, never walk between camps at night without an escort, and follow guides\xE2\u20AC\u2122 instructions around hippos and crocodiles on the waterways. Self-drivers should respect the parks\xE2\u20AC\u2122 strict off-road and night-driving rules.",
    "bulletItems": [],
    "sortOrder": 12
  },
  {
    "id": "385dd65f-c299-4e0e-a115-6b9c2fe88393",
    "destinationId": "2c680e59-6b5b-4f73-81bd-62ea1f384ed4",
    "key": "parks-reserves",
    "title": "Parks & Reserves",
    "body": "Botswana\xE2\u20AC\u2122s protected network is dominated by the Okavango Delta and Moremi Game Reserve at its heart, Chobe National Park in the north, the immense Central Kalahari Game Reserve (52,800km\xC2\xB2), the Makgadikgadi and Nxai Pan salt-pan parks, and the remote Kgalagadi Transfrontier Park. Private concession areas around the delta offer night drives, walking safaris and off-road tracking unavailable in the national parks.",
    "bulletItems": [
      "Moremi Game Reserve \xE2\u20AC\u201C the delta\xE2\u20AC\u2122s wildlife core",
      "Chobe NP \xE2\u20AC\u201C river cruises past thousands of elephants",
      "Central Kalahari GR \xE2\u20AC\u201C black-maned lions on fossil riverbeds",
      "Makgadikgadi Pans \xE2\u20AC\u201C zebra migration and meerkats"
    ],
    "sortOrder": 1
  },
  {
    "id": "d4811896-5d99-41b3-9504-b619b720fd7f",
    "destinationId": "2c680e59-6b5b-4f73-81bd-62ea1f384ed4",
    "key": "things-to-do",
    "title": "Things To Do",
    "body": "Gliding silently through delta channels in a mokoro (dugout canoe) is Botswana\xE2\u20AC\u2122s signature activity, complemented by motorboat safaris, game drives and water-camp fly fishing for tigerfish. Chobe offers famous sunset river cruises; the Kalahari delivers San (Bushmen) guided walks and meerkat encounters at the pans; and the country\xE2\u20AC\u2122s superb infrastructure makes it Africa\xE2\u20AC\u2122s premier self-drive destination.",
    "bulletItems": [
      "Mokoro excursions through the delta\xE2\u20AC\u2122s channels",
      "Chobe River sunset cruise among bathing elephants",
      "Meerkat and quad-bike adventures on the Makgadikgadi Pans",
      "Fully outfitted 4x4 self-drive safaris"
    ],
    "sortOrder": 2
  },
  {
    "id": "008a8f05-c6e1-46c6-9cd0-065034f339ff",
    "destinationId": "2c680e59-6b5b-4f73-81bd-62ea1f384ed4",
    "key": "best-beaches",
    "title": "Best Beaches",
    "body": "Landlocked Botswana has no coastline \xE2\u20AC\u201D but its water experiences are unique. Travelers craving sand pair Botswana with Zimbabwe\xE2\u20AC\u2122s Victoria Falls (a 90-minute drive from Chobe), Namibia\xE2\u20AC\u2122s Skeleton Coast, or fly via Johannesburg to Mozambique\xE2\u20AC\u2122s Bazaruto Archipelago for the classic delta-then-dhow combination.",
    "bulletItems": [
      "Victoria Falls",
      " Zimbabwe \xE2\u20AC\u201C easy add-on from Chobe",
      "Bazaruto Archipelago",
      " Mozambique \xE2\u20AC\u201C fly-in beach extension",
      "Makgadikgadi Pans \xE2\u20AC\u201C surreal salt-flats \xE2\u20AC\u0153beach\xE2\u20AC\x9D under the stars"
    ],
    "sortOrder": 3
  },
  {
    "id": "5b674944-8a0c-4db7-8bc1-0d044eef43ff",
    "destinationId": "2c680e59-6b5b-4f73-81bd-62ea1f384ed4",
    "key": "reviews",
    "title": "Reviews",
    "body": "Botswana consistently earns the highest satisfaction ratings in African travel reviews, with guests praising the exclusivity, the quality of guiding and the romance of water camps reachable only by light aircraft. The most common complaint is price \xE2\u20AC\u201D delta camps run US$600\xE2\u20AC\u201C1,500 per person per night \xE2\u20AC\u201D though reviewers overwhelmingly agree it is worth it.",
    "bulletItems": [],
    "sortOrder": 4
  },
  {
    "id": "ac82ee40-d5ec-4bb8-a5cd-25cdeb32dc77",
    "destinationId": "2c680e59-6b5b-4f73-81bd-62ea1f384ed4",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "The Okavango Delta supports all of the Big Five plus African wild dogs at their highest density anywhere \xE2\u20AC\u201D the delta and Linyanti are the best places on Earth to see them. Chobe\xE2\u20AC\u2122s riverfront teems with up to 120,000 elephants in the dry season, the Kalahari holds desert-adapted black-maned lions and brown hyenas, and the Makgadikgadi hosts Africa\xE2\u20AC\u2122s second-largest zebra migration.",
    "bulletItems": [
      "Wild dogs \xE2\u20AC\u201C world\xE2\u20AC\u2122s best sighting odds in the delta",
      "Chobe \xE2\u20AC\u201C Africa\xE2\u20AC\u2122s largest elephant concentration",
      "Zebra migration between Okavango and Makgadikgadi (Dec\xE2\u20AC\u201CMar)"
    ],
    "sortOrder": 5
  },
  {
    "id": "56dee8c5-0684-4c05-a612-e4417d9c4f09",
    "destinationId": "2c680e59-6b5b-4f73-81bd-62ea1f384ed4",
    "key": "birds",
    "title": "Birds",
    "body": "Botswana counts over 590 bird species, with the Okavango\xE2\u20AC\u2122s wetlands the undoubted centerpiece: slaty egrets, wattled cranes, Pel\xE2\u20AC\u2122s fishing owls and African skimmers patrol the channels. The Kalahari adds arid specialists such as Kori bustards, crimson-breasted shrikes and Burchell\xE2\u20AC\u2122s sandgrouse. November to March brings migrants and the delta\xE2\u20AC\u2122s breeding season displays.",
    "bulletItems": [
      "Pel\xE2\u20AC\u2122s fishing owl \xE2\u20AC\u201C delta twilight specialty",
      "Slaty egret and wattled crane in the permanent swamps",
      "Carmine bee-eater colonies on the sandbanks (Sep\xE2\u20AC\u201CNov)"
    ],
    "sortOrder": 6
  },
  {
    "id": "5d65099d-6699-4dfb-bbd2-a2142a0221c1",
    "destinationId": "2c680e59-6b5b-4f73-81bd-62ea1f384ed4",
    "key": "best-time",
    "title": "Best Time To Visit",
    "body": "May to October is the delta\xE2\u20AC\u2122s flood season coinciding with the dry winter \xE2\u20AC\u201D water levels peak, game concentrates on the islands and mokoro trips are at their best; July to October in Chobe is elephant spectacle season. The green season of November to April brings dramatic storms, newborn antelope, migrant birds and sharply discounted rates, though some delta camps close in the wettest months.",
    "bulletItems": [
      "May\xE2\u20AC\u201COct: peak flood and dry season \xE2\u20AC\u201D book a year ahead",
      "Nov\xE2\u20AC\u201CApr: green season",
      " lower rates",
      " birding at its best",
      "Dec\xE2\u20AC\u201CMar: zebra migration on the Makgadikgadi grasslands"
    ],
    "sortOrder": 7
  },
  {
    "id": "2b552e78-7dec-4c5f-8ede-5b6b2c51683f",
    "destinationId": "2c680e59-6b5b-4f73-81bd-62ea1f384ed4",
    "key": "weather-climate",
    "title": "Weather & Climate",
    "body": "Botswana\xE2\u20AC\u2122s climate is semi-arid with big temperature swings: Kalahari winter nights (Jun\xE2\u20AC\u201CAug) drop near freezing while October afternoons top 40\xC2\xB0C. Days in the dry winter season are mild and clear \xE2\u20AC\u201D perfect game-viewing weather. The single wet season runs November to March, delivering brief but violent afternoon thunderstorms that transform the pans into grasslands.",
    "bulletItems": [],
    "sortOrder": 8
  },
  {
    "id": "6e25f711-26f7-452a-afd0-b15e55b1911a",
    "destinationId": "2c680e59-6b5b-4f73-81bd-62ea1f384ed4",
    "key": "popular-routes",
    "title": "Popular Routes",
    "body": "The classic fly-in delta route hops between two or three water and land camps plus Chobe, over 6\xE2\u20AC\u201C10 days, usually booked as a package from Maun or Kasane. Self-drivers follow the Maun \xE2\u20AC\u201C Moremi \xE2\u20AC\u201C Savuti \xE2\u20AC\u201C Chobe 4x4 trail. Popular combinations add Victoria Falls and/or the Makgadikgadi Pans, or continue south to the Kgalagadi.",
    "bulletItems": [
      "Fly-in delta: Maun \xE2\u20AC\u201C water camp \xE2\u20AC\u201C land camp \xE2\u20AC\u201C Chobe (7 days)",
      "Self-drive: Maun \xE2\u20AC\u201C Moremi \xE2\u20AC\u201C Savuti \xE2\u20AC\u201C Chobe (8\xE2\u20AC\u201C10 days)",
      "Delta + Vic Falls + Caprivi combo (10 days)"
    ],
    "sortOrder": 9
  },
  {
    "id": "a8e8645a-39ed-401c-a82f-8cd8ffc798ae",
    "destinationId": "2c680e59-6b5b-4f73-81bd-62ea1f384ed4",
    "key": "getting-there",
    "title": "How To Get There",
    "body": "Most visitors arrive via Sir Seretse Khama International Airport (GBE) in Gaborone or, for safari circuits, fly into Maun (MUB) or Kasane (BBK) from Johannesburg or Gaborone. Light-aircraft charters connect Maun to delta airstrips \xE2\u20AC\u201D the only way in to water camps. Chobe is a 90-minute drive from Victoria Falls or Livingstone airports. Visas are visa-free or on arrival for most Western nationalities.",
    "bulletItems": [
      "Maun (MUB) is the delta gateway; Kasane (BBK) for Chobe",
      "Light-aircraft transfers to delta camps \xE2\u2030\xA4 45 min",
      "Johannesburg offers the best international connections"
    ],
    "sortOrder": 10
  },
  {
    "id": "fe87b4f5-2b18-4f96-9100-4908230313b6",
    "destinationId": "2c680e59-6b5b-4f73-81bd-62ea1f384ed4",
    "key": "health-safety",
    "title": "Malaria & Vaccinations",
    "body": "Northern Botswana \xE2\u20AC\u201D the Okavango, Chobe and Linyanti \xE2\u20AC\u201D is a malaria area during and after the wet season (November to June); prophylaxis is recommended in the delta year-round as waters sustain mosquitoes. The Kalahari is malaria-free. A yellow fever certificate is needed only when arriving from endemic countries; hepatitis A and typhoid vaccinations are standard advice.",
    "bulletItems": [],
    "sortOrder": 11
  },
  {
    "id": "5f0be9f0-4ae7-4a2c-a429-5129b8a85662",
    "destinationId": "90fca831-5d85-4cdf-bbe5-b0049b30bafd",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "June to March is generally good; flamingo numbers vary with water levels.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "a1949342-2e58-4f8d-a914-5fcbf9a42fba",
    "destinationId": "90fca831-5d85-4cdf-bbe5-b0049b30bafd",
    "key": "getting-there",
    "title": "Getting There",
    "body": "About 3 hours by road from Nairobi on the main highway to Nakuru town.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "2b2bad0a-dc9a-4615-9c15-c2f030e8a85a",
    "destinationId": "16843c98-d29a-422a-b0d2-474801ace36a",
    "key": "overview",
    "title": "Overview",
    "body": "South Africa is the world in one country \xE2\u20AC\u201D Big Five safaris in Kruger and the private Sabi Sand reserves, Cape Town\xE2\u20AC\u2122s Table Mountain and Winelands, the Drakensberg amphitheater, and the Garden Route\xE2\u20AC\u2122s coastline, all connected by excellent roads and domestic flights. It is the easiest African safari destination for first-timers: malaria-free parks, superb infrastructure and a weak currency make it outstanding value.",
    "bulletItems": [
      "Malaria-free Big Five viewing in Madikwe",
      " Addo and Eastern Cape",
      "Kruger + Sabi Sand deliver Africa\xE2\u20AC\u2122s best leopard viewing",
      "World-class food",
      " wine and Cape Town in one itinerary"
    ],
    "sortOrder": 0
  },
  {
    "id": "b8eaf83b-9e56-4c36-9d07-df2cf3937f67",
    "destinationId": "16843c98-d29a-422a-b0d2-474801ace36a",
    "key": "parks-reserves",
    "title": "Parks & Reserves",
    "body": "Kruger National Park (19,485km\xC2\xB2) is the flagship, ringed by exclusive private reserves \xE2\u20AC\u201D Sabi Sand, MalaMala, Thornybush, Timbavati \xE2\u20AC\u201D where off-road driving and night safaris produce exceptional sightings. Further afield, Madikwe and Pilanesberg (malaria-free, near Johannesburg), Hluhluwe-iMfolozi (rhino cradle), iSimangaliso Wetland Park and Addo Elephant NP each offer distinct experiences.",
    "bulletItems": [
      "Kruger NP \xE2\u20AC\u201C self-drive and lodge safaris in one park",
      "Sabi Sand & MalaMala \xE2\u20AC\u201C legendary leopards",
      " off-road drives",
      "Madikwe GR \xE2\u20AC\u201C malaria-free Big Five near Jo\xE2\u20AC\u2122burg",
      "Hluhluwe-iMfolozi \xE2\u20AC\u201C saved the white rhino from extinction"
    ],
    "sortOrder": 1
  },
  {
    "id": "d47336fb-7e9b-4655-a804-853170fd457c",
    "destinationId": "16843c98-d29a-422a-b0d2-474801ace36a",
    "key": "things-to-do",
    "title": "Things To Do",
    "body": "Safaris come in every format \xE2\u20AC\u201D self-drive Kruger, guided open-vehicle drives, luxury lodge stays and walking trails. Beyond the bush: hike the Blyde River Canyon and Drakensberg, drive the Garden Route, cage-dive with great whites from Gansbaai, tour Cape winelands, visit Robben Island and whale-watch in Hermanus (Jun\xE2\u20AC\u201CNov). Night drives and bush walks are standard in the private reserves.",
    "bulletItems": [
      "Sabi Sand game drives \xE2\u20AC\u201C off-road and after dark",
      "Garden Route road trip from Cape Town",
      "Whale watching in Hermanus and Hermanus-style bays",
      "Table Mountain cableway and Cape Point day trips"
    ],
    "sortOrder": 2
  },
  {
    "id": "223ecc1c-5235-44d9-a17c-a55abe442b8f",
    "destinationId": "16843c98-d29a-422a-b0d2-474801ace36a",
    "key": "best-beaches",
    "title": "Best Beaches",
    "body": "South Africa has 2,800km of coastline with genuine highlights. Cape Town\xE2\u20AC\u2122s Clifton and Camps Bay are urban white-sand icons; Boulders Beach hosts a resident African penguin colony; the Garden Route offers Plettenberg Bay and Knysna; and KwaZulu-Natal\xE2\u20AC\u2122s warm waters suit swimming and diving at Sodwana Bay, gateway to one of the world\xE2\u20AC\u2122s southernmost coral reefs.",
    "bulletItems": [
      "Camps Bay & Clifton \xE2\u20AC\u201C Cape Town\xE2\u20AC\u2122s glitzy beaches",
      "Boulders Beach \xE2\u20AC\u201C swim alongside African penguins",
      "Sodwana Bay \xE2\u20AC\u201C coral-reef diving in a World Heritage park"
    ],
    "sortOrder": 3
  },
  {
    "id": "fdc8edf8-2b43-48b5-b47a-23612e65b178",
    "destinationId": "16843c98-d29a-422a-b0d2-474801ace36a",
    "key": "reviews",
    "title": "Reviews",
    "body": "Reviewers love South Africa\xE2\u20AC\u2122s combination of value, ease and variety \xE2\u20AC\u201D safari, city and coast in one trip without malaria pills. Sabi Sand leopard sightings earn near-universal praise. Common cautions: self-drive visitors should observe Kruger\xE2\u20AC\u2122s gate times strictly, and visitors are advised to stay alert in major cities, especially Johannesburg, using private transfers after dark.",
    "bulletItems": [],
    "sortOrder": 4
  },
  {
    "id": "f6c4f070-5599-4758-9f32-58cb5dc6ec2f",
    "destinationId": "16843c98-d29a-422a-b0d2-474801ace36a",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Kruger alone supports 147 mammal species, including around 12,000 elephants, 2,000 lions and Africa\xE2\u20AC\u2122s best-viewed leopards in the adjacent private reserves. White rhinos are a conservation success story here (though poaching remains a battle), cheetah and wild dog roam the open savannah, and the coast adds southern right whales, great white sharks and Cape fur seal colonies.",
    "bulletItems": [
      "Big Five in Kruger",
      " Sabi Sand",
      " Madikwe and Addo",
      "Leopard viewing in Sabi Sand is world-famous",
      "Marine Big Five: whale",
      " shark",
      " seal",
      " dolphin",
      " penguin"
    ],
    "sortOrder": 5
  },
  {
    "id": "bcba08ec-c0a4-4a6e-8241-3d070d866996",
    "destinationId": "16843c98-d29a-422a-b0d2-474801ace36a",
    "key": "birds",
    "title": "Birds",
    "body": "South Africa lists over 850 species, including dozens of endemics found nowhere else. Kruger offers easy raptor and roller viewing, the Cape\xE2\u20AC\u2122s fynbos hosts Cape sugarbirds and orange-breasted sunbirds, and the Western Cape is a seabird mecca \xE2\u20AC\u201D Algoa Bay and Cape Town pelagics record albatrosses and petrels. The Drakensberg adds high-altitude specials like the bearded vulture.",
    "bulletItems": [
      "African penguin and Cape gannet colonies",
      "Endemics: Cape sugarbird",
      " orange-breasted sunbird",
      " Protea canary",
      "Pelagic trips from Cape Town for albatrosses"
    ],
    "sortOrder": 6
  },
  {
    "id": "18218ad4-d05d-47b2-876f-edb243fb5bed",
    "destinationId": "16843c98-d29a-422a-b0d2-474801ace36a",
    "key": "best-time",
    "title": "Best Time To Visit",
    "body": "May to September is prime safari season \xE2\u20AC\u201D dry, cool and the best time for Kruger and the private reserves. Whale season runs June to November, spring wildflowers bloom in Namaqualand in August\xE2\u20AC\u201CSeptember, and Cape Town is loveliest in the dry summer (November to March). Because seasons complement each other, South Africa works year-round with sensible planning.",
    "bulletItems": [
      "May\xE2\u20AC\u201CSep: best Kruger game viewing",
      "Jun\xE2\u20AC\u201CNov: southern right whales along the Cape coast",
      "Nov\xE2\u20AC\u201CMar: Cape Town summer and Garden Route season"
    ],
    "sortOrder": 7
  },
  {
    "id": "edbc1e55-5160-49be-96a5-a2ba558bf251",
    "destinationId": "16843c98-d29a-422a-b0d2-474801ace36a",
    "key": "weather-climate",
    "title": "Weather & Climate",
    "body": "Lying mostly in the temperate Southern Hemisphere, South Africa has reversed seasons. The interior plateau enjoys hot wet summers and dry sunny winters; Cape Town has a Mediterranean pattern with winter rain; KwaZulu-Natal is subtropical. Kruger winter days (25\xC2\xB0C) are ideal for game drives but mornings are cold \xE2\u20AC\u201D pack warm layers for open vehicles.",
    "bulletItems": [],
    "sortOrder": 8
  },
  {
    "id": "0d821617-7776-4df3-b957-1da1ea688197",
    "destinationId": "16843c98-d29a-422a-b0d2-474801ace36a",
    "key": "popular-routes",
    "title": "Popular Routes",
    "body": "The most popular itinerary is the Panorama Route plus Kruger and Sabi Sand from Johannesburg (4\xE2\u20AC\u201C6 days), often combined with Victoria Falls or Cape Town. The Cape classics \xE2\u20AC\u201D Table Mountain, Winelands, Cape Point \xE2\u20AC\u201D take 3\xE2\u20AC\u201C4 days, and the Garden Route stretches from Cape Town to Port Elizabeth over 5\xE2\u20AC\u201C7 days. KwaZulu-Natal links Hluhluwe, iSimangaliso and the Drakensberg.",
    "bulletItems": [
      "Jo\xE2\u20AC\u2122burg \xE2\u20AC\u201C Panorama Route \xE2\u20AC\u201C Kruger/Sabi Sand (5 days)",
      "Cape Town + Winelands + Hermanus (4 days)",
      "Garden Route self-drive Cape Town \xE2\u20AC\u201C PE (6 days)"
    ],
    "sortOrder": 9
  },
  {
    "id": "d2988206-1f50-49f7-8094-0249b8c0365d",
    "destinationId": "16843c98-d29a-422a-b0d2-474801ace36a",
    "key": "getting-there",
    "title": "How To Get There",
    "body": "O.R. Tambo International Airport (JNB) in Johannesburg is Africa\xE2\u20AC\u2122s busiest hub; Cape Town International (CPT) is the gateway for the west. Kruger is a 50-minute hop to Skukuza (SKK) or Hoedspruit (HDS) or a scenic 5-hour drive. Domestic low-cost carriers connect all major cities cheaply. Most Western nationalities receive visa-free entry for up to 90 days.",
    "bulletItems": [
      "JNB for safari routes; CPT for the Cape and Garden Route",
      "Fly Jo\xE2\u20AC\u2122burg \xE2\u2020\u2019 Skukuza/Hoedspruit to land inside Kruger country",
      "Visa-free entry for US",
      " UK",
      " EU and most visitors (90 days)"
    ],
    "sortOrder": 10
  },
  {
    "id": "f80875c7-b44f-45ff-85cf-2e59af6d9954",
    "destinationId": "90fca831-5d85-4cdf-bbe5-b0049b30bafd",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Lake Nakuru National Park:",
    "bulletItems": [
      "Rhino tracking on game drives",
      "Baboon Cliff viewpoint",
      "Makalia Falls"
    ],
    "sortOrder": 4
  },
  {
    "id": "2dd9cdf8-24f5-4d68-ad13-2f9ce2234049",
    "destinationId": "16843c98-d29a-422a-b0d2-474801ace36a",
    "key": "health-safety",
    "title": "Malaria & Vaccinations",
    "body": "Kruger and northeastern KwaZulu-Natal are low-risk malaria areas in the wet summer months \xE2\u20AC\u201D prophylaxis is optional but repellent is wise; the rest of the country, including Madikwe, Pilanesberg, the Eastern Cape reserves and Cape Town, is entirely malaria-free. No yellow fever certificate is required unless arriving from an endemic country; routine vaccinations suffice for most visits.",
    "bulletItems": [],
    "sortOrder": 11
  },
  {
    "id": "4d4ff473-7554-476c-870a-25292297d274",
    "destinationId": "16843c98-d29a-422a-b0d2-474801ace36a",
    "key": "staying-safe",
    "title": "Staying Safe",
    "body": "South Africa\xE2\u20AC\u2122s parks and tourist areas are safe, but urban crime requires street smarts: use private transfers or ride-hailing apps at night, avoid walking in city centers, keep car doors locked and never stop for hitchhikers on the N-series highways. In reserves, follow ranger instructions \xE2\u20AC\u201D baboons and hippos cause more incidents than predators. Emergency services are excellent in cities.",
    "bulletItems": [],
    "sortOrder": 12
  },
  {
    "id": "30230ab6-db85-4bfa-97b0-51113c76c16c",
    "destinationId": "36fc4915-b27d-4bc3-ae09-b527efe45a77",
    "key": "overview",
    "title": "Tarangire National Park Overview",
    "body": "Tarangire covers about 2,850 km\xC2\xB2 south of Lake Manyara and was gazetted in 1970. In the dry season the Tarangire River is the only permanent water for miles, so large herds gather along it, which gives the park one of the highest elephant densities in northern Tanzania.",
    "bulletItems": [
      "Area: about 2",
      "850 km\xC2\xB2",
      "Established: 1970",
      "Under two hours from Arusha by paved road",
      "More than 550 bird species recorded"
    ],
    "sortOrder": 0
  },
  {
    "id": "dc562a74-4e0e-499f-a25b-3bfb6113463c",
    "destinationId": "36fc4915-b27d-4bc3-ae09-b527efe45a77",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Thousands of zebra, wildebeest and buffalo move in from the surrounding plains in the dry season, followed by lion and leopard.",
    "bulletItems": [
      "Elephant",
      "Lion",
      "Leopard",
      "Buffalo",
      "Zebra",
      "Wildebeest",
      "Fringe-eared oryx"
    ],
    "sortOrder": 1
  },
  {
    "id": "26543cf3-5f30-4b19-8d6f-913797782423",
    "destinationId": "36fc4915-b27d-4bc3-ae09-b527efe45a77",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "June to October, when the river draws the big herds. The green season (November to May) is quieter, with good birding.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "0666fc56-db10-4485-8472-df33f1884fd0",
    "destinationId": "36fc4915-b27d-4bc3-ae09-b527efe45a77",
    "key": "getting-there",
    "title": "Getting There",
    "body": "Most visitors drive from Arusha (under two hours). Kuro airstrip in the park has scheduled light-aircraft flights.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "3d2857b6-96ef-4a01-8b42-6e0089813b87",
    "destinationId": "36fc4915-b27d-4bc3-ae09-b527efe45a77",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Tarangire National Park:",
    "bulletItems": [
      "Game drives along the Tarangire River",
      "Baobab photography",
      "Walking safaris in the wildlife management areas outside the park"
    ],
    "sortOrder": 4
  },
  {
    "id": "9da9d6ee-b04b-4990-b034-8e3003f4f218",
    "destinationId": "3a24c00c-fa37-4c35-a727-30a288f90129",
    "key": "overview",
    "title": "Lake Manyara National Park Overview",
    "body": "Lake Manyara National Park protects about 325 km\xC2\xB2, of which roughly 230 km\xC2\xB2 is the soda lake itself. It became a national park in 1960 and is part of the UNESCO Lake Manyara Biosphere Reserve (1981). Groundwater forest, the Rift Valley escarpment and the lakeshore pack a lot of habitat into a small area.",
    "bulletItems": [
      "Area: about 325 km\xC2\xB2 (around 230 km\xC2\xB2 of lake)",
      "National park since 1960",
      "UNESCO Biosphere Reserve since 1981",
      "About 126 km (1.5 hours) from Arusha"
    ],
    "sortOrder": 0
  },
  {
    "id": "36be4f82-bb3b-4f9c-8b4d-269c3592ce3a",
    "destinationId": "3a24c00c-fa37-4c35-a727-30a288f90129",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Known for tree-climbing lions, elephants in the groundwater forest and large flocks of flamingos and pelicans on the lake. Over 390 bird species have been recorded.",
    "bulletItems": [
      "Elephant",
      "Lion",
      "Giraffe",
      "Olive baboon",
      "Blue monkey",
      "Flamingo",
      "Great white pelican"
    ],
    "sortOrder": 1
  },
  {
    "id": "711f47ca-92c8-4228-9f55-411d67e280e8",
    "destinationId": "3a24c00c-fa37-4c35-a727-30a288f90129",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "June to October for mammals; November to April for migratory birds and flamingos.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "02786fb1-db53-4401-972a-784b5a2128aa",
    "destinationId": "3a24c00c-fa37-4c35-a727-30a288f90129",
    "key": "getting-there",
    "title": "Getting There",
    "body": "About 1.5 hours by road from Arusha on the way to Ngorongoro and the Serengeti. Lake Manyara airstrip sits on the escarpment above the park.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "a0792fcf-85a6-48b2-a01e-b9e1ba593523",
    "destinationId": "3a24c00c-fa37-4c35-a727-30a288f90129",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Lake Manyara National Park:",
    "bulletItems": [
      "Game drives in the groundwater forest",
      "Treetop walkway",
      "Birding along the lakeshore",
      "Night drives (with a permit)"
    ],
    "sortOrder": 4
  },
  {
    "id": "2537d59f-5b79-4f58-9cdb-b0100a5b25cf",
    "destinationId": "fc1d1251-15e0-4dea-bf78-efbe434a914b",
    "key": "overview",
    "title": "Nyerere National Park Overview",
    "body": "Nyerere National Park was gazetted in 2019 from the northern part of the former Selous Game Reserve, whose protection dates back to 1896. At about 30,893 km\xC2\xB2 it is the largest national park in Africa. The Rufiji River, Tanzania's largest, runs through it and feeds a chain of lakes and channels.",
    "bulletItems": [
      "Area: about 30",
      "893 km\xC2\xB2",
      "National park since 2019 (formerly part of Selous Game Reserve)",
      "Main river: Rufiji",
      "Flights from Dar es Salaam and Zanzibar take under an hour"
    ],
    "sortOrder": 0
  },
  {
    "id": "2f1273b2-5799-428f-b278-20c989a9618e",
    "destinationId": "fc1d1251-15e0-4dea-bf78-efbe434a914b",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "One of the most important strongholds for African wild dog, with large numbers of hippo and crocodile on the Rufiji.",
    "bulletItems": [
      "Wild dog",
      "Lion",
      "Leopard",
      "Elephant",
      "Hippo",
      "Nile crocodile",
      "Masai giraffe"
    ],
    "sortOrder": 1
  },
  {
    "id": "6b796dfa-f470-4792-82ec-59c7f7507011",
    "destinationId": "fc1d1251-15e0-4dea-bf78-efbe434a914b",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "June to October (dry season). Many camps close in April and May during the long rains.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "39b28c24-8a2c-4203-b7e1-c7a0ed5d9c91",
    "destinationId": "fc1d1251-15e0-4dea-bf78-efbe434a914b",
    "key": "getting-there",
    "title": "Getting There",
    "body": "Scheduled light-aircraft flights from Dar es Salaam and Zanzibar to airstrips such as Mtemere, Matambwe, Kiba, Beho Beho and Siwandu.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "7b8c1701-26d9-4d4c-9cc4-d190eed9fcfb",
    "destinationId": "fc1d1251-15e0-4dea-bf78-efbe434a914b",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Nyerere National Park:",
    "bulletItems": [
      "Boat safaris on the Rufiji",
      "Walking safaris",
      "Game drives",
      "Fly-camping"
    ],
    "sortOrder": 4
  },
  {
    "id": "1e71d409-0418-4708-b900-eb2239d2dfc0",
    "destinationId": "e3ca55d0-31b2-480c-9d18-e8e0e9dbc56b",
    "key": "overview",
    "title": "Ruaha National Park Overview",
    "body": "Ruaha was established in 1964 and, after adding the Usangu Game Reserve in 2008, covers about 20,226 km\xC2\xB2. The Great Ruaha River along its south-eastern edge is the focus of game viewing. Visitor numbers are low compared with the northern parks.",
    "bulletItems": [
      "Area: about 20",
      "226 km\xC2\xB2",
      "Established: 1964",
      "About 130 km from Iringa",
      "Lion conservation unit since 2005",
      "More than 571 bird species"
    ],
    "sortOrder": 0
  },
  {
    "id": "21ba7a5b-68e6-41db-b5a4-764de26c748f",
    "destinationId": "e3ca55d0-31b2-480c-9d18-e8e0e9dbc56b",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Large lion prides, plus a mix of East and Southern African species such as greater and lesser kudu, sable and roan antelope.",
    "bulletItems": [
      "Lion",
      "Leopard",
      "Cheetah",
      "Wild dog",
      "Elephant",
      "Greater kudu",
      "Sable antelope"
    ],
    "sortOrder": 1
  },
  {
    "id": "e93ddc7c-8b5a-43b1-a36b-ac97d9dc8620",
    "destinationId": "febe8ce7-8ff4-4bec-9a8a-df0057411bb1",
    "key": "overview",
    "title": "Gombe National Park Overview",
    "body": "Gombe is Tanzania's smallest national park at about 35 km\xC2\xB2, on the eastern shore of Lake Tanganyika. It was established in 1968. Jane Goodall began studying its chimpanzees in 1960, and the Gombe Stream Research Centre (founded 1967) runs the longest field study of any wild animal species.",
    "bulletItems": [
      "Area: about 35 km\xC2\xB2",
      "Established: 1968",
      "Access by boat only",
      " from Kigoma",
      "Chimpanzee research since 1960"
    ],
    "sortOrder": 0
  },
  {
    "id": "77827642-7cca-4d37-8a41-d35a5e286d85",
    "destinationId": "febe8ce7-8ff4-4bec-9a8a-df0057411bb1",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Habituated chimpanzee communities and one of the highest primate concentrations in Africa.",
    "bulletItems": [
      "Chimpanzee",
      "Olive baboon",
      "Red colobus",
      "Red-tailed monkey",
      "Blue monkey",
      "Vervet monkey"
    ],
    "sortOrder": 1
  },
  {
    "id": "6614c002-b692-4584-bf1b-283e1fc5f97c",
    "destinationId": "febe8ce7-8ff4-4bec-9a8a-df0057411bb1",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "July to October, when trails are drier and chimps often feed lower down. Treks run all year.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "3d97ef8a-9739-4f74-9c03-10fcda9f2941",
    "destinationId": "febe8ce7-8ff4-4bec-9a8a-df0057411bb1",
    "key": "getting-there",
    "title": "Getting There",
    "body": "Fly or drive to Kigoma, then take a boat north along Lake Tanganyika. There are no roads into the park.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "4b5dbd75-e97f-4935-b760-2684c18fdc80",
    "destinationId": "febe8ce7-8ff4-4bec-9a8a-df0057411bb1",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Gombe National Park:",
    "bulletItems": [
      "Chimpanzee trekking",
      "Visit Jane Goodall\xE2\u20AC\u2122s feeding station site",
      "Swimming and snorkelling in Lake Tanganyika"
    ],
    "sortOrder": 4
  },
  {
    "id": "bc60b903-0fa9-43a6-a65e-b824a6798c95",
    "destinationId": "f7cfe70b-7822-4458-950b-e0dca896f7a8",
    "key": "overview",
    "title": "Katavi National Park Overview",
    "body": "Katavi was established in 1974 and expanded to about 4,471 km\xC2\xB2 in 1997, making it Tanzania's third-largest national park. It is one of the country's most remote parks, usually reached by charter flight.",
    "bulletItems": [
      "Area: about 4",
      "471 km\xC2\xB2",
      "Established: 1974",
      "About 40 km south of Mpanda",
      "Third-largest national park in Tanzania"
    ],
    "sortOrder": 0
  },
  {
    "id": "44a38104-063c-409b-9d36-97f9955100c9",
    "destinationId": "f7cfe70b-7822-4458-950b-e0dca896f7a8",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "In the late dry season huge buffalo herds and crowded hippo and crocodile pools along the Katuma River draw lions and hyenas.",
    "bulletItems": [
      "Buffalo",
      "Hippo",
      "Nile crocodile",
      "Lion",
      "Elephant",
      "Masai giraffe",
      "Zebra"
    ],
    "sortOrder": 1
  },
  {
    "id": "972e40f6-99fa-42db-bd3d-531dc0b2da85",
    "destinationId": "f7cfe70b-7822-4458-950b-e0dca896f7a8",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "July to October; the later in the dry season, the more concentrated the wildlife.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "efc143ee-5729-465c-94c3-edefbe857f8e",
    "destinationId": "f7cfe70b-7822-4458-950b-e0dca896f7a8",
    "key": "getting-there",
    "title": "Getting There",
    "body": "Charter flights to Ikuu airstrip (about 3 hours from Dar es Salaam, 2 from Mwanza). Overland travel takes days on unpaved roads.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "1e895ce4-da39-4f64-8cf6-73ff9407ee45",
    "destinationId": "f7cfe70b-7822-4458-950b-e0dca896f7a8",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Katavi National Park:",
    "bulletItems": [
      "Game drives on the Katuma floodplain",
      "Walking safaris",
      "Fly-camping"
    ],
    "sortOrder": 4
  },
  {
    "id": "add5878c-fd28-4921-9c30-df263fbc7611",
    "destinationId": "c84f6c57-8b2d-411f-9ba5-285f2eb8ca3e",
    "key": "overview",
    "title": "Zanzibar Overview",
    "body": "Unguja, the main island of Zanzibar, covers about 1,464 km\xC2\xB2 off Tanzania's coast. Its capital, Stone Town, is a UNESCO World Heritage Site, and the island's beaches make it the most popular way to end a Tanzania safari.",
    "bulletItems": [
      "Unguja area: about 1",
      "464 km\xC2\xB2",
      "Stone Town: UNESCO World Heritage Site",
      "Abeid Amani Karume International Airport",
      "Rains peak in March\xE2\u20AC\u201CMay and November\xE2\u20AC\u201CDecember"
    ],
    "sortOrder": 0
  },
  {
    "id": "0b5af26b-a917-44cf-ac77-ca228aa6ab4b",
    "destinationId": "c84f6c57-8b2d-411f-9ba5-285f2eb8ca3e",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Jozani Chwaka Bay National Park is home to about a third of the endemic Zanzibar red colobus population. Dolphins and sea turtles are seen offshore.",
    "bulletItems": [
      "Zanzibar red colobus",
      "Bottlenose dolphin",
      "Green turtle"
    ],
    "sortOrder": 1
  },
  {
    "id": "d1dd9cb3-1a21-4542-b2df-61ccb59d1d57",
    "destinationId": "c84f6c57-8b2d-411f-9ba5-285f2eb8ca3e",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "June to October and December to February are dry. Avoid March to May, the main rainy season.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "b9baac3d-6979-41c5-9c43-a35c39fed20d",
    "destinationId": "c84f6c57-8b2d-411f-9ba5-285f2eb8ca3e",
    "key": "getting-there",
    "title": "Getting There",
    "body": "Direct international flights to Abeid Amani Karume International Airport, short flights from Arusha and the safari parks, or a ferry from Dar es Salaam.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "d3ecb08d-d4a8-4ec0-a4fa-94038d82e820",
    "destinationId": "c84f6c57-8b2d-411f-9ba5-285f2eb8ca3e",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Zanzibar:",
    "bulletItems": [
      "Stone Town walking tour",
      "Spice farm visit",
      "Jozani Forest red colobus walk",
      "Snorkelling at Mnemba Atoll"
    ],
    "sortOrder": 4
  },
  {
    "id": "b61d3f01-c337-40df-a5cb-1d4938d063db",
    "destinationId": "084d55cf-f2d5-4f56-97ca-8ac00cb4087c",
    "key": "overview",
    "title": "Amboseli National Park Overview",
    "body": "Amboseli covers 392 km\xC2\xB2 at the heart of an 8,000 km\xC2\xB2 ecosystem on the Kenya\xE2\u20AC\u201CTanzania border. It was a reserve from 1906 and became a national park in 1974. Its elephants have been studied since 1972, one of the longest-running elephant research projects in the world.",
    "bulletItems": [
      "Area: 392 km\xC2\xB2",
      "Reserve from 1906",
      " national park since 1974",
      "Elephant research since 1972",
      "About 400 bird species"
    ],
    "sortOrder": 0
  },
  {
    "id": "d4872013-e011-41da-9670-c3a1854773c7",
    "destinationId": "084d55cf-f2d5-4f56-97ca-8ac00cb4087c",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Best known for big-tusked elephants against the backdrop of Mount Kilimanjaro. Swamps fed by Kilimanjaro\xE2\u20AC\u2122s snowmelt keep wildlife here all year.",
    "bulletItems": [
      "Elephant",
      "Lion",
      "Cheetah",
      "Spotted hyena",
      "Buffalo",
      "Masai giraffe",
      "Hippo"
    ],
    "sortOrder": 1
  },
  {
    "id": "11bfb1c4-99eb-4c5b-af0a-0f41e18c1ed6",
    "destinationId": "084d55cf-f2d5-4f56-97ca-8ac00cb4087c",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "June to October and January to February (dry seasons). Kilimanjaro is clearest early in the morning.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "4041f0b8-269d-4939-8253-64d4498f7afb",
    "destinationId": "084d55cf-f2d5-4f56-97ca-8ac00cb4087c",
    "key": "getting-there",
    "title": "Getting There",
    "body": "About 4 to 5 hours by road from Nairobi, or a short scheduled flight to Amboseli airstrip.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "b3d37f4e-22a9-4807-aafc-6ee308aafb14",
    "destinationId": "084d55cf-f2d5-4f56-97ca-8ac00cb4087c",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Amboseli National Park:",
    "bulletItems": [
      "Game drives in the swamps",
      "Observation Hill viewpoint",
      "Maasai village visit"
    ],
    "sortOrder": 4
  },
  {
    "id": "1e2998dd-a28a-4d17-ade1-b39af9070c82",
    "destinationId": "90fca831-5d85-4cdf-bbe5-b0049b30bafd",
    "key": "overview",
    "title": "Lake Nakuru National Park Overview",
    "body": "Lake Nakuru National Park covers 188 km\xC2\xB2 around a Rift Valley soda lake, about 164 km north of Nairobi. It was created in 1961, is a Ramsar wetland (1990) and since 2011 is part of the Kenya Lake System UNESCO World Heritage Site. A fenced sanctuary makes it one of the best places in Kenya to see rhino.",
    "bulletItems": [
      "Area: 188 km\xC2\xB2",
      "Established: 1961",
      "Ramsar site since 1990",
      "UNESCO World Heritage (Kenya Lake System) since 2011",
      "About 164 km from Nairobi"
    ],
    "sortOrder": 0
  },
  {
    "id": "a493af7a-27d4-448f-ab23-37b0204025a1",
    "destinationId": "29a7d6bf-7860-46a6-900a-05f01a4e2e96",
    "key": "overview",
    "title": "Samburu National Reserve Overview",
    "body": "Samburu National Reserve covers 165 km\xC2\xB2 on the north bank of the Ewaso Ng'iro River, about 350 km north of Nairobi. It was gazetted in 1985. The semi-arid landscape supports dry-country species found nowhere else on the usual Kenya safari circuit.",
    "bulletItems": [
      "Area: 165 km\xC2\xB2",
      "Established: 1985",
      "River: Ewaso Ng'iro",
      "About 350 km from Nairobi"
    ],
    "sortOrder": 0
  },
  {
    "id": "27ab022f-ca71-4d32-b23a-3b7b28b8e450",
    "destinationId": "29a7d6bf-7860-46a6-900a-05f01a4e2e96",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Home to the 'Samburu Special Five': Grevy's zebra, reticulated giraffe, gerenuk, Beisa oryx and Somali ostrich.",
    "bulletItems": [
      "Grevy's zebra",
      "Reticulated giraffe",
      "Gerenuk",
      "Beisa oryx",
      "Somali ostrich",
      "Elephant",
      "Leopard"
    ],
    "sortOrder": 1
  },
  {
    "id": "dbcf37ec-141d-429e-a14f-b945dac76a6c",
    "destinationId": "29a7d6bf-7860-46a6-900a-05f01a4e2e96",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "June to October and December to March (dry seasons), when animals stay close to the river.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "226f88b7-3519-439a-bd2c-9f7905790be3",
    "destinationId": "29a7d6bf-7860-46a6-900a-05f01a4e2e96",
    "key": "getting-there",
    "title": "Getting There",
    "body": "About 6 hours by road from Nairobi via Isiolo, or scheduled flights to Kalama or Buffalo Springs airstrips.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "195a6304-16df-4981-a66f-bfec02a0d80c",
    "destinationId": "29a7d6bf-7860-46a6-900a-05f01a4e2e96",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Samburu National Reserve:",
    "bulletItems": [
      "Game drives along the river",
      "Samburu cultural visits",
      "Combine with Buffalo Springs across the river"
    ],
    "sortOrder": 4
  },
  {
    "id": "2f0c1a18-32bd-4356-8fb0-7a9532fd3761",
    "destinationId": "12fe89f3-3a12-40a9-be90-ca793fd95384",
    "key": "overview",
    "title": "Buffalo Springs National Reserve Overview",
    "body": "Buffalo Springs covers about 131 km\xC2\xB2 on the south bank of the Ewaso Ng'iro River, directly opposite Samburu. It was part of the Samburu-Isiolo Game Reserve from 1948 and has had its current boundaries since 1985. It is named after an oasis of clear spring water at its western end.",
    "bulletItems": [
      "Area: about 131 km\xC2\xB2",
      "Protected since 1948; current boundaries since 1985",
      "Over 365 bird species"
    ],
    "sortOrder": 0
  },
  {
    "id": "7850aabd-bc1a-492d-9cbd-99f25dace1d6",
    "destinationId": "12fe89f3-3a12-40a9-be90-ca793fd95384",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "The same northern specials as Samburu, plus hippos and crocodiles in the river.",
    "bulletItems": [
      "Grevy's zebra",
      "Reticulated giraffe",
      "Gerenuk",
      "Oryx",
      "Elephant",
      "Lion",
      "Cheetah"
    ],
    "sortOrder": 1
  },
  {
    "id": "c9de01cf-f13b-4e69-b88b-52badb89b331",
    "destinationId": "12fe89f3-3a12-40a9-be90-ca793fd95384",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "June to October and December to March.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "30838b9d-d5c8-40f1-b19c-9ff78edad0c0",
    "destinationId": "12fe89f3-3a12-40a9-be90-ca793fd95384",
    "key": "getting-there",
    "title": "Getting There",
    "body": "Reached together with Samburu: about 6 hours from Nairobi by road, or fly to Buffalo Springs airstrip.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "c3463434-8472-48cc-90c5-324e9730b717",
    "destinationId": "12fe89f3-3a12-40a9-be90-ca793fd95384",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Buffalo Springs National Reserve:",
    "bulletItems": [
      "Game drives",
      "Visit the springs",
      "Birding along the river"
    ],
    "sortOrder": 4
  },
  {
    "id": "bea045ce-3f43-4ba0-94e5-5e059d375e8f",
    "destinationId": "0a5b6408-4b91-4f8d-846e-b02dcdd6cc16",
    "key": "overview",
    "title": "Tsavo East National Park Overview",
    "body": "Tsavo East covers about 13,747 km\xC2\xB2 and was established in April 1948, making it one of Kenya's oldest and largest parks. Landmarks include the 290 km Yatta Plateau lava flow, Lugard Falls on the Galana River and Mudanda Rock, a viewpoint over a dry-season waterhole.",
    "bulletItems": [
      "Area: about 13",
      "747 km\xC2\xB2",
      "Established: 1948",
      "Yatta Plateau: about 290 km long",
      "Easy access from the coast at Mombasa"
    ],
    "sortOrder": 0
  },
  {
    "id": "15fd8ff2-50fc-4957-9c77-9324ef086142",
    "destinationId": "0a5b6408-4b91-4f8d-846e-b02dcdd6cc16",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Famous for elephants coated in red dust, plus large herds of buffalo and dry-country antelope.",
    "bulletItems": [
      "Elephant",
      "Lion",
      "Buffalo",
      "Lesser kudu",
      "Fringe-eared oryx",
      "Gerenuk"
    ],
    "sortOrder": 1
  },
  {
    "id": "feafd16b-391b-4dc7-9ef3-e0c3caf7c7c1",
    "destinationId": "0a5b6408-4b91-4f8d-846e-b02dcdd6cc16",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "June to October and January to February.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "48f328ee-2ec1-4a8b-a908-c6e95735f26f",
    "destinationId": "0a5b6408-4b91-4f8d-846e-b02dcdd6cc16",
    "key": "getting-there",
    "title": "Getting There",
    "body": "About 2 to 3 hours by road from Mombasa or the Diani coast. The Nairobi\xE2\u20AC\u201CMombasa railway stops at Voi near the park gate.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "19cae843-94e2-4ebc-908d-f32b4111db1f",
    "destinationId": "0a5b6408-4b91-4f8d-846e-b02dcdd6cc16",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Tsavo East National Park:",
    "bulletItems": [
      "Game drives",
      "Lugard Falls",
      "Mudanda Rock",
      "Combine with a beach stay"
    ],
    "sortOrder": 4
  },
  {
    "id": "3607956a-3854-4e23-9382-25caffc551de",
    "destinationId": "97102495-84e6-436a-8eb1-e7edf0227c86",
    "key": "overview",
    "title": "Chobe National Park Overview",
    "body": "Chobe National Park covers about 11,700 km\xC2\xB2 in northern Botswana and was proclaimed in 1967\xE2\u20AC\u201C68. It has four main areas: the Chobe riverfront (Serondela), the Savuti Marsh, the Linyanti Marsh and the dry Nogatsaa hinterland.",
    "bulletItems": [
      "Area: about 11",
      "700 km\xC2\xB2",
      "Established: 1967\xE2\u20AC\u201C68",
      "Estimated 50",
      "000 elephants",
      "Northern entrance at Kasane"
    ],
    "sortOrder": 0
  },
  {
    "id": "5800dcb2-7a1a-44e7-b5fc-1fbc0bdcce66",
    "destinationId": "97102495-84e6-436a-8eb1-e7edf0227c86",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Home to one of the largest elephant populations on Earth. The riverfront also has buffalo, hippo and the rare puku antelope; Savuti is known for lions.",
    "bulletItems": [
      "Elephant",
      "Buffalo",
      "Lion",
      "Hippo",
      "Sable antelope",
      "Puku"
    ],
    "sortOrder": 1
  },
  {
    "id": "1d89a650-b634-4314-b2ba-a0fd1d08fc05",
    "destinationId": "97102495-84e6-436a-8eb1-e7edf0227c86",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "May to October, when elephants gather on the Chobe River.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "58d5deae-4ded-47d3-bedb-bc50cec0f219",
    "destinationId": "97102495-84e6-436a-8eb1-e7edf0227c86",
    "key": "getting-there",
    "title": "Getting There",
    "body": "Fly to Kasane International Airport, about 80 km from Victoria Falls. Savuti and Linyanti are reached by light aircraft from Maun or Kasane.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "749d5e36-e4e1-475c-b913-1e0129785692",
    "destinationId": "97102495-84e6-436a-8eb1-e7edf0227c86",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Chobe National Park:",
    "bulletItems": [
      "Sunset boat cruise on the Chobe River",
      "Game drives on the riverfront",
      "Day trip to Victoria Falls"
    ],
    "sortOrder": 4
  },
  {
    "id": "5abbaae0-533e-4ba5-b0c4-91874531d6f8",
    "destinationId": "d1496a97-dfd3-49d9-b792-8cb74bd520ad",
    "key": "overview",
    "title": "Okavango Delta Overview",
    "body": "The Okavango Delta is a vast inland delta in northern Botswana, inscribed as a UNESCO World Heritage Site in 2014. Rain in the Angolan highlands in January and February reaches the delta months later, so the floodwaters spread from March and peak between June and August, during Botswana's dry winter.",
    "bulletItems": [
      "UNESCO World Heritage Site since 2014",
      "Core area: about 20",
      "000 km\xC2\xB2",
      "Floods peak June to August",
      "Fed by the Okavango River from Angola"
    ],
    "sortOrder": 0
  },
  {
    "id": "a8ad5131-b5c1-4de5-ad2a-8ce2670a73ac",
    "destinationId": "d1496a97-dfd3-49d9-b792-8cb74bd520ad",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "All of the Big Five are present. Red lechwe are the most common large mammal (about 88,000), and over 400 bird species have been recorded.",
    "bulletItems": [
      "Lion",
      "Leopard",
      "Elephant",
      "Wild dog",
      "Red lechwe",
      "Hippo",
      "Sitatunga"
    ],
    "sortOrder": 1
  },
  {
    "id": "3c24965c-1cfc-47e3-aa25-44882368b6cb",
    "destinationId": "d1496a97-dfd3-49d9-b792-8cb74bd520ad",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "June to October, when the floodwater is high and wildlife concentrates on the islands.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "1eaaa37d-5c8b-4656-bcd4-4b2176f5fa83",
    "destinationId": "d1496a97-dfd3-49d9-b792-8cb74bd520ad",
    "key": "getting-there",
    "title": "Getting There",
    "body": "Fly to Maun, then by light aircraft to camp airstrips in the delta.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "e0ae0e88-eec8-4b30-8879-74b08a9da890",
    "destinationId": "d1496a97-dfd3-49d9-b792-8cb74bd520ad",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Okavango Delta:",
    "bulletItems": [
      "Mokoro (dugout canoe) excursions",
      "Walking safaris on islands",
      "Game drives",
      "Scenic helicopter flights"
    ],
    "sortOrder": 4
  },
  {
    "id": "3dd04068-9818-4f16-ae07-1b60002e5bd4",
    "destinationId": "d41df8c6-bfb3-4dbe-8ecb-85318acd4631",
    "key": "overview",
    "title": "Moremi Game Reserve Overview",
    "body": "Moremi Game Reserve covers just under 5,000 km\xC2\xB2 on the eastern side of the Okavango Delta. It was proclaimed in 1963 at the initiative of the local community, led by Elizabeth Pulane Moremi, widow of Chief Moremi III. Chief's Island was added in the 1970s.",
    "bulletItems": [
      "Area: just under 5",
      "000 km\xC2\xB2",
      "Proclaimed: 1963",
      "Includes Chief\xE2\u20AC\u2122s Island and the Moremi Tongue",
      "Campsites at South Gate",
      " Third Bridge",
      " Xakanaxa and Khwai"
    ],
    "sortOrder": 0
  },
  {
    "id": "292fb87f-d7d4-4526-ab4d-bea90f016180",
    "destinationId": "d41df8c6-bfb3-4dbe-8ecb-85318acd4631",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "A mix of floodplain and dry land gives some of Africa\xE2\u20AC\u2122s best predator viewing. African wild dogs have been studied here since 1989, and nearly 500 bird species are recorded.",
    "bulletItems": [
      "Wild dog",
      "Lion",
      "Leopard",
      "Cheetah",
      "Elephant",
      "Buffalo",
      "Red lechwe"
    ],
    "sortOrder": 1
  },
  {
    "id": "e7c2717a-a4ef-4765-9601-bd45341e4279",
    "destinationId": "d41df8c6-bfb3-4dbe-8ecb-85318acd4631",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "July to October.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "099a8123-e2c9-4d5c-ab30-e17e686fdf8e",
    "destinationId": "d41df8c6-bfb3-4dbe-8ecb-85318acd4631",
    "key": "getting-there",
    "title": "Getting There",
    "body": "About 100 km by 4x4 from Maun to South Gate, or a short light-aircraft flight to lodge airstrips.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "f432944e-7ce5-4ae0-a113-91813f21a569",
    "destinationId": "d41df8c6-bfb3-4dbe-8ecb-85318acd4631",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Moremi Game Reserve:",
    "bulletItems": [
      "Game drives",
      "Mokoro trips",
      "Self-drive camping"
    ],
    "sortOrder": 4
  },
  {
    "id": "82ba02e7-f5d0-4b98-91bf-649dda5726e3",
    "destinationId": "2f275b73-0b8f-4251-ba67-d2a69a046e07",
    "key": "overview",
    "title": "Central Kalahari Game Reserve Overview",
    "body": "The Central Kalahari Game Reserve was established in 1961 and covers about 52,800 km\xC2\xB2, larger than the Netherlands and one of the largest game reserves in the world. Deception Valley is one of four fossil river valleys that wind through it.",
    "bulletItems": [
      "Area: about 52",
      "800 km\xC2\xB2",
      "Established: 1961",
      "Nearly 10% of Botswana\xE2\u20AC\u2122s land area",
      "Home of San communities for thousands of years"
    ],
    "sortOrder": 0
  },
  {
    "id": "896b86a2-4310-4682-aa32-bab74f5a2872",
    "destinationId": "2f275b73-0b8f-4251-ba67-d2a69a046e07",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "After the summer rains, springbok and gemsbok gather on the fossil valleys and attract black-maned Kalahari lions and cheetah.",
    "bulletItems": [
      "Lion",
      "Cheetah",
      "Leopard",
      "Wild dog",
      "Gemsbok",
      "Springbok",
      "Brown hyena"
    ],
    "sortOrder": 1
  },
  {
    "id": "4e5d3769-9d7e-4540-91fd-f0159d28f835",
    "destinationId": "2f275b73-0b8f-4251-ba67-d2a69a046e07",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "December to April (green season) for plains game; the dry season is hot and sparse.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "2345bd58-2036-4b31-8574-5a0340795a88",
    "destinationId": "2f275b73-0b8f-4251-ba67-d2a69a046e07",
    "key": "getting-there",
    "title": "Getting There",
    "body": "A long 4x4 drive from Maun or Ghanzi, or light aircraft to lodge airstrips.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "88294247-13d6-4a2d-ba22-343c7944711f",
    "destinationId": "2f275b73-0b8f-4251-ba67-d2a69a046e07",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Central Kalahari Game Reserve:",
    "bulletItems": [
      "Game drives in Deception Valley",
      "San bushwalks",
      "Stargazing"
    ],
    "sortOrder": 4
  },
  {
    "id": "6c0815f6-295c-448e-ac4b-b26f3904dd79",
    "destinationId": "61c5a145-5f24-453d-bdfa-64f6723199a4",
    "key": "overview",
    "title": "Makgadikgadi Pans National Park Overview",
    "body": "Makgadikgadi Pans National Park lies on the edge of one of the largest salt-pan systems in the world (about 16,000 km\xC2\xB2 in total). The Boteti River along its western boundary is the only permanent water in the dry season.",
    "bulletItems": [
      "Pan system: about 16",
      "000 km\xC2\xB2",
      "Boteti River forms the western boundary",
      "Adjoins Nxai Pan National Park to the north"
    ],
    "sortOrder": 0
  },
  {
    "id": "ddba4d3e-e087-4bfc-bd4d-13ed8709ad67",
    "destinationId": "61c5a145-5f24-453d-bdfa-64f6723199a4",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "From about April to November, zebra and wildebeest move from the pans to the Boteti River, one of Southern Africa\xE2\u20AC\u2122s largest zebra migrations. Habituated meerkats can be visited on the pans.",
    "bulletItems": [
      "Zebra",
      "Wildebeest",
      "Meerkat",
      "Brown hyena",
      "Lion",
      "Flamingo"
    ],
    "sortOrder": 1
  },
  {
    "id": "cb5e2154-4792-4819-b95b-e45b30e6becf",
    "destinationId": "61c5a145-5f24-453d-bdfa-64f6723199a4",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "December to March for the pans in green season; May to October for the zebra on the Boteti River.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "0fa9f0e2-d2ce-4242-adaa-ed353a636f9a",
    "destinationId": "61c5a145-5f24-453d-bdfa-64f6723199a4",
    "key": "getting-there",
    "title": "Getting There",
    "body": "By road from Maun or Nata, or light aircraft to camp airstrips.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "d23edab9-5542-4b5d-a271-b9a855926eef",
    "destinationId": "61c5a145-5f24-453d-bdfa-64f6723199a4",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Makgadikgadi Pans National Park:",
    "bulletItems": [
      "Meerkat visits",
      "Quad biking on the pans (dry season)",
      "Sleep-outs under the stars"
    ],
    "sortOrder": 4
  },
  {
    "id": "a8ec3265-d2b5-465a-88f8-4e4b7f9b39b6",
    "destinationId": "ea4950a4-027b-4b94-8cfb-e486a8845631",
    "key": "overview",
    "title": "Nxai Pan National Park Overview",
    "body": "Nxai Pan National Park covers about 2,578 km\xC2\xB2 north of the Maun\xE2\u20AC\u201CNata road, adjoining Makgadikgadi Pans National Park. It was established in 1992. Its fossil pans turn to grassland after the summer rains.",
    "bulletItems": [
      "Area: about 2",
      "578 km\xC2\xB2",
      "Established: 1992",
      "Home of Baines' Baobabs"
    ],
    "sortOrder": 0
  },
  {
    "id": "55fa27f8-18cc-4f88-8a71-de8cb92d3c46",
    "destinationId": "ea4950a4-027b-4b94-8cfb-e486a8845631",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Plains game arrives with the rains, followed by lion and cheetah.",
    "bulletItems": [
      "Zebra",
      "Springbok",
      "Giraffe",
      "Lion",
      "Cheetah",
      "Bat-eared fox"
    ],
    "sortOrder": 1
  },
  {
    "id": "daac4781-1d6f-4603-8226-226dccc264c9",
    "destinationId": "ea4950a4-027b-4b94-8cfb-e486a8845631",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "December to April (green season).",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "f698cc6f-c998-4aad-87af-6429a4a6a72d",
    "destinationId": "ea4950a4-027b-4b94-8cfb-e486a8845631",
    "key": "getting-there",
    "title": "Getting There",
    "body": "Self-drive 4x4 from Maun (about 2 to 3 hours), or a light-aircraft flight.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "b2e0cf52-7b47-4e5c-b3a9-ab06401b2df0",
    "destinationId": "ea4950a4-027b-4b94-8cfb-e486a8845631",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Nxai Pan National Park:",
    "bulletItems": [
      "Visit Baines' Baobabs",
      " painted by Thomas Baines in the 1860s",
      "Game drives around the waterhole"
    ],
    "sortOrder": 4
  },
  {
    "id": "247c7e6b-20bd-44ef-bb21-b8593cb6876f",
    "destinationId": "badc1354-056a-478b-9e96-335674907dc5",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Hluhluwe-iMfolozi Park:",
    "bulletItems": [
      "Self-drive game viewing",
      "Guided wilderness trails",
      "Combine with iSimangaliso Wetland Park"
    ],
    "sortOrder": 4
  },
  {
    "id": "9753b18e-4988-4754-b1c6-c41fe362faa0",
    "destinationId": "6d53a473-4153-4478-b4e2-87ca0e20a77b",
    "key": "overview",
    "title": "Kruger National Park Overview",
    "body": "Kruger National Park covers about 19,600 km\xC2\xB2 and became South Africa's first national park on 31 May 1926. Part of the area was first protected in 1898 as the Sabi Game Reserve. It has nine entrance gates, from Crocodile Bridge in the south to Pafuri in the north, and good tarred roads for self-drive.",
    "bulletItems": [
      "Area: about 19",
      "600 km\xC2\xB2",
      "National park since 1926 (Sabi Game Reserve from 1898)",
      "Nine entrance gates",
      "147 large mammal species"
    ],
    "sortOrder": 0
  },
  {
    "id": "217b895e-6ae2-4bd5-bd86-c3810486c2cb",
    "destinationId": "6d53a473-4153-4478-b4e2-87ca0e20a77b",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Big Five country, with (2010\xE2\u20AC\u201C2011 counts) about 13,750 elephants, 37,000 buffalo and 1,600 lions.",
    "bulletItems": [
      "Lion",
      "Leopard",
      "Elephant",
      "White rhino",
      "Buffalo",
      "Wild dog",
      "Cheetah"
    ],
    "sortOrder": 1
  },
  {
    "id": "6469c068-4990-41f8-8e0a-f3a4a7d16ade",
    "destinationId": "6d53a473-4153-4478-b4e2-87ca0e20a77b",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "May to September (dry winter), when vegetation thins and animals gather at water.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "813fb789-5a75-4b55-a94d-32087e2a9b9d",
    "destinationId": "6d53a473-4153-4478-b4e2-87ca0e20a77b",
    "key": "getting-there",
    "title": "Getting There",
    "body": "Fly to Kruger Mpumalanga International, Skukuza, Hoedspruit or Phalaborwa, or drive about 5 hours from Johannesburg.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "52db4eb6-cc3e-4b40-85a6-0df994b6d776",
    "destinationId": "6d53a473-4153-4478-b4e2-87ca0e20a77b",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Kruger National Park:",
    "bulletItems": [
      "Self-drive game viewing",
      "Guided sunrise and night drives",
      "Bush walks",
      "Stay in rest camps"
    ],
    "sortOrder": 4
  },
  {
    "id": "40c1499d-ec45-4848-b442-7af7d600bde7",
    "destinationId": "ea1b85dc-d35f-4bcc-9ecc-7069996745f3",
    "key": "overview",
    "title": "MalaMala Game Reserve Overview",
    "body": "MalaMala Game Reserve covers 13,500 hectares in the Sabi Sand area and shares a 19 km unfenced boundary with Kruger National Park. Its land has been private wildlife property since 1927, and it was a pioneer of photographic safaris.",
    "bulletItems": [
      "Area: 13",
      "500 ha",
      "Private wildlife land since 1927",
      "About 27 km of Sand River frontage",
      "19 km unfenced boundary with Kruger"
    ],
    "sortOrder": 0
  },
  {
    "id": "6e05d6c0-a7f6-41c9-8386-c3ce2b06f1a7",
    "destinationId": "ea1b85dc-d35f-4bcc-9ecc-7069996745f3",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Exceptional leopard viewing and all of the Big Five, with very few vehicles at each sighting.",
    "bulletItems": [
      "Leopard",
      "Lion",
      "Elephant",
      "Rhino",
      "Buffalo",
      "Cheetah"
    ],
    "sortOrder": 1
  },
  {
    "id": "211b8fac-4bc2-4f9a-a999-ce3f611b5e8e",
    "destinationId": "ea1b85dc-d35f-4bcc-9ecc-7069996745f3",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "May to September.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "a48af670-4fa2-4ee6-aa83-648682981849",
    "destinationId": "ea1b85dc-d35f-4bcc-9ecc-7069996745f3",
    "key": "getting-there",
    "title": "Getting There",
    "body": "Fly to Skukuza or Kruger Mpumalanga International, or charter to the reserve\xE2\u20AC\u2122s own airstrip.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "96645f81-c095-45b9-90d8-c24a4fe6ddb1",
    "destinationId": "ea1b85dc-d35f-4bcc-9ecc-7069996745f3",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in MalaMala Game Reserve:",
    "bulletItems": [
      "Open-vehicle game drives",
      "Bush walks",
      "Photography"
    ],
    "sortOrder": 4
  },
  {
    "id": "8df9bfc7-fc8d-46f3-ac4b-2227b855213d",
    "destinationId": "7ecf0fd9-eb8d-4c76-8aa4-7af77c4439dc",
    "key": "overview",
    "title": "Phinda Private Game Reserve Overview",
    "body": "Phinda Private Game Reserve covers about 28,555 hectares in northern KwaZulu-Natal. It was created in 1991 from former farmland and hunting land, a landmark land-restoration project. It has seven habitats, including about 1,000 ha of rare dry sand forest.",
    "bulletItems": [
      "Area: about 28",
      "555 ha",
      "Established: 1991",
      "Seven distinct habitats",
      "436 bird species"
    ],
    "sortOrder": 0
  },
  {
    "id": "1274cc5c-fdb4-4a49-bda1-509c6e5ba1b3",
    "destinationId": "7ecf0fd9-eb8d-4c76-8aa4-7af77c4439dc",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Big Five plus cheetah, wild dog and both black and white rhino. Cheetah reintroduction was part of its early conservation work.",
    "bulletItems": [
      "Cheetah",
      "Lion",
      "Leopard",
      "Elephant",
      "Black rhino",
      "White rhino",
      "Wild dog"
    ],
    "sortOrder": 1
  },
  {
    "id": "aaef0d8c-67d8-42de-9188-9fed4d0195ed",
    "destinationId": "7ecf0fd9-eb8d-4c76-8aa4-7af77c4439dc",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "May to September; summer (October to April) is hot but green.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "3f0bac2d-7696-43c2-bb86-e09c4ad549e0",
    "destinationId": "7ecf0fd9-eb8d-4c76-8aa4-7af77c4439dc",
    "key": "getting-there",
    "title": "Getting There",
    "body": "About 4 hours by road from Durban, or fly to the reserve airstrip.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "e43062ab-9f45-452d-8440-de5e13c4218c",
    "destinationId": "7ecf0fd9-eb8d-4c76-8aa4-7af77c4439dc",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Phinda Private Game Reserve:",
    "bulletItems": [
      "Game drives",
      "Rhino conservation experiences",
      "Day trips to the iSimangaliso coast"
    ],
    "sortOrder": 4
  },
  {
    "id": "01f1834a-d08b-49ec-b384-3ccf3bb60c69",
    "destinationId": "325e3920-c657-4edb-9a36-bcdf9fde014f",
    "key": "overview",
    "title": "Sabi Sand Nature Reserve Overview",
    "body": "Sabi Sand is a group of private reserves covering about 650 km\xC2\xB2 next to Kruger National Park, established in 1948. Members include MalaMala and Londolozi. There are no fences with Kruger, so wildlife moves freely.",
    "bulletItems": [
      "Area: about 650 km\xC2\xB2",
      "Established: 1948",
      "Unfenced with Kruger National Park"
    ],
    "sortOrder": 0
  },
  {
    "id": "49ec7501-f8bd-49e2-b567-5718cfd22487",
    "destinationId": "325e3920-c657-4edb-9a36-bcdf9fde014f",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "World-famous for relaxed leopards. Off-road driving lets guides follow animals closely.",
    "bulletItems": [
      "Leopard",
      "Lion",
      "Elephant",
      "Rhino",
      "Buffalo",
      "Wild dog"
    ],
    "sortOrder": 1
  },
  {
    "id": "24c396a0-af1a-412c-bd6c-e6d52c08b996",
    "destinationId": "325e3920-c657-4edb-9a36-bcdf9fde014f",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "May to September.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "a93d5f39-f5c8-476b-856a-9a20f7a5cd02",
    "destinationId": "325e3920-c657-4edb-9a36-bcdf9fde014f",
    "key": "getting-there",
    "title": "Getting There",
    "body": "Fly to Skukuza or Kruger Mpumalanga International Airport, then a road transfer or charter to a lodge airstrip.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "51b9e536-820f-4d02-856a-ecd5194221e2",
    "destinationId": "325e3920-c657-4edb-9a36-bcdf9fde014f",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Sabi Sand Nature Reserve:",
    "bulletItems": [
      "Off-road game drives",
      "Walking safaris",
      "Luxury lodge stays"
    ],
    "sortOrder": 4
  },
  {
    "id": "b6a9abed-984d-4898-936c-925f824e8031",
    "destinationId": "badc1354-056a-478b-9e96-335674907dc5",
    "key": "overview",
    "title": "Hluhluwe-iMfolozi Park Overview",
    "body": "Hluhluwe-iMfolozi was proclaimed on 30 April 1895, making it Africa's oldest proclaimed nature reserve. It covers about 960 km\xC2\xB2. In the 1950s and 60s warden Ian Player's Operation Rhino moved hundreds of rhinos from here to restock reserves across Africa.",
    "bulletItems": [
      "Area: about 960 km\xC2\xB2",
      "Proclaimed: 1895",
      "Birthplace of Operation Rhino",
      "340 bird species"
    ],
    "sortOrder": 0
  },
  {
    "id": "03885162-e224-4baa-8028-3cd9c6d08d02",
    "destinationId": "badc1354-056a-478b-9e96-335674907dc5",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "One of the largest populations of southern white rhino in the world, plus black rhino and the rest of the Big Five. Excellent for nyala.",
    "bulletItems": [
      "White rhino",
      "Black rhino",
      "Lion",
      "Elephant",
      "Buffalo",
      "Leopard",
      "Nyala"
    ],
    "sortOrder": 1
  },
  {
    "id": "e2451e1a-5f74-48ef-b55a-e4b0d47100e6",
    "destinationId": "badc1354-056a-478b-9e96-335674907dc5",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "May to September; the park is open all year.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "9c030f20-9c54-4104-a67c-25d4589b4a84",
    "destinationId": "badc1354-056a-478b-9e96-335674907dc5",
    "key": "getting-there",
    "title": "Getting There",
    "body": "About 3 hours by road from Durban.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "d7deedf1-4192-418a-9f9c-901be4c87bfb",
    "destinationId": "623aa1c3-0d50-4ead-bae3-e28f5ba253f2",
    "key": "overview",
    "title": "Addo Elephant National Park Overview",
    "body": "Addo Elephant National Park was established in 1931 to save the area's last elephants; hunting had reduced the herd to 16 by 1920. It now covers about 1,640 km\xC2\xB2 and protects more than 600 elephants. Its marine section makes it the only park with the 'Big Seven'.",
    "bulletItems": [
      "Area: about 1",
      "640 km\xC2\xB2",
      "Established: 1931",
      "More than 600 elephants",
      "'Big Seven': Big Five plus southern right whale and great white shark"
    ],
    "sortOrder": 0
  },
  {
    "id": "a7415792-bdf3-4a4c-94de-b52d90cb3f2b",
    "destinationId": "623aa1c3-0d50-4ead-bae3-e28f5ba253f2",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Dense elephant herds, plus lion, buffalo, black rhino and leopard. Whales and sharks in Algoa Bay.",
    "bulletItems": [
      "Elephant",
      "Lion",
      "Buffalo",
      "Black rhino",
      "Leopard",
      "Southern right whale",
      "Great white shark"
    ],
    "sortOrder": 1
  },
  {
    "id": "610980f4-c428-4726-9e32-220930339af1",
    "destinationId": "623aa1c3-0d50-4ead-bae3-e28f5ba253f2",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "All year. Whales are seen roughly June to November.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "a4f4f805-45ca-411e-b7c0-b3fe382320eb",
    "destinationId": "623aa1c3-0d50-4ead-bae3-e28f5ba253f2",
    "key": "getting-there",
    "title": "Getting There",
    "body": "About an hour by road from Gqeberha (Port Elizabeth). Easy to add to a Garden Route trip.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "eb569193-4ce4-41ff-b3f2-338d8e76580d",
    "destinationId": "623aa1c3-0d50-4ead-bae3-e28f5ba253f2",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Addo Elephant National Park:",
    "bulletItems": [
      "Self-drive game viewing",
      "Guided night drives",
      "Whale watching in Algoa Bay"
    ],
    "sortOrder": 4
  },
  {
    "id": "6ccf5d00-91bd-4467-841e-ced6e6ce8709",
    "destinationId": "b15d842c-34ee-4d1c-a0a7-c9895fcb24dc",
    "key": "overview",
    "title": "Bwindi Impenetrable National Park Overview",
    "body": "Bwindi Impenetrable National Park covers about 331 km\xC2\xB2 of ancient montane rainforest in south-western Uganda. It became a national park in 1991 and a UNESCO World Heritage Site in 1994. Gorilla treks start from four sectors: Buhoma, Ruhija, Rushaga and Nkuringo.",
    "bulletItems": [
      "Area: about 331 km\xC2\xB2",
      "National park since 1991",
      "UNESCO World Heritage Site since 1994",
      "2018 census: 459 mountain gorillas in 36 groups"
    ],
    "sortOrder": 0
  },
  {
    "id": "5ce4dbf8-3760-456a-a6a1-530bf42f0ac8",
    "destinationId": "b15d842c-34ee-4d1c-a0a7-c9895fcb24dc",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Close to half of the world\xE2\u20AC\u2122s mountain gorillas live here. The forest also holds chimpanzees, forest elephants and many Albertine Rift endemic birds.",
    "bulletItems": [
      "Mountain gorilla",
      "Chimpanzee",
      "L'Hoest's monkey",
      "Forest elephant",
      "Black-and-white colobus"
    ],
    "sortOrder": 1
  },
  {
    "id": "4928e905-c7a0-41de-9372-5366654afcd0",
    "destinationId": "b15d842c-34ee-4d1c-a0a7-c9895fcb24dc",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "June to August and December to February (drier months). Treks run all year.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "21882c34-2738-4fc8-9b54-33ace79f0a01",
    "destinationId": "b15d842c-34ee-4d1c-a0a7-c9895fcb24dc",
    "key": "getting-there",
    "title": "Getting There",
    "body": "Light-aircraft flights from Entebbe to Kihihi (for Buhoma) or Kisoro (for Rushaga and Nkuringo), or a long drive from Kampala. Many travellers come via Kigali in Rwanda.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "a8f4295e-1a17-4043-ab72-17a5b8bc48ae",
    "destinationId": "b15d842c-34ee-4d1c-a0a7-c9895fcb24dc",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Bwindi Impenetrable National Park:",
    "bulletItems": [
      "Mountain gorilla trekking (permit required)",
      "Gorilla habituation experience",
      "Batwa community visit",
      "Forest walks and birding"
    ],
    "sortOrder": 4
  },
  {
    "id": "ecddaecb-1c96-4eb9-bf3b-900f40f88907",
    "destinationId": "9c2b179c-0f79-437d-b84d-30eee3da3313",
    "key": "overview",
    "title": "Queen Elizabeth National Park Overview",
    "body": "Queen Elizabeth National Park covers about 1,978 km\xC2\xB2. It was founded in 1952 as Kazinga National Park and renamed in 1954 after a visit by Queen Elizabeth II. The Kazinga Channel links Lake George and Lake Edward.",
    "bulletItems": [
      "Area: about 1",
      "978 km\xC2\xB2",
      "Established: 1952",
      "95 mammal species",
      "Over 600 bird species"
    ],
    "sortOrder": 0
  },
  {
    "id": "e90887d8-4545-4c8c-a719-f9406af077e5",
    "destinationId": "9c2b179c-0f79-437d-b84d-30eee3da3313",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "The Ishasha sector is famous for tree-climbing lions. The Kazinga Channel has some of Africa\xE2\u20AC\u2122s highest concentrations of hippo, and Kyambura Gorge has chimpanzees.",
    "bulletItems": [
      "Tree-climbing lion",
      "Hippo",
      "Elephant",
      "Buffalo",
      "Uganda kob",
      "Chimpanzee"
    ],
    "sortOrder": 1
  },
  {
    "id": "d89dbcf0-a6ac-46e9-9958-eff38e2b9c55",
    "destinationId": "9c2b179c-0f79-437d-b84d-30eee3da3313",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "June to August and December to February.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "9e3a2594-ab45-48b1-a907-bf78d838b2dc",
    "destinationId": "9c2b179c-0f79-437d-b84d-30eee3da3313",
    "key": "getting-there",
    "title": "Getting There",
    "body": "About 6 to 7 hours by road from Kampala (nearest town Kasese), or scheduled flights to Mweya or Kasese airstrips.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "7a2d5ef1-1297-46ae-9b27-ab53578ff7d9",
    "destinationId": "9c2b179c-0f79-437d-b84d-30eee3da3313",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Queen Elizabeth National Park:",
    "bulletItems": [
      "Kazinga Channel boat trip",
      "Ishasha tree-climbing lions",
      "Chimp tracking in Kyambura Gorge"
    ],
    "sortOrder": 4
  },
  {
    "id": "955cadbb-e7d9-45cb-8f0b-e9bf68cde461",
    "destinationId": "cb4dd5d8-59b6-47da-ad56-324fb3c96662",
    "key": "overview",
    "title": "Murchison Falls National Park Overview",
    "body": "Murchison Falls is Uganda's largest national park at about 3,893 km\xC2\xB2, established in 1952. Here the Nile squeezes through a gorge about 7 metres wide and drops 43 metres.",
    "bulletItems": [
      "Area: about 3",
      "893 km\xC2\xB2",
      "Established: 1952",
      "Nile gorge about 7 m wide",
      " 43 m drop",
      "About 450 bird species"
    ],
    "sortOrder": 0
  },
  {
    "id": "0e5d7787-6900-4301-aca4-a8147a3276f4",
    "destinationId": "cb4dd5d8-59b6-47da-ad56-324fb3c96662",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Rothschild\xE2\u20AC\u2122s giraffe, elephants, lions and big herds of Uganda kob north of the Nile. The delta is one of the best places to see the shoebill.",
    "bulletItems": [
      "Rothschild giraffe",
      "Elephant",
      "Lion",
      "Hippo",
      "Nile crocodile",
      "Shoebill"
    ],
    "sortOrder": 1
  },
  {
    "id": "33736863-6a70-48d9-8062-d7987977ebef",
    "destinationId": "cb4dd5d8-59b6-47da-ad56-324fb3c96662",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "December to February and June to September.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "b9b00dbf-0e1b-4388-8ba9-9fbc1662a03b",
    "destinationId": "cb4dd5d8-59b6-47da-ad56-324fb3c96662",
    "key": "getting-there",
    "title": "Getting There",
    "body": "About 5 to 6 hours by road from Kampala via Masindi, or scheduled flights to Pakuba or Bugungu airstrips.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "7ddb88d8-5297-4467-91d4-7251175b13bc",
    "destinationId": "cb4dd5d8-59b6-47da-ad56-324fb3c96662",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Murchison Falls National Park:",
    "bulletItems": [
      "Boat trip to the base of the falls",
      "Hike to the top of the falls",
      "Game drives on the north bank",
      "Shoebill trip to the Nile delta"
    ],
    "sortOrder": 4
  },
  {
    "id": "d20a3e07-6b62-4648-9d46-cb0cf06ba7c8",
    "destinationId": "ded914c3-9f36-4421-a54c-0f7fea77fc4d",
    "key": "overview",
    "title": "South Luangwa National Park Overview",
    "body": "South Luangwa covers about 9,050 km\xC2\xB2 of the Luangwa River valley. It became a game reserve in 1938 and a national park in 1972. Conservationist Norman Carr pioneered walking safaris here, and it is still known as the home of the walking safari.",
    "bulletItems": [
      "Area: about 9",
      "050 km\xC2\xB2",
      "Game reserve 1938",
      " national park 1972",
      "Birthplace of the walking safari",
      "Main entry via Mfuwe"
    ],
    "sortOrder": 0
  },
  {
    "id": "13bdf0bb-3f9b-4d51-a120-bd0a86112a6f",
    "destinationId": "ded914c3-9f36-4421-a54c-0f7fea77fc4d",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Very high leopard densities and endemic subspecies such as Cookson's wildebeest and Crawshay's zebra. The Luangwa River holds huge numbers of hippo.",
    "bulletItems": [
      "Leopard",
      "Lion",
      "Wild dog",
      "Elephant",
      "Hippo",
      "Cookson's wildebeest",
      "Thornicroft's giraffe"
    ],
    "sortOrder": 1
  },
  {
    "id": "3a530f56-c962-4442-89c4-c0f6e8d43094",
    "destinationId": "ded914c3-9f36-4421-a54c-0f7fea77fc4d",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "June to October (dry season). Many bush camps close from November to April.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "4ad05183-a220-4b95-a4eb-8d16ad893869",
    "destinationId": "ded914c3-9f36-4421-a54c-0f7fea77fc4d",
    "key": "getting-there",
    "title": "Getting There",
    "body": "Fly to Mfuwe Airport from Lusaka, Lower Zambezi or Lilongwe (Malawi). Mfuwe is just outside the park.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "a581bae1-3067-4f7b-8823-3aa67be11e73",
    "destinationId": "ded914c3-9f36-4421-a54c-0f7fea77fc4d",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in South Luangwa National Park:",
    "bulletItems": [
      "Walking safaris",
      "Night drives for leopard",
      "Bush camp stays"
    ],
    "sortOrder": 4
  },
  {
    "id": "cfdc490d-6935-464f-8733-6547d0f8b15d",
    "destinationId": "94244faf-8d2a-4665-b21d-868592ce4f6d",
    "key": "overview",
    "title": "Lower Zambezi National Park Overview",
    "body": "Lower Zambezi National Park covers about 4,092 km\xC2\xB2 on the north bank of the Zambezi, opposite Zimbabwe's Mana Pools. It was declared a national park in 1983; before that it was a private reserve for Zambia's president.",
    "bulletItems": [
      "Area: about 4",
      "092 km\xC2\xB2",
      "National park since 1983",
      "Opposite Mana Pools (Zimbabwe)",
      "Served by Jeki airstrip"
    ],
    "sortOrder": 0
  },
  {
    "id": "e46d4536-5b69-4cf7-b733-3be64945bdeb",
    "destinationId": "94244faf-8d2a-4665-b21d-868592ce4f6d",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Elephant herds cross between the river islands, with buffalo, lion, leopard and abundant hippo and crocodile.",
    "bulletItems": [
      "Elephant",
      "Buffalo",
      "Lion",
      "Leopard",
      "Hippo",
      "Nile crocodile",
      "Wild dog"
    ],
    "sortOrder": 1
  },
  {
    "id": "b86ee7bb-e2f1-465a-b99b-72ee51207b2b",
    "destinationId": "94244faf-8d2a-4665-b21d-868592ce4f6d",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "June to October.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "287b1a16-cab4-4a67-af47-78fa169781d4",
    "destinationId": "94244faf-8d2a-4665-b21d-868592ce4f6d",
    "key": "getting-there",
    "title": "Getting There",
    "body": "Scheduled flights from Lusaka to Jeki or Royal airstrips. There are no paved roads in the park.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "82d557ae-50b8-47b8-9e9b-e0be75477699",
    "destinationId": "94244faf-8d2a-4665-b21d-868592ce4f6d",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Lower Zambezi National Park:",
    "bulletItems": [
      "Canoe safaris on the Zambezi",
      "Boat cruises",
      "Tiger fishing (catch and release)",
      "Game drives"
    ],
    "sortOrder": 4
  },
  {
    "id": "6cbccbd4-22fc-4596-b1ed-363cd1874289",
    "destinationId": "f1e1d801-8ce7-4b81-9605-8c0f1e59e0d3",
    "key": "overview",
    "title": "Etosha National Park Overview",
    "body": "Etosha National Park covers about 22,270 km\xC2\xB2 of northern Namibia. It was proclaimed a game reserve in March 1907 and became a national park in 1967. The Etosha Pan, a salt pan of about 4,760 km\xC2\xB2, takes up nearly a quarter of the park.",
    "bulletItems": [
      "Area: about 22",
      "270 km\xC2\xB2",
      "Proclaimed: 1907",
      "Etosha Pan: about 4",
      "760 km\xC2\xB2",
      "Main rest camps: Okaukuejo",
      " Halali and Namutoni"
    ],
    "sortOrder": 0
  },
  {
    "id": "869cda95-b90e-4948-9519-737768179dd2",
    "destinationId": "f1e1d801-8ce7-4b81-9605-8c0f1e59e0d3",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Considered one of the world\xE2\u20AC\u2122s most important black rhino strongholds. In the dry season animals queue at floodlit waterholes in front of the rest camps.",
    "bulletItems": [
      "Black rhino",
      "Lion",
      "Elephant",
      "Giraffe",
      "Springbok",
      "Gemsbok",
      "Black-faced impala"
    ],
    "sortOrder": 1
  },
  {
    "id": "9558e709-98a3-4a4c-b52e-d9f816abeb49",
    "destinationId": "f1e1d801-8ce7-4b81-9605-8c0f1e59e0d3",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "May to October, when wildlife gathers at the waterholes.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "36e34470-30f3-42a7-93cb-4131231fb35e",
    "destinationId": "f1e1d801-8ce7-4b81-9605-8c0f1e59e0d3",
    "key": "getting-there",
    "title": "Getting There",
    "body": "About 4 to 5 hours by tar road from Windhoek to Andersson Gate. Ideal for self-drive.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "8eb8f99e-434b-4d88-83df-eb94e394e6ce",
    "destinationId": "f1e1d801-8ce7-4b81-9605-8c0f1e59e0d3",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Etosha National Park:",
    "bulletItems": [
      "Self-drive game viewing",
      "Floodlit waterhole watching at night",
      "Guided drives"
    ],
    "sortOrder": 4
  },
  {
    "id": "52725fcd-d84f-412d-803b-ab908b2e77fa",
    "destinationId": "5489d3fd-9970-4016-a50b-75cefb2e8949",
    "key": "overview",
    "title": "Sossusvlei Overview",
    "body": "Sossusvlei is a clay pan surrounded by towering red dunes in the southern Namib Desert, inside Namib-Naukluft National Park. The Namib Sand Sea was inscribed as a UNESCO World Heritage Site in 2013.",
    "bulletItems": [
      "Inside Namib-Naukluft National Park",
      "Namib Sand Sea: UNESCO World Heritage Site",
      "Big Daddy dune: about 325 m",
      "Dune 45: about 80 m",
      " 45 km past Sesriem gate"
    ],
    "sortOrder": 0
  },
  {
    "id": "0ff33536-af0a-466f-b2a8-0148a876d7d3",
    "destinationId": "5489d3fd-9970-4016-a50b-75cefb2e8949",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Desert-adapted species such as oryx, springbok and ostrich.",
    "bulletItems": [
      "Oryx",
      "Springbok",
      "Ostrich",
      "Black-backed jackal"
    ],
    "sortOrder": 1
  },
  {
    "id": "a87908d3-164c-4dcb-af95-406aef1ac2c1",
    "destinationId": "5489d3fd-9970-4016-a50b-75cefb2e8949",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "May to September for cooler days. Arrive at sunrise for the best light on the dunes.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "fd7195d0-aaa1-4c12-ae2e-94df6d54edd7",
    "destinationId": "5489d3fd-9970-4016-a50b-75cefb2e8949",
    "key": "getting-there",
    "title": "Getting There",
    "body": "About 5 hours by road from Windhoek to Sesriem gate, then 60 km of tar road to the dunes.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "6a850294-6bc3-422b-be85-a88977d15825",
    "destinationId": "5489d3fd-9970-4016-a50b-75cefb2e8949",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Sossusvlei:",
    "bulletItems": [
      "Climb Dune 45 or Big Daddy at sunrise",
      "Walk to Deadvlei",
      "Sesriem Canyon",
      "Scenic flights and balloon rides"
    ],
    "sortOrder": 4
  },
  {
    "id": "75457ce9-914b-4129-afd6-28d156868edf",
    "destinationId": "28c217ab-298b-4a38-af72-ba7233b2da7c",
    "key": "overview",
    "title": "Hwange National Park Overview",
    "body": "Hwange is Zimbabwe's largest national park at about 14,651 km\xC2\xB2, between Bulawayo and Victoria Falls. It was founded as a game reserve in 1928 and became a national park in 1961. Many pans are kept full by pumped water in the dry season.",
    "bulletItems": [
      "Area: about 14",
      "651 km\xC2\xB2",
      "Game reserve 1928",
      " national park 1961",
      "Pumped waterholes such as Nyamandlovu Pan",
      "Home of Cecil the lion (killed 2015)"
    ],
    "sortOrder": 0
  },
  {
    "id": "02b63c02-a718-4557-9127-3bc05d669144",
    "destinationId": "28c217ab-298b-4a38-af72-ba7233b2da7c",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "One of Africa\xE2\u20AC\u2122s largest elephant populations, plus lion, wild dog, sable and roan antelope.",
    "bulletItems": [
      "Elephant",
      "Lion",
      "Wild dog",
      "Buffalo",
      "Sable antelope",
      "Roan antelope"
    ],
    "sortOrder": 1
  },
  {
    "id": "6062bd38-706d-4706-ad30-fbc516a8b204",
    "destinationId": "28c217ab-298b-4a38-af72-ba7233b2da7c",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "July to October, when elephants crowd the waterholes.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "4fa0634e-231a-421f-812f-f57173a2cda7",
    "destinationId": "28c217ab-298b-4a38-af72-ba7233b2da7c",
    "key": "getting-there",
    "title": "Getting There",
    "body": "About 2 hours by road from Victoria Falls, or light-aircraft flights to camp airstrips.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "b354bc43-e6b8-48aa-bfa1-2ed762979b71",
    "destinationId": "28c217ab-298b-4a38-af72-ba7233b2da7c",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Hwange National Park:",
    "bulletItems": [
      "Game drives at the pans",
      "Walking safaris",
      "Hide sits at waterholes"
    ],
    "sortOrder": 4
  },
  {
    "id": "8d3cb5e8-b736-44dd-9f27-592b2ac6225b",
    "destinationId": "03a9ee6c-f0c6-47c2-b2ab-8e3f3614e54e",
    "key": "overview",
    "title": "Mana Pools National Park Overview",
    "body": "Mana Pools National Park covers about 2,196 km\xC2\xB2 of the Zambezi floodplain. 'Mana' means 'four' in Shona, after the four large pools left by the river. Together with the Sapi and Chewore Safari Areas it was inscribed as a UNESCO World Heritage Site in 1984.",
    "bulletItems": [
      "Area: about 2",
      "196 km\xC2\xB2",
      "UNESCO World Heritage Site since 1984",
      "Name means 'four (pools)' in Shona"
    ],
    "sortOrder": 0
  },
  {
    "id": "f1f6ee43-70f4-4132-9962-f90ec376ee1f",
    "destinationId": "03a9ee6c-f0c6-47c2-b2ab-8e3f3614e54e",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Elephants that stand on their hind legs to reach acacia pods, plus wild dog, lion, buffalo and large hippo numbers.",
    "bulletItems": [
      "Elephant",
      "Wild dog",
      "Lion",
      "Buffalo",
      "Hippo",
      "Eland"
    ],
    "sortOrder": 1
  },
  {
    "id": "a9f8dee8-bc94-4c63-9f3c-1ed56e0ee0c1",
    "destinationId": "03a9ee6c-f0c6-47c2-b2ab-8e3f3614e54e",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "July to October. The park is largely inaccessible in the rainy season.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "b6630df0-0ac3-459b-a986-9f2052fb7129",
    "destinationId": "03a9ee6c-f0c6-47c2-b2ab-8e3f3614e54e",
    "key": "getting-there",
    "title": "Getting There",
    "body": "Charter flights from Harare or Victoria Falls to Mana Pools airstrip, or a long 4x4 drive from Harare.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "2d7fc96c-5e68-4ec2-af09-c9086d24c7bf",
    "destinationId": "03a9ee6c-f0c6-47c2-b2ab-8e3f3614e54e",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Mana Pools National Park:",
    "bulletItems": [
      "Walking safaris",
      "Canoe safaris on the Zambezi",
      "Game drives"
    ],
    "sortOrder": 4
  },
  {
    "id": "960406d6-477d-460b-aa8c-a1c2938f6b1b",
    "destinationId": "af4fedbb-bf03-4c54-96d0-bab67ca6dc19",
    "key": "overview",
    "title": "Victoria Falls Overview",
    "body": "Victoria Falls, Mosi-oa-Tunya ('the smoke that thunders'), is about 1,708 m wide and 108 m high, on the Zambezi between Zimbabwe and Zambia. It was inscribed as a UNESCO World Heritage Site in 1989. The town of Victoria Falls (Zimbabwe) and Livingstone (Zambia) are the bases for visits.",
    "bulletItems": [
      "Width: about 1",
      "708 m; height: about 108 m",
      "UNESCO World Heritage Site since 1989",
      "Peak flow February to May (highest in April)",
      "Lowest flow around November"
    ],
    "sortOrder": 0
  },
  {
    "id": "ee2b02f3-1ec8-49f1-870c-e9996e90bf6b",
    "destinationId": "af4fedbb-bf03-4c54-96d0-bab67ca6dc19",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "The surrounding national parks have elephant, buffalo and hippo, and the gorges host raptors such as Taita falcon.",
    "bulletItems": [
      "Elephant",
      "Buffalo",
      "Hippo",
      "Taita falcon"
    ],
    "sortOrder": 1
  },
  {
    "id": "d49ca23f-e6d8-4d88-be7b-34fca7326983",
    "destinationId": "af4fedbb-bf03-4c54-96d0-bab67ca6dc19",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "February to May for maximum spray; September to December for clearer views and Devil\xE2\u20AC\u2122s Pool on the Zambian side.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "fc46d2d9-f59a-41a3-a2e7-e142322133a9",
    "destinationId": "af4fedbb-bf03-4c54-96d0-bab67ca6dc19",
    "key": "getting-there",
    "title": "Getting There",
    "body": "Fly to Victoria Falls Airport (Zimbabwe) or Livingstone (Zambia). Kasane in Botswana is about 80 km away.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "16e55f5d-ee31-41e9-beed-273684a93101",
    "destinationId": "af4fedbb-bf03-4c54-96d0-bab67ca6dc19",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Victoria Falls:",
    "bulletItems": [
      "Walk the rainforest trail",
      "Swim in Devil's Pool (Sep\xE2\u20AC\u201CDec)",
      "Sunset cruise on the Zambezi",
      "White-water rafting",
      "Helicopter flight"
    ],
    "sortOrder": 4
  },
  {
    "id": "2844ceb2-0464-4a04-8ed8-f49cad041b14",
    "destinationId": "023588d3-884a-4486-a987-5e9c7e9c015c",
    "key": "overview",
    "title": "Volcanoes National Park Overview",
    "body": "Volcanoes National Park protects about 160 km\xC2\xB2 of rainforest and bamboo on five of the eight Virunga volcanoes: Karisimbi, Bisoke, Muhabura, Gahinga and Sabyinyo. Created in 1925, it was the first national park in Africa. Dian Fossey founded the Karisoke Research Centre here in 1967.",
    "bulletItems": [
      "Area: about 160 km\xC2\xB2",
      "Established: 1925 (Africa\xE2\u20AC\u2122s first national park)",
      "Karisoke Research Centre founded 1967",
      "Gateway town: Musanze"
    ],
    "sortOrder": 0
  },
  {
    "id": "d754a97e-2274-4ed1-92b4-87dd8068ca58",
    "destinationId": "023588d3-884a-4486-a987-5e9c7e9c015c",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Habituated mountain gorilla families and the endangered golden monkey.",
    "bulletItems": [
      "Mountain gorilla",
      "Golden monkey",
      "Buffalo",
      "Black-fronted duiker"
    ],
    "sortOrder": 1
  },
  {
    "id": "f997d160-521a-4537-b053-14e614446a3f",
    "destinationId": "023588d3-884a-4486-a987-5e9c7e9c015c",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "June to September and December to February (drier months). Treks run all year.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "840a7549-6365-4e03-9163-7810b95fabb3",
    "destinationId": "023588d3-884a-4486-a987-5e9c7e9c015c",
    "key": "getting-there",
    "title": "Getting There",
    "body": "About 2.5 hours by road from Kigali to Musanze and the park headquarters at Kinigi.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "dd9dca25-e608-41dc-a518-00b92920c089",
    "destinationId": "023588d3-884a-4486-a987-5e9c7e9c015c",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Volcanoes National Park:",
    "bulletItems": [
      "Mountain gorilla trekking (permit required)",
      "Golden monkey tracking",
      "Hike to Dian Fossey's grave",
      "Climb Mount Bisoke"
    ],
    "sortOrder": 4
  },
  {
    "id": "da286970-28e0-4eb1-88fa-116141ddf759",
    "destinationId": "2239a52a-9f27-4df0-89e9-525e9622c3fc",
    "key": "overview",
    "title": "Akagera National Park Overview",
    "body": "Akagera National Park covers about 1,122 km\xC2\xB2 of savannah, lakes and papyrus swamp in eastern Rwanda. It was established in 1934 and has been managed by African Parks with the Rwanda Development Board since 2010. Lions were reintroduced in 2015 and rhinos in 2017 and 2021, restoring the Big Five.",
    "bulletItems": [
      "Area: about 1",
      "122 km\xC2\xB2",
      "Established: 1934",
      "Managed by African Parks since 2010",
      "Lions back since 2015; rhinos since 2017"
    ],
    "sortOrder": 0
  },
  {
    "id": "ca4c56dd-4b5f-4f1e-b968-5e0ea3687e72",
    "destinationId": "2239a52a-9f27-4df0-89e9-525e9622c3fc",
    "key": "wildlife",
    "title": "Wildlife",
    "body": "Rwanda\xE2\u20AC\u2122s only Big Five park, with lakes such as Ihema full of hippo and crocodile.",
    "bulletItems": [
      "Lion",
      "Black rhino",
      "White rhino",
      "Elephant",
      "Giraffe",
      "Hippo",
      "Buffalo"
    ],
    "sortOrder": 1
  },
  {
    "id": "1f544964-9ee5-44f3-9174-c91d9f395638",
    "destinationId": "2239a52a-9f27-4df0-89e9-525e9622c3fc",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "June to September.",
    "bulletItems": [],
    "sortOrder": 2
  },
  {
    "id": "3f50b266-1dae-4020-9c87-8e9f7463413f",
    "destinationId": "2239a52a-9f27-4df0-89e9-525e9622c3fc",
    "key": "getting-there",
    "title": "Getting There",
    "body": "About 2.5 hours by road from Kigali.",
    "bulletItems": [],
    "sortOrder": 3
  },
  {
    "id": "1c87632a-480c-4125-9002-3e8110db2729",
    "destinationId": "2239a52a-9f27-4df0-89e9-525e9622c3fc",
    "key": "things-to-do",
    "title": "Things to Do",
    "body": "Popular activities in Akagera National Park:",
    "bulletItems": [
      "Game drives",
      "Boat trip on Lake Ihema",
      "Night drives",
      "Combine with gorilla trekking"
    ],
    "sortOrder": 4
  },
  {
    "id": "8098ee8d-5df1-4d2c-86dd-c46b1ead522b",
    "destinationId": "4e44e6c3-0fce-41a7-8684-828cb99608d3",
    "key": "overview",
    "title": "Zambia Overview",
    "body": "Zambia is the home of the walking safari. South Luangwa has some of the best leopard viewing in Africa, the Lower Zambezi offers canoe safaris past elephant herds, and Victoria Falls thunders on the border with Zimbabwe. Camps are small and owner-run, so it feels wild and uncrowded.",
    "bulletItems": [
      "Daily safari rates: $260 to $910 per day",
      "High season: August to October"
    ],
    "sortOrder": 0
  },
  {
    "id": "4226790c-2bfe-47a6-bf31-d27e849d4d48",
    "destinationId": "4e44e6c3-0fce-41a7-8684-828cb99608d3",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "June to October (Dry season)",
    "bulletItems": [],
    "sortOrder": 1
  },
  {
    "id": "65cde400-d4fd-4102-8a15-ade4b750fada",
    "destinationId": "4e44e6c3-0fce-41a7-8684-828cb99608d3",
    "key": "getting-there",
    "title": "Getting There",
    "body": "Fly into Lusaka or Livingstone, then take scheduled light-aircraft flights to Mfuwe (South Luangwa) or the Lower Zambezi airstrips.",
    "bulletItems": [
      "Main airports: Kenneth Kaunda International (Lusaka)",
      " Harry Mwanga Nkumbula International (Livingstone)"
    ],
    "sortOrder": 2
  },
  {
    "id": "8d9295c0-2c40-4aa5-82db-2569867fa2f1",
    "destinationId": "50eafda4-e46e-4452-bc07-dc24cf627d25",
    "key": "overview",
    "title": "Namibia Overview",
    "body": "Namibia is a land of vast deserts, towering red dunes and wide open skies. Etosha National Park is one of the easiest places in Africa to see rhino and lion at waterholes, while Sossusvlei and the Skeleton Coast offer some of the most striking landscapes on Earth. Good roads make it ideal for self-drive safaris.",
    "bulletItems": [
      "Daily safari rates: $150 to $720 per day",
      "High season: July to October"
    ],
    "sortOrder": 0
  },
  {
    "id": "0b82a4e1-e689-4472-8af9-8b7b3f4861c2",
    "destinationId": "50eafda4-e46e-4452-bc07-dc24cf627d25",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "May to October",
    "bulletItems": [],
    "sortOrder": 1
  },
  {
    "id": "dbd9a572-c154-42f9-af13-3f2840370788",
    "destinationId": "50eafda4-e46e-4452-bc07-dc24cf627d25",
    "key": "getting-there",
    "title": "Getting There",
    "body": "Fly into Windhoek. Most visitors rent a 4x4 and self-drive on well-maintained gravel and tar roads; fly-in safaris use light aircraft.",
    "bulletItems": [
      "Main airports: Hosea Kutako International (Windhoek)"
    ],
    "sortOrder": 2
  },
  {
    "id": "cdf3b00f-a98c-4fe4-a310-52a9c1b05a7c",
    "destinationId": "9e6b195c-aadb-4141-81c2-eb378188d1f6",
    "key": "overview",
    "title": "Uganda Overview",
    "body": "Uganda is the best place in Africa to combine mountain gorilla trekking with a classic savannah safari. Bwindi Impenetrable Forest is home to almost half the world's mountain gorillas, Kibale has the region's best chimpanzee tracking, and Queen Elizabeth and Murchison Falls parks offer lions, elephants and Nile boat trips.",
    "bulletItems": [
      "Daily safari rates: $180 to $820 per day",
      "High season: June to September and December to February"
    ],
    "sortOrder": 0
  },
  {
    "id": "2a4790e9-80f0-4299-b3b0-cb7dd41f6343",
    "destinationId": "9e6b195c-aadb-4141-81c2-eb378188d1f6",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "June to August and December to February",
    "bulletItems": [],
    "sortOrder": 1
  },
  {
    "id": "1d7ee099-e679-470b-bf23-1dfbb2abceeb",
    "destinationId": "9e6b195c-aadb-4141-81c2-eb378188d1f6",
    "key": "getting-there",
    "title": "Getting There",
    "body": "Fly into Entebbe. Parks are reached by road with a driver-guide or by domestic flights to Kihihi, Kisoro, Kasese and Murchison Falls airstrips.",
    "bulletItems": [
      "Main airports: Entebbe International"
    ],
    "sortOrder": 2
  },
  {
    "id": "581a9169-be0d-437d-b16d-931e1f49302b",
    "destinationId": "f7cbafbd-feed-4000-bbe4-309688c93bdb",
    "key": "overview",
    "title": "Zimbabwe Overview",
    "body": "Zimbabwe has superb guiding and wild, uncrowded parks. Hwange is famous for its huge elephant herds, Mana Pools offers walking and canoeing along the Zambezi, and Victoria Falls is one of the natural wonders of the world.",
    "bulletItems": [
      "Daily safari rates: $170 to $780 per day",
      "High season: August to October"
    ],
    "sortOrder": 0
  },
  {
    "id": "7ed4807b-1901-4787-9f1f-b4c6ce6f20da",
    "destinationId": "f7cbafbd-feed-4000-bbe4-309688c93bdb",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "July to October",
    "bulletItems": [],
    "sortOrder": 1
  },
  {
    "id": "a486e997-9896-4263-b30b-088a44103654",
    "destinationId": "f7cbafbd-feed-4000-bbe4-309688c93bdb",
    "key": "getting-there",
    "title": "Getting There",
    "body": "Fly into Victoria Falls for Hwange and the falls, or Harare for Mana Pools. Light-aircraft charters link the main parks.",
    "bulletItems": [
      "Main airports: Victoria Falls International",
      " Robert Gabriel Mugabe International (Harare)"
    ],
    "sortOrder": 2
  },
  {
    "id": "8be4a791-9f80-40c8-882f-c06ee785d82c",
    "destinationId": "75ac6bb7-c754-48e5-8bee-6d3c14aca686",
    "key": "overview",
    "title": "Rwanda Overview",
    "body": "Rwanda is small, safe and easy to travel. Volcanoes National Park offers world-class mountain gorilla trekking, Nyungwe Forest protects chimpanzees and other primates, and Akagera National Park has been restored as a Big Five savannah reserve.",
    "bulletItems": [
      "Daily safari rates: $250 to $1",
      "500 per day",
      "High season: June to September"
    ],
    "sortOrder": 0
  },
  {
    "id": "819a9b22-ca64-419d-bcef-d57081a3c378",
    "destinationId": "75ac6bb7-c754-48e5-8bee-6d3c14aca686",
    "key": "best-time",
    "title": "Best Time to Visit",
    "body": "June to September and December to February",
    "bulletItems": [],
    "sortOrder": 1
  },
  {
    "id": "dee6b7b8-bd34-4b9c-9220-21773d496b56",
    "destinationId": "75ac6bb7-c754-48e5-8bee-6d3c14aca686",
    "key": "getting-there",
    "title": "Getting There",
    "body": "Fly into Kigali. Volcanoes National Park and Akagera are each about 2.5 hours by road.",
    "bulletItems": [
      "Main airports: Kigali International"
    ],
    "sortOrder": 2
  }
];
var CATALOG_EXPERTS = [
  {
    "id": "615701cf-d3b4-4fc3-8c91-130497e6d1a3",
    "slug": "stephen-bailey",
    "name": "Stephen Bailey",
    "country": "United Kingdom",
    "reviewCount": 318,
    "biography": "Stephen is a travel writer and Africa expert who has spent the last decade exploring the continent, particularly focusing on East and Southern Africa.",
    "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    "sortOrder": 0
  },
  {
    "id": "00220bfe-bda4-4c85-8513-e25875bf9344",
    "slug": "harriet-akinyi",
    "name": "Harriet Akinyi",
    "country": "Kenya",
    "reviewCount": 245,
    "biography": "Born and raised in Nairobi, Harriet has an intimate knowledge of Kenya and Tanzania's parks, and specializes in custom family safaris.",
    "imageUrl": "https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&w=150&q=80",
    "sortOrder": 1
  },
  {
    "id": "596adc59-79c1-4c18-bfb8-33eb04af1d67",
    "slug": "james-visser",
    "name": "James Visser",
    "country": "South Africa",
    "reviewCount": 189,
    "biography": "A former game ranger, James now uses his expertise to design specialized photographic safaris across Botswana and South Africa.",
    "imageUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    "sortOrder": 2
  }
];

// ../../Working Projects/SafariAll/prisma/seed.ts
var prisma = new import_client.PrismaClient();
var day = 864e5;
var inDays = (n) => new Date(Date.now() + n * day);
var AGENCIES = [
  {
    slug: "kili-tanzanian-expeditions",
    company: "Kili Tanzanian Expeditions",
    city: "Arusha Tourism Complex, Arusha",
    country: "Tanzania",
    year: 2012,
    tier: import_client.ComfortLevel.MID_RANGE,
    rating: 4.9,
    reviews: 48,
    email: "info@kiliexpeditions.co.tz",
    first: "Amara",
    last: "Mrema",
    phone: "+255 754 123 456",
    reg: "TZ-TOUR-84920",
    overview: "Premier locally owned safari operator specialising in Big Five game drives, Ngorongoro Crater descents and private tailor-made itineraries across the northern Tanzania circuit."
  },
  {
    slug: "mara-wilderness-safaris",
    company: "Mara Wilderness Safaris",
    city: "Karen Road, Nairobi",
    country: "Kenya",
    year: 2015,
    tier: import_client.ComfortLevel.LUXURY,
    rating: 4.95,
    reviews: 62,
    email: "safari@marawilderness.co.ke",
    first: "David",
    last: "Kimani",
    phone: "+254 722 987 654",
    reg: "KE-MIN-39201",
    overview: "Kenyan safari specialists guiding travellers through the Great Migration in the Masai Mara, the elephant herds of Amboseli and the flamingo shallows of Lake Nakuru."
  },
  {
    slug: "serengeti-sunrise-safaris",
    company: "Serengeti Sunrise Safaris",
    city: "Seronera Road, Serengeti",
    country: "Tanzania",
    year: 2009,
    tier: import_client.ComfortLevel.LUXURY,
    rating: 4.8,
    reviews: 129,
    email: "bookings@serengetisunrise.co.tz",
    first: "Neema",
    last: "Kessy",
    phone: "+255 786 445 210",
    reg: "TZ-TOUR-61477",
    overview: "Luxury tented-camp specialists running photographic safaris and migration-timing expeditions with resident guides who track the herds year-round."
  },
  {
    slug: "okavango-delta-explorers",
    company: "Okavango Delta Explorers",
    city: "Maun, Ngamiland",
    country: "Botswana",
    year: 2014,
    tier: import_client.ComfortLevel.SUPER_LUXURY,
    rating: 4.9,
    reviews: 231,
    email: "hello@okavangoexplorers.bw",
    first: "Tebogo",
    last: "Molefe",
    phone: "+267 71 552 908",
    reg: "BW-TOU-11293",
    overview: "Water-and-land wilderness operators working the Okavango Delta, Chobe and the Kalahari with mokoro polers, houseboats and private conservancy concessions."
  },
  {
    slug: "gorilla-highlands-uganda",
    company: "Gorilla Highlands Uganda",
    city: "Kisoro, Western Uganda",
    country: "Uganda",
    year: 2011,
    tier: import_client.ComfortLevel.MID_RANGE,
    rating: 4.8,
    reviews: 204,
    email: "trek@gorillahighlands.ug",
    first: "Grace",
    last: "Nabirye",
    phone: "+256 772 330 118",
    reg: "UG-UTB-55210",
    overview: "Permit-handling specialists for Bwindi and Mgahinga gorilla trekking, chimp tracking in Kibale and Queen Elizabeth\u2019s crater lakes and tree-climbing lions."
  },
  {
    slug: "cape-wilderness-collection",
    company: "Cape Wilderness Collection",
    city: "Cape Town, Western Cape",
    country: "South Africa",
    year: 2007,
    tier: import_client.ComfortLevel.LUXURY,
    rating: 4.75,
    reviews: 96,
    email: "reservations@capewilderness.co.za",
    first: "Pieter",
    last: "van der Merwe",
    phone: "+27 21 555 4310",
    reg: "ZA-TOU-77341",
    overview: "Cape-based collection pairing Kruger private reserves and the Garden Route with wine-lands lodges, guided self-drive and family-friendly malaria-free options."
  }
];
var CORE_INCL = [
  "Private 4x4 safari vehicle with pop-up roof",
  "All park fees and conservation levies",
  "Professional English-speaking driver-guide",
  "Accommodation as listed on a full-board basis",
  "Bottled mineral water throughout"
];
var CORE_EXCL = [
  "International flights and visa fees",
  "Tips for guide and camp staff",
  "Travel and medical insurance",
  "Alcoholic and premium beverages"
];
var PROGRAMS = [
  {
    slug: "5-day-serengeti-ngorongoro-big-five-safari",
    op: "kili-tanzanian-expeditions",
    title: "5-Day Serengeti & Ngorongoro Big Five Classic Safari",
    days: 5,
    min: 1650,
    max: 2100,
    comfort: import_client.ComfortLevel.MID_RANGE,
    type: import_client.TourType.PRIVATE,
    country: "Tanzania",
    start: "Arusha / Kilimanjaro Airport",
    end: "Arusha",
    dests: ["lake-manyara-national-park", "serengeti-national-park", "ngorongoro-crater"],
    incl: ["Private 4x4 Land Cruiser with pop-up roof", "All park entry fees and conservation permits", "Full-board mid-range safari lodges", "Professional English-speaking driver-guide", "Unlimited game drives and mineral water"],
    excl: ["International flights and visa fees", "Tips for guide ($20/day recommended)", "Personal travel insurance", "Alcoholic beverages"],
    plan: [
      ["Arusha to Lake Manyara National Park", "Manyara Wildlife Lodge"],
      ["Lake Manyara to the Central Serengeti Plains", "Serengeti Heritage Tented Camp"],
      ["Full-day game drive in Serengeti National Park", "Serengeti Heritage Tented Camp"],
      ["Serengeti to the Ngorongoro Conservation Area", "Rhino Lodge Ngorongoro"],
      ["Ngorongoro Crater floor and return to Arusha", "N/A (Departure)"]
    ]
  },
  {
    slug: "3-day-masai-mara-express-fly-in-safari",
    op: "mara-wilderness-safaris",
    title: "3-Day Masai Mara Express Fly-in Luxury Safari",
    days: 3,
    min: 1290,
    max: 1550,
    comfort: import_client.ComfortLevel.LUXURY,
    type: import_client.TourType.FLY_IN,
    country: "Kenya",
    start: "Nairobi Wilson Airport",
    end: "Nairobi Wilson Airport",
    dests: ["masai-mara-national-reserve"],
    incl: ["Return domestic flights to the Mara airstrip", "Luxury tented-camp accommodation", "Shared 4x4 open game-drive vehicle", "All park entrance fees", "All meals with house wines and beers"],
    excl: ["International flights", "Hot-air balloon safari ($480 add-on)", "Maasai village cultural fee ($30)"],
    plan: [
      ["Fly Nairobi to the Masai Mara and afternoon safari", "Ashnil Mara Luxury Camp"],
      ["Full day of game viewing along the Mara River", "Ashnil Mara Luxury Camp"],
      ["Sunrise safari and flight back to Nairobi", "N/A (Departure)"]
    ]
  },
  {
    slug: "9-day-tanzania-budget-safari-with-beach-holiday",
    op: "serengeti-sunrise-safaris",
    title: "9-Day Tanzania Budget Safari with Beach Holiday",
    days: 9,
    min: 1432,
    max: 1646,
    comfort: import_client.ComfortLevel.BUDGET,
    type: import_client.TourType.SHARED_GROUP,
    country: "Tanzania",
    start: "Arusha",
    end: "Zanzibar",
    dests: ["tarangire-national-park", "serengeti-national-park", "ngorongoro-crater", "zanzibar"],
    incl: CORE_INCL,
    excl: CORE_EXCL,
    plan: [
      ["Arrive Arusha and meet your group", "Arusha Planet Lodge"],
      ["Tarangire National Park elephant herds", "Tarangire Simba Camp"],
      ["Into the Serengeti via Naabi Hill", "Seronera Public Campsite"],
      ["Full-day Serengeti game drive", "Seronera Public Campsite"],
      ["Ngorongoro Crater descent", "Simba Campsite, Ngorongoro Rim"],
      ["Crater rim to Arusha", "Arusha Planet Lodge"],
      ["Fly to Zanzibar, transfer to the coast", "Kendwa Beach Bungalows"],
      ["Free day \u2014 reefs, spice tour or dhow sunset", "Kendwa Beach Bungalows"],
      ["Departure from Zanzibar", "N/A (Departure)"]
    ]
  },
  {
    slug: "10-day-chasing-the-big-5-tented-safari",
    op: "kili-tanzanian-expeditions",
    title: "10-Day Chasing the Big 5 Tented Safari",
    days: 10,
    min: 2744,
    max: 3155,
    comfort: import_client.ComfortLevel.MID_RANGE,
    type: import_client.TourType.PRIVATE,
    country: "Tanzania",
    start: "Kilimanjaro Airport",
    end: "Kilimanjaro Airport",
    dests: ["tarangire-national-park", "serengeti-national-park", "ngorongoro-crater"],
    incl: CORE_INCL,
    excl: CORE_EXCL,
    plan: [
      ["Arrival and safari briefing", "Arusha Coffee Lodge"],
      ["Tarangire National Park", "Tarangire Tented Camp"],
      ["Lake Manyara escarpment and forest", "Kirurumu Tented Lodge"],
      ["Into the central Serengeti", "Serengeti Tented Camp"],
      ["Serengeti \u2014 big-cat tracking", "Serengeti Tented Camp"],
      ["Northern Serengeti and the Mara River", "Kogatende Tented Camp"],
      ["Serengeti to Ngorongoro highlands", "Ngorongoro Tented Camp"],
      ["Ngorongoro Crater full day", "Ngorongoro Tented Camp"],
      ["Optional Maasai cultural visit and Arusha", "Arusha Coffee Lodge"],
      ["Departure", "N/A (Departure)"]
    ]
  },
  {
    slug: "7-day-serengeti-migration-photographic-safari",
    op: "serengeti-sunrise-safaris",
    title: "7-Day Serengeti Migration Photographic Safari",
    days: 7,
    min: 3200,
    max: 4100,
    comfort: import_client.ComfortLevel.LUXURY,
    type: import_client.TourType.PRIVATE,
    country: "Tanzania",
    start: "Arusha",
    end: "Arusha",
    dests: ["serengeti-national-park", "ngorongoro-crater"],
    incl: ["Private photographic 4x4 with beanbags and charging", "Luxury mobile-tented camp that follows the herds", "All park fees", "Resident photographic guide", "Full board with house drinks"],
    excl: ["International flights", "Balloon safari", "Camera gear rental", "Gratuities"],
    plan: [
      ["Arusha to the Serengeti", "Serengeti Mobile Camp"],
      ["Golden-hour drives in the western corridor", "Serengeti Mobile Camp"],
      ["Mara River crossing vigil", "Serengeti Mobile Camp"],
      ["Central Serengeti predators", "Serengeti Mobile Camp"],
      ["Ngorongoro highlands", "Ngorongoro Crater Lodge"],
      ["Crater floor at first light", "Ngorongoro Crater Lodge"],
      ["Return to Arusha", "N/A (Departure)"]
    ]
  },
  {
    slug: "9-day-botswana-okavango-kalahari-adventure",
    op: "okavango-delta-explorers",
    title: "9-Day Botswana Okavango & Kalahari Adventure",
    days: 9,
    min: 3360,
    max: 3864,
    comfort: import_client.ComfortLevel.LUXURY,
    type: import_client.TourType.PRIVATE,
    country: "Botswana",
    start: "Maun",
    end: "Maun",
    dests: ["okavango-delta", "chobe-national-park", "kalahari-desert"],
    incl: ["Light-aircraft transfers between camps", "Luxury tented camps and lodges", "Mokoro, boat and 4x4 activities", "All park and concession fees", "All meals and local drinks"],
    excl: ["International and regional flights", "Premium imported spirits", "Scenic helicopter flights", "Gratuities"],
    plan: [
      ["Arrive Maun and fly into the Delta", "Okavango Delta Camp"],
      ["Mokoro and walking safari", "Okavango Delta Camp"],
      ["Delta channels and birdlife", "Okavango Delta Camp"],
      ["Fly north to Chobe", "Chobe River Lodge"],
      ["Chobe riverfront elephant herds", "Chobe River Lodge"],
      ["Sunset river cruise", "Chobe River Lodge"],
      ["Into the Kalahari", "Kalahari Plains Camp"],
      ["Black-maned lions and meerkats", "Kalahari Plains Camp"],
      ["Fly back to Maun", "N/A (Departure)"]
    ]
  },
  {
    slug: "6-day-chobe-elephant-river-safari",
    op: "okavango-delta-explorers",
    title: "6-Day Chobe Elephant River Safari",
    days: 6,
    min: 1890,
    max: 2200,
    comfort: import_client.ComfortLevel.MID_RANGE,
    type: import_client.TourType.SHARED_GROUP,
    country: "Botswana",
    start: "Kasane",
    end: "Kasane",
    dests: ["chobe-national-park"],
    incl: CORE_INCL,
    excl: CORE_EXCL,
    plan: [
      ["Arrive Kasane", "Chobe Safari Lodge"],
      ["Chobe riverfront game drive", "Chobe Safari Lodge"],
      ["Boat safari and birding", "Chobe Safari Lodge"],
      ["Chobe to Savuti", "Savuti Tented Camp"],
      ["Savuti predators", "Savuti Tented Camp"],
      ["Return to Kasane", "N/A (Departure)"]
    ]
  },
  {
    slug: "8-day-uganda-gorilla-wildlife-safari",
    op: "gorilla-highlands-uganda",
    title: "8-Day Uganda Gorilla & Wildlife Safari",
    days: 8,
    min: 3190,
    max: 3688,
    comfort: import_client.ComfortLevel.MID_RANGE,
    type: import_client.TourType.PRIVATE,
    country: "Uganda",
    start: "Entebbe",
    end: "Entebbe",
    dests: ["bwindi-impenetrable-national-park", "queen-elizabeth-national-park"],
    incl: ["Uganda gorilla trekking permit included", "Private 4x4 with driver-guide", "All park and permit fees", "Full-board lodges", "Drinking water"],
    excl: ["International flights", "Uganda visa", "Gorilla permit upgrade costs", "Tips"],
    plan: [
      ["Arrive Entebbe", "Lake Victoria Hotel"],
      ["Drive to Queen Elizabeth National Park", "Queen Elizabeth Safari Lodge"],
      ["Kazinga Channel boat cruise", "Queen Elizabeth Safari Lodge"],
      ["Ishasha tree-climbing lions to Bwindi", "Bwindi Silverback Lodge"],
      ["Gorilla trekking in Bwindi", "Bwindi Silverback Lodge"],
      ["Batwa cultural experience and rest", "Bwindi Silverback Lodge"],
      ["Return drive to Entebbe", "Lake Victoria Hotel"],
      ["Departure", "N/A (Departure)"]
    ]
  },
  {
    slug: "4-day-bwindi-gorilla-trek",
    op: "gorilla-highlands-uganda",
    title: "4-Day Bwindi Gorilla Trek Express",
    days: 4,
    min: 1950,
    max: 2340,
    comfort: import_client.ComfortLevel.LUXURY,
    type: import_client.TourType.FLY_IN,
    country: "Uganda",
    start: "Entebbe",
    end: "Entebbe",
    dests: ["bwindi-impenetrable-national-park"],
    incl: ["Gorilla permit", "Return light-aircraft flights to Kihihi", "Luxury forest lodge", "All meals", "Private guide on trek day"],
    excl: ["International flights", "Visa", "Porter fees (recommended $20)", "Gratuities"],
    plan: [
      ["Fly Entebbe to Kihihi, transfer to Bwindi", "Bwindi Silverback Lodge"],
      ["Gorilla trekking day", "Bwindi Silverback Lodge"],
      ["Community walk and fly back", "Lake Victoria Hotel"],
      ["Departure", "N/A (Departure)"]
    ]
  },
  {
    slug: "5-day-kruger-private-reserve-safari",
    op: "cape-wilderness-collection",
    title: "5-Day Kruger Private Reserve Big Five Safari",
    days: 5,
    min: 2150,
    max: 2980,
    comfort: import_client.ComfortLevel.LUXURY,
    type: import_client.TourType.PRIVATE,
    country: "South Africa",
    start: "Johannesburg / Skukuza",
    end: "Johannesburg / Skukuza",
    dests: ["kruger-national-park"],
    incl: ["Private game reserve accommodation", "Two game drives per day with ranger and tracker", "All meals and local beverages", "Conservation levies", "Road transfers"],
    excl: ["Flights", "Spa treatments", "Premium wines", "Gratuities"],
    plan: [
      ["Arrive and afternoon game drive", "Sabi Sand Reserve Lodge"],
      ["Sunrise and sunset game drives", "Sabi Sand Reserve Lodge"],
      ["Full day in the bush with a bush lunch", "Sabi Sand Reserve Lodge"],
      ["Final game drive and departure", "N/A (Departure)"],
      ["Reserve day for garden-route extension", "N/A"]
    ]
  },
  {
    slug: "7-day-cape-town-and-kruger-luxury-holiday",
    op: "cape-wilderness-collection",
    title: "7-Day Cape Town & Kruger Luxury Holiday",
    days: 7,
    min: 3450,
    max: 4200,
    comfort: import_client.ComfortLevel.SUPER_LUXURY,
    type: import_client.TourType.PRIVATE,
    country: "South Africa",
    start: "Cape Town",
    end: "Johannesburg",
    dests: ["kruger-national-park"],
    incl: ["Cape Town waterfront hotel", "Winelands private tasting day", "Private Kruger reserve lodge", "Internal flight Cape Town\u2013Skukuza", "All breakfasts and game-drive meals"],
    excl: ["International flights", "Table Mountain cableway", "Lunches in Cape Town", "Gratuities"],
    plan: [
      ["Arrive Cape Town", "V&A Waterfront Hotel"],
      ["Cape Peninsula and penguins", "V&A Waterfront Hotel"],
      ["Winelands private tasting day", "V&A Waterfront Hotel"],
      ["Fly to the Kruger", "Sabi Sand Reserve Lodge"],
      ["Big Five game drives", "Sabi Sand Reserve Lodge"],
      ["Final morning drive", "Sabi Sand Reserve Lodge"],
      ["Fly out via Johannesburg", "N/A (Departure)"]
    ]
  },
  {
    slug: "8-day-kenya-migration-amboseli-safari",
    op: "mara-wilderness-safaris",
    title: "8-Day Kenya Migration & Amboseli Safari",
    days: 8,
    min: 2480,
    max: 3120,
    comfort: import_client.ComfortLevel.MID_RANGE,
    type: import_client.TourType.SHARED_GROUP,
    country: "Kenya",
    start: "Nairobi",
    end: "Nairobi",
    dests: ["lake-nakuru-national-park", "masai-mara-national-reserve", "amboseli-national-park"],
    incl: CORE_INCL,
    excl: CORE_EXCL,
    plan: [
      ["Arrive Nairobi", "Nairobi Serena Hotel"],
      ["Rift Valley and Lake Nakuru", "Lake Nakuru Lodge"],
      ["Into the Masai Mara", "Mara Sopa Lodge"],
      ["Full day in the Mara", "Mara Sopa Lodge"],
      ["Mara to Amboseli", "Amboseli Serena Safari Lodge"],
      ["Elephants beneath Kilimanjaro", "Amboseli Serena Safari Lodge"],
      ["Return to Nairobi", "Nairobi Serena Hotel"],
      ["Departure", "N/A (Departure)"]
    ]
  },
  {
    slug: "12-day-grand-tanzania-kenya-safari",
    op: "mara-wilderness-safaris",
    title: "12-Day Grand Tanzania & Kenya Safari",
    days: 12,
    min: 4620,
    max: 5580,
    comfort: import_client.ComfortLevel.LUXURY,
    type: import_client.TourType.PRIVATE,
    country: "Kenya",
    start: "Kilimanjaro Airport",
    end: "Nairobi",
    dests: ["ngorongoro-crater", "serengeti-national-park", "masai-mara-national-reserve"],
    incl: CORE_INCL,
    excl: CORE_EXCL,
    plan: [
      ["Arrival at Kilimanjaro", "Arusha Coffee Lodge"],
      ["Tarangire and Lake Manyara", "Kirurumu Tented Lodge"],
      ["Into the Serengeti", "Serengeti Tented Camp"],
      ["Serengeti full day", "Serengeti Tented Camp"],
      ["Northern Serengeti", "Kogatende Tented Camp"],
      ["Ngorongoro highlands", "Ngorongoro Tented Camp"],
      ["Crater floor", "Ngorongoro Tented Camp"],
      ["Cross into Kenya and the Mara", "Mara Plains Camp"],
      ["Mara game drives", "Mara Plains Camp"],
      ["Migration crossings", "Mara Plains Camp"],
      ["Nairobi and rest", "Nairobi Serena Hotel"],
      ["Departure", "N/A (Departure)"]
    ]
  },
  {
    slug: "10-day-zimbabwe-victoria-falls-chobe-safari",
    op: "okavango-delta-explorers",
    title: "10-Day Victoria Falls & Chobe Adventure",
    days: 10,
    min: 2380,
    max: 2990,
    comfort: import_client.ComfortLevel.MID_RANGE,
    type: import_client.TourType.SHARED_GROUP,
    country: "Zimbabwe",
    start: "Victoria Falls",
    end: "Maun",
    dests: ["victoria-falls", "chobe-national-park", "okavango-delta"],
    incl: CORE_INCL,
    excl: CORE_EXCL,
    plan: [
      ["Arrive Victoria Falls", "Victoria Falls Safari Lodge"],
      ["Falls tour and sunset cruise", "Victoria Falls Safari Lodge"],
      ["Rafting or flight of angels", "Victoria Falls Safari Lodge"],
      ["Transfer to Chobe", "Chobe Safari Lodge"],
      ["Chobe game drives", "Chobe Safari Lodge"],
      ["Boat safari", "Chobe Safari Lodge"],
      ["Into the Delta", "Okavango Delta Camp"],
      ["Mokoro and walks", "Okavango Delta Camp"],
      ["Delta exploration", "Okavango Delta Camp"],
      ["Fly out from Maun", "N/A (Departure)"]
    ]
  }
];
var TRAVELERS = [
  { email: "traveler@gmail.com", first: "Sarah", last: "Jenkins", country: "United Kingdom", phone: "+44 7700 900077" },
  { email: "liam.oconnor@example.com", first: "Liam", last: "O\u2019Connor", country: "Ireland", phone: "+353 87 220 1188" },
  { email: "yuki.tanaka@example.com", first: "Yuki", last: "Tanaka", country: "Japan", phone: "+81 90 3344 2211" },
  { email: "ana.silva@example.com", first: "Ana", last: "Silva", country: "Brazil", phone: "+55 11 98877 4455" },
  { email: "hans.mueller@example.com", first: "Hans", last: "M\xFCller", country: "Germany", phone: "+49 151 2233 4455" }
];
async function main() {
  console.log("\u{1F331} Seeding SafariRequest marketplace\u2026");
  const adminPw = await import_bcryptjs.default.hash("AdminPass123!", 10);
  const opPw = await import_bcryptjs.default.hash("OperatorPass123!", 10);
  const trPw = await import_bcryptjs.default.hash("TravelerPass123!", 10);
  await prisma.user.upsert({
    where: { email: "admin@safariasili.com" },
    update: { role: import_client.Role.ADMIN, passwordHash: adminPw, emailVerified: true },
    create: { email: "admin@safariasili.com", passwordHash: adminPw, firstName: "System", lastName: "Admin", role: import_client.Role.ADMIN, emailVerified: true, country: "Kenya" }
  });
  const destIds = {};
  const oldIdToActualId = {};
  for (const d of CATALOG_DESTINATIONS) {
    const dest = await prisma.destination.upsert({
      where: { slug: d.slug },
      update: {
        name: d.name,
        country: d.country,
        type: d.type,
        description: d.description,
        featuredImageUrl: d.featuredImageUrl,
        latitude: d.latitude,
        longitude: d.longitude,
        bestTimeToVisit: d.bestTimeToVisit ?? void 0,
        wildlifePresent: d.wildlifePresent ?? void 0,
        bestTimeSummary: d.bestTimeSummary,
        dailyRates: d.dailyRates,
        highSeason: d.highSeason,
        popularityRank: d.popularityRank,
        rating: d.rating,
        reviewCount: d.reviewCount
      },
      create: {
        id: d.id,
        name: d.name,
        slug: d.slug,
        country: d.country,
        type: d.type,
        description: d.description,
        featuredImageUrl: d.featuredImageUrl,
        latitude: d.latitude,
        longitude: d.longitude,
        bestTimeToVisit: d.bestTimeToVisit ?? void 0,
        wildlifePresent: d.wildlifePresent ?? void 0,
        bestTimeSummary: d.bestTimeSummary,
        dailyRates: d.dailyRates,
        highSeason: d.highSeason,
        popularityRank: d.popularityRank,
        rating: d.rating,
        reviewCount: d.reviewCount
      }
    });
    destIds[dest.slug] = dest.id;
    oldIdToActualId[d.id] = dest.id;
  }
  if (destIds["central-kalahari-game-reserve"]) {
    destIds["kalahari-desert"] = destIds["central-kalahari-game-reserve"];
  }
  console.log(`\u2705 ${CATALOG_DESTINATIONS.length} destinations (countries + parks)`);
  for (const s of CATALOG_SECTIONS) {
    const destId = oldIdToActualId[s.destinationId];
    if (!destId) continue;
    await prisma.destinationSection.upsert({
      where: {
        destinationId_key: {
          destinationId: destId,
          key: s.key
        }
      },
      update: {
        title: s.title,
        body: s.body,
        bulletItems: s.bulletItems,
        sortOrder: s.sortOrder
      },
      create: {
        id: s.id,
        destinationId: destId,
        key: s.key,
        title: s.title,
        body: s.body,
        bulletItems: s.bulletItems,
        sortOrder: s.sortOrder
      }
    });
  }
  console.log(`\u2705 ${CATALOG_SECTIONS.length} destination travel guide sections`);
  for (const exp of CATALOG_EXPERTS) {
    await prisma.expert.upsert({
      where: { slug: exp.slug },
      update: {
        name: exp.name,
        country: exp.country,
        reviewCount: exp.reviewCount,
        biography: exp.biography,
        imageUrl: exp.imageUrl,
        sortOrder: exp.sortOrder
      },
      create: {
        id: exp.id,
        slug: exp.slug,
        name: exp.name,
        country: exp.country,
        reviewCount: exp.reviewCount,
        biography: exp.biography,
        imageUrl: exp.imageUrl,
        sortOrder: exp.sortOrder
      }
    });
  }
  console.log(`\u2705 ${CATALOG_EXPERTS.length} safari experts`);
  const opIds = {};
  for (const a of AGENCIES) {
    const u = await prisma.user.upsert({
      where: { email: a.email },
      update: { passwordHash: opPw, role: import_client.Role.OPERATOR, emailVerified: true },
      create: { email: a.email, passwordHash: opPw, firstName: a.first, lastName: a.last, role: import_client.Role.OPERATOR, emailVerified: true, country: a.country, phone: a.phone }
    });
    const op = await prisma.operator.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id,
        companyName: a.company,
        slug: a.slug,
        countryOfOrigin: a.country,
        headquartersAddress: a.city,
        registrationNumber: a.reg,
        isVerified: true,
        verificationDate: /* @__PURE__ */ new Date(),
        overviewText: a.overview,
        yearEstablished: a.year,
        priceTier: a.tier,
        averageRating: a.rating,
        totalReviews: a.reviews
      }
    });
    opIds[a.slug] = op.id;
  }
  console.log(`\u2705 ${AGENCIES.length} verified agencies`);
  let slotTotal = 0;
  for (const p of PROGRAMS) {
    const opId = opIds[p.op];
    const tour = await prisma.tour.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        operatorId: opId,
        title: p.title,
        slug: p.slug,
        durationDays: p.days,
        durationNights: Math.max(0, p.days - 1),
        minPriceUsd: p.min,
        maxPriceUsd: p.max,
        comfortLevel: p.comfort,
        tourType: p.type,
        primaryCountry: p.country,
        startLocation: p.start,
        endLocation: p.end,
        inclusions: p.incl,
        exclusions: p.excl,
        destinations: { create: p.dests.map((s) => ({ destinationId: destIds[s] })).filter((x) => Boolean(x.destinationId)) },
        itineraries: {
          create: p.plan.map(([title, accommodationName], i) => ({
            dayNumber: i + 1,
            title,
            description: `${title}. Your guide handles all logistics, park formalities and timing so the day flows from dawn game drive to sundowner.`,
            accommodationName,
            accommodationType: p.comfort,
            mealsIncluded: i === p.plan.length - 1 ? "Breakfast" : "Breakfast, Lunch, Dinner"
          }))
        }
      }
    });
    await prisma.tourAvailability.upsert({
      where: { tourId: tour.id },
      update: {},
      create: { tourId: tour.id, mode: "SLOTS" }
    });
    const capacities = [6, 7, 8, 4];
    for (let i = 0; i < 4; i++) {
      await prisma.tourSlot.upsert({
        where: { tourId_startDate_departureTime: { tourId: tour.id, startDate: inDays(21 + i * 30), departureTime: "08:00" } },
        update: {},
        create: {
          tourId: tour.id,
          startDate: inDays(21 + i * 30),
          maxTravelers: capacities[i],
          note: capacities[i] <= 4 ? "Small-group guaranteed departure" : "Standard departure"
        }
      });
      slotTotal++;
    }
  }
  console.log(`\u2705 ${PROGRAMS.length} programmes \xB7 ${slotTotal} limited-seat departures`);
  const trIds = {};
  for (const t of TRAVELERS) {
    const u = await prisma.user.upsert({
      where: { email: t.email },
      update: { passwordHash: trPw, role: import_client.Role.TRAVELER, emailVerified: true },
      create: { email: t.email, passwordHash: trPw, firstName: t.first, lastName: t.last, role: import_client.Role.TRAVELER, emailVerified: true, country: t.country, phone: t.phone }
    });
    trIds[t.email] = u.id;
  }
  console.log(`\u2705 ${TRAVELERS.length} travellers`);
  const reviews = [
    ["kili-tanzanian-expeditions", "5-Day Serengeti & Ngorongoro Big Five Classic Safari", 5, "Flawless from pickup to drop-off", "Amara\u2019s team tracked a leopard kill on day three and our guide read the bush like a book. Every transfer was on time.", "traveler@gmail.com"],
    ["kili-tanzanian-expeditions", "10-Day Chasing the Big 5 Tented Safari", 4.8, "Big Five ticked off by day six", "Tented camps were spotless and the crater descent was the highlight of our lives.", "hans.mueller@example.com"],
    ["mara-wilderness-safaris", "3-Day Masai Mara Express Fly-in Luxury Safari", 5, "Worth every shilling", "The bush plane, the camp, the Mara River crossing \u2014 David planned it to the minute.", "liam.oconnor@example.com"],
    ["serengeti-sunrise-safaris", "7-Day Serengeti Migration Photographic Safari", 4.9, "A photographer\u2019s dream", "Beanbags in the vehicle, resident guide who knew the herds, and golden-hour positioning every single day.", "yuki.tanaka@example.com"],
    ["okavango-delta-explorers", "9-Day Botswana Okavango & Kalahari Adventure", 5, "Water and desert, perfectly balanced", "Mokoro at dawn, black-maned lions at dusk. Tebogo\u2019s logistics were invisible in the best way.", "ana.silva@example.com"],
    ["gorilla-highlands-uganda", "8-Day Uganda Gorilla & Wildlife Safari", 4.8, "One hour with a gorilla family", "Permits sorted months ahead, and the trek was paced kindly. Unforgettable.", "traveler@gmail.com"],
    ["cape-wilderness-collection", "5-Day Kruger Private Reserve Big Five Safari", 4.7, "Ranger and tracker made it", "Two drives a day, no crowds, and a leopard on the final morning.", "hans.mueller@example.com"]
  ];
  for (const [opSlug, tourTitle, rating, title, body, reviewerEmail] of reviews) {
    const existing = await prisma.review.findFirst({ where: { operatorId: opIds[opSlug], reviewTitle: title } });
    if (existing) continue;
    const tour = await prisma.tour.findFirst({ where: { title: tourTitle } });
    await prisma.review.create({
      data: {
        operatorId: opIds[opSlug],
        tourId: tour?.id ?? null,
        travelerId: trIds[reviewerEmail],
        overallRating: rating,
        guideRating: rating,
        vehicleRating: rating,
        valueRating: rating,
        itineraryAccuracyRating: rating,
        reviewTitle: title,
        reviewBody: body,
        travelDate: new Date(Date.now() - 120 * day),
        status: "APPROVED"
      }
    });
  }
  console.log(`\u2705 ${reviews.length} approved reviews`);
  const tourBySlug = async (slug) => prisma.tour.findUnique({ where: { slug } });
  const sarah = trIds["traveler@gmail.com"];
  const liam = trIds["liam.oconnor@example.com"];
  const pastTour = await tourBySlug("5-day-serengeti-ngorongoro-big-five-safari");
  const upcomingTour = await tourBySlug("3-day-masai-mara-express-fly-in-luxury-safari") ?? await tourBySlug("3-day-masai-mara-express-fly-in-safari");
  const pendingTour = await tourBySlug("8-day-uganda-gorilla-wildlife-safari");
  const demoReservations = [];
  if (pastTour && sarah) demoReservations.push({ ref: "SR-PAST0001", travelerId: sarah, tourId: pastTour.id, operatorId: pastTour.operatorId, start: inDays(-40), adults: 2, children: 0, total: 3300, status: "APPROVED" });
  if (upcomingTour && sarah) demoReservations.push({ ref: "SR-UPCOM001", travelerId: sarah, tourId: upcomingTour.id, operatorId: upcomingTour.operatorId, start: inDays(35), adults: 2, children: 1, total: 3225, status: "APPROVED" });
  if (pendingTour && liam) demoReservations.push({ ref: "SR-PEND0001", travelerId: liam, tourId: pendingTour.id, operatorId: pendingTour.operatorId, start: inDays(70), adults: 2, children: 0, total: 6380, status: "PENDING" });
  if (pastTour && liam) demoReservations.push({ ref: "SR-DONE0001", travelerId: liam, tourId: pastTour.id, operatorId: pastTour.operatorId, start: inDays(-150), adults: 4, children: 0, total: 6600, status: "COMPLETED" });
  for (const r of demoReservations) {
    const exists = await prisma.reservation.findUnique({ where: { reference: r.ref } });
    if (exists) continue;
    const resSlotDate = new Date(r.start);
    resSlotDate.setUTCHours(8, 0, 0, 0);
    const slot = await prisma.tourSlot.upsert({
      where: {
        tourId_startDate_departureTime: {
          tourId: r.tourId,
          startDate: resSlotDate,
          departureTime: "08:00"
        }
      },
      update: {},
      create: {
        tourId: r.tourId,
        startDate: resSlotDate,
        departureTime: "08:00",
        maxTravelers: 12,
        bookedSeats: 0,
        status: import_client.SlotStatus.OPEN,
        note: "Reserved departure"
      }
    });
    await prisma.reservation.create({
      data: {
        reference: r.ref,
        travelerId: r.travelerId,
        tourId: r.tourId,
        operatorId: r.operatorId,
        slotId: slot.id,
        startDate: resSlotDate,
        adultsCount: r.adults,
        childrenCount: r.children,
        estimatedTotalUsd: r.total,
        status: r.status,
        decidedAt: r.status === "PENDING" ? null : r.start,
        completedAt: r.status === "COMPLETED" ? new Date(r.start.getTime() + 5 * day) : null
      }
    });
  }
  console.log(`\u2705 ${demoReservations.length} demo reservations`);
  const existingNote = sarah ? await prisma.notification.findFirst({ where: { userId: sarah } }) : null;
  if (sarah && !existingNote) {
    await prisma.notification.create({
      data: {
        userId: sarah,
        type: "INFO",
        title: "Welcome to SafariRequest",
        body: "Track your quotes, reservations and trip updates here. We will notify you the moment an agency responds.",
        link: "/my-trips"
      }
    });
  }
  console.log("\n\u{1F389} Seed complete.");
  console.log("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
  console.log("\u{1F511} admin@safariasili.com      / AdminPass123!");
  console.log("\u{1F511} info@kiliexpeditions.co.tz / OperatorPass123!");
  console.log("\u{1F511} bookings@serengetisunrise.co.tz / OperatorPass123!");
  console.log("\u{1F511} traveler@gmail.com        / TravelerPass123!");
  console.log("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
  console.log(`   agencies=${AGENCIES.length} programmes=${PROGRAMS.length}`);
}
main().catch((e) => {
  console.error("\u274C Seed error:", e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
