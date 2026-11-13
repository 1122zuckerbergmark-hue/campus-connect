// src/lib/pricingData.js

export const BASE_PRICE_USD = 5.00;

/**
 * PPP Multipliers: Adjust these to make it "cheap like coffee" in target regions.
 * A multiplier of 0.15 means 15% of the US price (e.g., $5 -> $0.75).
 * 
 * Note: For a complete dataset of 265 countries, use the World Bank PA.NUS.PRVT.PP 
 * dataset. The list below covers all major economies and regions.
 */
export const PPP_MULTIPLIERS = {
  // --- Africa ---
  GH: { multiplier: 0.15, currency: 'GHS', symbol: '₵' }, // Ghana
  NG: { multiplier: 0.10, currency: 'NGN', symbol: '₦' }, // Nigeria
  KE: { multiplier: 0.15, currency: 'KES', symbol: 'KSh' }, // Kenya
  ZA: { multiplier: 0.25, currency: 'ZAR', symbol: 'R' }, // South Africa
  EG: { multiplier: 0.10, currency: 'EGP', symbol: 'E£' }, // Egypt
  MA: { multiplier: 0.20, currency: 'MAD', symbol: 'DH' }, // Morocco
  TZ: { multiplier: 0.12, currency: 'TZS', symbol: 'TSh' }, // Tanzania
  UG: { multiplier: 0.12, currency: 'UGX', symbol: 'USh' }, // Uganda
  RW: { multiplier: 0.15, currency: 'RWF', symbol: 'FRw' }, // Rwanda
  ET: { multiplier: 0.08, currency: 'ETB', symbol: 'Br' }, // Ethiopia
  SN: { multiplier: 0.15, currency: 'XOF', symbol: 'CFA' }, // Senegal (West African CFA)
  CI: { multiplier: 0.15, currency: 'XOF', symbol: 'CFA' }, // Ivory Coast (West African CFA)

  // --- Americas ---
  US: { multiplier: 1.00, currency: 'USD', symbol: '$' }, // United States
  CA: { multiplier: 0.85, currency: 'CAD', symbol: 'C$' }, // Canada
  MX: { multiplier: 0.20, currency: 'MXN', symbol: 'Mex$' }, // Mexico
  BR: { multiplier: 0.25, currency: 'BRL', symbol: 'R$' }, // Brazil
  AR: { multiplier: 0.15, currency: 'ARS', symbol: 'AR$' }, // Argentina
  CO: { multiplier: 0.20, currency: 'COP', symbol: 'COL$' }, // Colombia
  CL: { multiplier: 0.30, currency: 'CLP', symbol: 'CLP$' }, // Chile (Zero-decimal)
  PE: { multiplier: 0.20, currency: 'PEN', symbol: 'S/' }, // Peru
  VE: { multiplier: 0.05, currency: 'VES', symbol: 'Bs' }, // Venezuela

  // --- Europe ---
  GB: { multiplier: 0.80, currency: 'GBP', symbol: '£' }, // United Kingdom
  DE: { multiplier: 0.80, currency: 'EUR', symbol: '€' }, // Germany
  FR: { multiplier: 0.80, currency: 'EUR', symbol: '€' }, // France
  IT: { multiplier: 0.80, currency: 'EUR', symbol: '€' }, // Italy
  ES: { multiplier: 0.80, currency: 'EUR', symbol: '€' }, // Spain
  NL: { multiplier: 0.80, currency: 'EUR', symbol: '€' }, // Netherlands
  CH: { multiplier: 1.10, currency: 'CHF', symbol: 'CHF' }, // Switzerland
  SE: { multiplier: 0.90, currency: 'SEK', symbol: 'kr' }, // Sweden
  NO: { multiplier: 0.95, currency: 'NOK', symbol: 'kr' }, // Norway
  PL: { multiplier: 0.35, currency: 'PLN', symbol: 'zł' }, // Poland
  UA: { multiplier: 0.15, currency: 'UAH', symbol: '₴' }, // Ukraine
  TR: { multiplier: 0.15, currency: 'TRY', symbol: '₺' }, // Turkey

  // --- Asia & Middle East ---
  IN: { multiplier: 0.10, currency: 'INR', symbol: '₹' }, // India
  PK: { multiplier: 0.10, currency: 'PKR', symbol: '₨' }, // Pakistan
  BD: { multiplier: 0.08, currency: 'BDT', symbol: '৳' }, // Bangladesh
  CN: { multiplier: 0.30, currency: 'CNY', symbol: '¥' }, // China
  JP: { multiplier: 0.90, currency: 'JPY', symbol: '¥' }, // Japan (Zero-decimal)
  KR: { multiplier: 0.70, currency: 'KRW', symbol: '₩' }, // South Korea (Zero-decimal)
  ID: { multiplier: 0.15, currency: 'IDR', symbol: 'Rp' }, // Indonesia (Zero-decimal)
  PH: { multiplier: 0.15, currency: 'PHP', symbol: '₱' }, // Philippines
  VN: { multiplier: 0.12, currency: 'VND', symbol: '₫' }, // Vietnam (Zero-decimal)
  TH: { multiplier: 0.20, currency: 'THB', symbol: '฿' }, // Thailand
  MY: { multiplier: 0.25, currency: 'MYR', symbol: 'RM' }, // Malaysia
  SG: { multiplier: 0.80, currency: 'SGD', symbol: 'S$' }, // Singapore
  SA: { multiplier: 0.40, currency: 'SAR', symbol: 'SR' }, // Saudi Arabia
  AE: { multiplier: 0.60, currency: 'AED', symbol: 'AED' }, // UAE
  IL: { multiplier: 0.85, currency: 'ILS', symbol: '₪' }, // Israel
  IR: { multiplier: 0.05, currency: 'IRR', symbol: '﷼' }, // Iran (Zero-decimal)

  // --- Oceania ---
  AU: { multiplier: 0.90, currency: 'AUD', symbol: 'A$' }, // Australia
  NZ: { multiplier: 0.85, currency: 'NZD', symbol: 'NZ$' }, // New Zealand
  PG: { multiplier: 0.20, currency: 'PGK', symbol: 'K' }, // Papua New Guinea

  // --- Fallback ---
  DEFAULT: { multiplier: 1.00, currency: 'USD', symbol: '$' }
};

// Countries where the currency has NO decimal places (Zero-decimal)
export const ZERO_DECIMAL_CURRENCIES = [
  'CLP', 'JPY', 'KRW', 'IDR', 'VND', 'IRR', 'UGX', 'XOF', 'XAF', 'RWF', 'TZS', 'ETB', 'PGK'
];

/**
 * Helper to get config for a country.
 * If the country isn't in our list, fallback to USD so the student can still pay.
 */
export const getCountryPricingConfig = (countryCode) => {
  return PPP_MULTIPLIERS[countryCode] || PPP_MULTIPLIERS.DEFAULT;
};