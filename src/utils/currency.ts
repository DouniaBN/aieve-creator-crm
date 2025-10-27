// Currency utility functions

/**
 * Get currency symbol from currency code
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  const symbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF',
    'CNY': '¥',
    'INR': '₹',
    'KRW': '₩',
    'BRL': 'R$',
    'ZAR': 'R',
    'RUB': '₽',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł',
    'CZK': 'Kč',
    'HUF': 'Ft',
    'MXN': '$',
    'NZD': 'NZ$',
    'SGD': 'S$',
    'HKD': 'HK$',
    'THB': '฿',
    'PHP': '₱',
    'IDR': 'Rp',
    'MYR': 'RM',
    'VND': '₫',
    'AED': 'AED',
    'SAR': 'SAR',
    'EGP': 'E£',
    'TRY': '₺',
    'ILS': '₪'
  };

  return symbols[currencyCode?.toUpperCase()] || '$';
};

/**
 * Format amount with currency symbol
 */
export const formatCurrency = (amount: number, currencyCode: string): string => {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toLocaleString()}`;
};

/**
 * Format amount with currency symbol and decimal places
 */
export const formatCurrencyDetailed = (amount: number, currencyCode: string, decimals: number = 2): string => {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
};