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
