import { getCurrencyExponent } from './get-currency-exponent';

export const toMinorByExponent = (amount: number, exponent: number): number =>
    Math.round(amount * 10 ** exponent);

export const toMinor = (amount: number, currencyCode: string): number =>
    toMinorByExponent(amount, getCurrencyExponent(currencyCode));
