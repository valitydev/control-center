import round from 'lodash-es/round';

import { getCurrencyExponent } from './get-currency-exponent';

export const toMajorByExponent = (amount: number, exponent: number): number =>
    round(amount / 10 ** exponent, exponent);

export const toMajor = (amount: number, currencyCode: string): number =>
    toMajorByExponent(amount, getCurrencyExponent(currencyCode));
