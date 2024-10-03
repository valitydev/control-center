import { inject, LOCALE_ID } from '@angular/core';
import { createColumn, formatCurrency } from '@vality/ng-core';
import isNil from 'lodash-es/isNil';
import { of, concat, EMPTY, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { AmountCurrencyService } from '../../services';

export const createCurrencyColumn = createColumn(
    ({
        amount,
        code,
        other = [],
    }: {
        amount: number;
        code: string;
        other?: { amount: number; code: string }[];
    }) => {
        const amountCurrencyService = inject(AmountCurrencyService);
        const locale = inject(LOCALE_ID);
        if (isNil(amount)) {
            return of(undefined);
        }
        return combineLatest([
            concat(
                amount === 0 ? of(0) : EMPTY,
                amountCurrencyService.getCurrency(code).pipe(map((c) => c?.data?.exponent)),
            ),
            other.map((c) =>
                amountCurrencyService.getCurrency(c.code).pipe(map((c) => c?.data?.exponent)),
            ),
        ]).pipe(
            map(([exponent, otherExps]) => ({
                value: amount,
                description: other
                    .map((c, idx) =>
                        formatCurrency(c.amount, c.code, 'long', locale, otherExps[idx]),
                    )
                    .join(' | '),
                type: 'currency',
                params: {
                    code,
                    exponent,
                },
            })),
        );
    },
);
