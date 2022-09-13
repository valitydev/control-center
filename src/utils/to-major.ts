import isNil from 'lodash-es/isNil';
import round from 'lodash-es/round';

export const toMajor = (amount: number, exponent = 2): number => {
    if (isNil(amount)) return null;
    return round(amount / 10 ** exponent, exponent);
};
