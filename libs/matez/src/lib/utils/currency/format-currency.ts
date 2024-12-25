import { formatCurrency as ngFormatCurrency, getCurrencySymbol } from '@angular/common';

import { getCurrencyExponent } from './get-currency-exponent';
import { toMajorByExponent } from './to-major';

export function formatCurrency(
    amount: number,
    currencyCode: string = 'USD',
    format: 'short' | 'long' = 'long',
    locale = 'en-GB',
    exponent?: number,
    isMajor: boolean = false,
): string {
    if (typeof exponent !== 'number') {
        exponent = getCurrencyExponent(currencyCode) || 0;
    }
    return ngFormatCurrency(
        isMajor ? amount : toMajorByExponent(amount, exponent),
        locale,
        getCurrencySymbol(currencyCode, 'narrow', locale),
        currencyCode,
        format === 'short' ? `1.0-${exponent}` : `1.${exponent}-${exponent}`,
    );
}
