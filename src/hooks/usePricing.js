// src/hooks/usePricing.js
import { useMemo } from 'react';
import { useGeoLocation } from '@bigdatacloudapi/react-reverse-geocode-client';
import { BASE_PRICE_USD, getCountryPricingConfig, ZERO_DECIMAL_CURRENCIES } from '../lib/pricingData';

// Paystack only supports these currencies for direct charge
const PAYSTACK_SUPPORTED = ['NGN', 'GHS', 'KES', 'ZAR', 'USD'];

export function usePricing() {
  const { data: geoData, loading: geoLoading } = useGeoLocation();

  const pricing = useMemo(() => {
    // 1. Detect Country (Fallback to US if detection fails)
    const countryCode = geoData?.countryCode || 'US';
    
    // 2. Get Local Config
    const config = getCountryPricingConfig(countryCode);
    
    // 3. Calculate Local Price
    const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.includes(config.currency);
    const rawLocalPrice = BASE_PRICE_USD * config.multiplier;
    
    // If it's zero-decimal, round to whole number (e.g., 15000 IDR)
    // Otherwise, format to 2 decimal places (e.g., 4.25 GBP)
    const localPrice = isZeroDecimal 
      ? Math.round(rawLocalPrice) 
      : parseFloat(rawLocalPrice.toFixed(2));

    // 4. Determine what Paystack will actually charge
    // If the local currency is not supported by Paystack, we charge the USD equivalent
    // (e.g., a user in the UK sees £4.00, but pays $5.00 via Paystack)
    const paystackCurrency = PAYSTACK_SUPPORTED.includes(config.currency) 
      ? config.currency 
      : 'USD';

    const paystackAmount = paystackCurrency === 'USD' 
      ? BASE_PRICE_USD 
      : localPrice;

    // Paystack expects amount in the smallest unit (cents, pesewas, kobo)
    // Zero-decimal currencies do NOT need to be multiplied by 100
    const paystackSubunit = isZeroDecimal && paystackCurrency !== 'USD'
      ? paystackAmount 
      : Math.round(paystackAmount * 100);

    return {
      countryCode,
      localPrice,
      localCurrency: config.currency,
      localSymbol: config.symbol,
      paystackCurrency,
      paystackSubunit,
      isLoading: geoLoading,
      isFallback: countryCode === 'US',
      isZeroDecimal,
    };
  }, [geoData, geoLoading]);

  return pricing;
}