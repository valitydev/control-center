import * as currencies from '@dinero.js/currencies';

export const getCurrencyExponent = (currencyCode: string): number =>
    currencies[currencyCode as keyof typeof currencies]?.exponent;
