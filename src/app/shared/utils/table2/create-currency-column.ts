import { inject } from '@angular/core';
import { createColumn } from '@vality/ng-core';
import isNil from 'lodash-es/isNil';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

import { AmountCurrencyService } from '../../services';

export const createCurrencyColumn = createColumn(
    ({ amount, code }: { amount: number; code: string }) => {
        const amountCurrencyService = inject(AmountCurrencyService);
        return (isNil(amount) ? of(undefined) : amountCurrencyService.toMajor(amount, code)).pipe(
            map((value) => ({
                value,
                type: 'currency',
                params: {
                    code,
                    major: true,
                },
            })),
        );
    },
);
