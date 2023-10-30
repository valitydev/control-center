import { inject } from '@angular/core';
import { CurrencyColumn, PossiblyAsync, getPossiblyAsyncObservable } from '@vality/ng-core';
import { combineLatest, switchMap } from 'rxjs';

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
            ]).pipe(switchMap(([amount, code]) => amountCurrencyService.toMajor(amount, code))),
        typeParameters: {
            currencyCode: (d: T) => selectSymbolicCode(d),
        },
        ...params,
    };
}