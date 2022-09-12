import CurrencyList from 'currency-list';

export const toMinor = (amount: number, currencyCode = 'USD'): number =>
    Math.round(amount * 10 ** (CurrencyList.get(currencyCode)?.decimal_digits ?? 2));
