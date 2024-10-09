import { inject, LOCALE_ID } from '@angular/core';
import {
    CurrencyColumn,
    PossiblyAsync,
    getPossiblyAsyncObservable,
    Column,
    switchCombineWith,
    formatCurrency,
} from '@vality/ng-core';
import isNil from 'lodash-es/isNil';
import { combineLatest, switchMap, of, forkJoin, Observable } from 'rxjs';
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
                    isNil(amount) ? of(undefined) : amountCurrencyService.toMajor(amount, code),
                ),
            ),
        typeParameters: {
            currencyCode: (d: T) => getPossiblyAsyncObservable(selectSymbolicCode(d)),
            exponent: (d: T) =>
                getPossiblyAsyncObservable(selectSymbolicCode(d)).pipe(
                    switchMap((code) => amountCurrencyService.getCurrency(code)),
                    map((c) => c?.exponent),
                ),
        },
        ...params,
    };
}

export function createCurrenciesColumn<T extends object>(
    field: CurrencyColumn<T>['field'],
    selectAmountSymbolicCode: (d: T) => PossiblyAsync<{ amount: number; symbolicCode: string }[]>,
    params: Partial<CurrencyColumn<T>> = {},
): Column<T> {
    const amountCurrencyService = inject(AmountCurrencyService);
    const localeId = inject(LOCALE_ID);

    function getBalancesList(amountCodes$: Observable<{ amount: number; symbolicCode: string }[]>) {
        return amountCodes$.pipe(
            switchCombineWith((amountCodes) =>
                !amountCodes?.length
                    ? ([] as Observable<number[]>[])
                    : [
                          forkJoin(
                              amountCodes.map((a) =>
                                  amountCurrencyService.toMajor(a.amount, a.symbolicCode),
                              ),
                          ),
                      ],
            ),
            map(([amountCodes, majorAmounts]) =>
                amountCodes
                    .map((a, idx) =>
                        formatCurrency(
                            majorAmounts[idx],
                            a.symbolicCode,
                            undefined,
                            localeId,
                            undefined,
                            true,
                        ),
                    )
                    .join(' / '),
            ),
        );
    }

    const getAmountCodes = (d: T) =>
        getPossiblyAsyncObservable(selectAmountSymbolicCode(d)).pipe(
            map((amountCodes) => (amountCodes || []).sort((a, b) => b.amount - a.amount)),
        );
    return {
        field,
        formatter: (d: T) => getBalancesList(getAmountCodes(d).pipe(map((a) => a?.slice?.(0, 1)))),
        description: (d: T) => getBalancesList(getAmountCodes(d).pipe(map((a) => a?.slice?.(1)))),
        ...params,
    } as Column<T>;
}
