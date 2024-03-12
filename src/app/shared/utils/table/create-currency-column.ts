import { inject } from '@angular/core';
import { CurrencyColumn, PossiblyAsync, getPossiblyAsyncObservable } from '@vality/ng-core';
import isNil from 'lodash-es/isNil';
import { combineLatest, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';

import { AmountCurrencyService } from '../../services';

export function createCurrencyColumn<T extends object>(
    field: CurrencyColumn<T>['field'],
    selectAmount: (d: T) => PossiblyAsync<number>,
    selectSymbolicCode: (d: T) => PossiblyAsync<string>,
    params: Partial<CurrencyColumn<T>> = {},
): CurrencyColumn<T> {
    const amountCurrencyService = inject(AmountCurrencyService);
    return {
        field,
        type: 'currency',
        formatter: (d: T) =>
            combineLatest([
                getPossiblyAsyncObservable(selectAmount(d)),
                getPossiblyAsyncObservable(selectSymbolicCode(d)),
            ]).pipe(
                switchMap(([amount, code]) =>
                    isNil(amount) ? undefined : amountCurrencyService.toMajor(amount, code),
                ),
            ),
        typeParameters: {
            currencyCode: (d: T) => selectSymbolicCode(d),
            exponent: (d: T) =>
                getPossiblyAsyncObservable(selectSymbolicCode(d)).pipe(
                    switchMap((code) => amountCurrencyService.getCurrency(code)),
                    map((c) => c.data.exponent),
                ),
        },
        ...params,
    };
}
