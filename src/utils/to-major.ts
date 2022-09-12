import CurrencyList from 'currency-list';
import isNil from 'lodash-es/isNil';
import round from 'lodash-es/round';

export const toMajor = (amount: number, currencyCode = 'USD'): number => {
    if (isNil(amount)) return null;
    const decimalDigits = CurrencyList.get(currencyCode)?.decimal_digits ?? 2;
    return round(amount / 10 ** decimalDigits, decimalDigits);
};
