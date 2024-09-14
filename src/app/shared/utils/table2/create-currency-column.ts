import { inject } from '@angular/core';
import { createColumn } from '@vality/ng-core';
import isNil from 'lodash-es/isNil';
import { of, concat, EMPTY } from 'rxjs';
import { map } from 'rxjs/operators';

import { AmountCurrencyService } from '../../services';

export const createCurrencyColumn = createColumn(
    ({ amount, code }: { amount: number; code: string }) => {
        const amountCurrencyService = inject(AmountCurrencyService);
        if (isNil(amount)) {
            return of(undefined);
        }
        return concat(
            amount === 0 ? of(0) : EMPTY,
            amountCurrencyService.getCurrency(code).pipe(map((c) => c?.data?.exponent)),
        ).pipe(
            map((exponent) => ({
                value: amount,
                type: 'currency',
                params: {
                    code,
                    exponent,
                },
            })),
        );
    },
);
