import { getCurrencyExponent } from './get-currency-exponent';
import { toMajorByExponent } from './to-major';
import { isNil } from 'lodash-es';

const DEFAULT_EXPONENT = 2;

export function formatCurrency(
    amount: number,
    currencyCode: string = 'USD',
    format: 'short' | 'long' = 'long',
    locale = 'en-GB',
    exponent?: number,
    isMajor: boolean = false,
): string {
    const unknownExponent = isMajor || isNil(exponent);
    if (unknownExponent) exponent = getCurrencyExponent(currencyCode) || DEFAULT_EXPONENT;
    const value = isMajor ? amount : toMajorByExponent(amount, exponent);
    let result: string;
    try {
        result = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
        }).format(value);
    } catch {
        result = `${Intl.NumberFormat(locale, {
            style: 'decimal',
            minimumFractionDigits: exponent,
        }).format(value)} ${currencyCode}`;
    }
    return (
        result + (unknownExponent ? (format === 'short' ? '' : ` [default exp: ${exponent}]`) : '')
    );
}
