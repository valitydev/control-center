import { inject, LOCALE_ID } from '@angular/core';

import { formatCurrency } from '../../../utils';
import { TypedParamsValue } from '../types/base-type';

export type CurrencyAmountValue = TypedParamsValue<
    'currency',
    { code: string; exponent?: number; major?: boolean },
    Parameters<typeof formatCurrency>[0]
>;

export function currencyAmountValueToString(value: CurrencyAmountValue) {
    if (typeof value?.value !== 'number') {
        return '';
    }
    const locale = inject(LOCALE_ID);
    return formatCurrency(
        value.value,
        value.params.code,
        'long',
        locale,
        value.params.exponent,
        !!value.params.major,
    );
}
