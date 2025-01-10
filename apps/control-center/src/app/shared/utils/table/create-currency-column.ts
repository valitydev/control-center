import { getCurrencySymbol } from '@angular/common';
import { LOCALE_ID, inject } from '@angular/core';
import { createColumn, formatCurrency } from '@vality/matez';
import { groupBy, uniq } from 'lodash-es';
import { combineLatest, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { DomainStoreService } from '../../../api/domain-config';
import { AmountCurrencyService } from '../../services';

interface CurrencyValue {
    amount: number;
    code: string;
}

function formatCurrencyValue(value: CurrencyValue) {
    const amountCurrencyService = inject(AmountCurrencyService);
    const locale = inject(LOCALE_ID);
    return amountCurrencyService.getCurrency(value.code).pipe(
        map((currencyObj) =>
            formatCurrency(value.amount, value.code, 'long', locale, currencyObj?.exponent),
        ),
        startWith(
            (value.amount === 0 ? '0' : '…') +
                ' ' +
                getCurrencySymbol(value.code, 'narrow', locale),
        ),
    );
}

function formatCurrencyValues(values: CurrencyValue[], separator = ' | ') {
    return combineLatest(values.map(formatCurrencyValue)).pipe(map((v) => v.join(separator)));
}

export const createCurrencyColumn = createColumn(
    (currencyValue: CurrencyValue | { values: CurrencyValue[]; isSum?: boolean }) => {
        const isSum = 'isSum' in currencyValue ? currencyValue.isSum : false;
        const currencyValues = ('values' in currencyValue ? currencyValue.values : [currencyValue])
            .filter(Boolean)
            .sort((a, b) => b.amount - a.amount);
        if (!currencyValues?.length) {
            return of(undefined);
        }
        const currencyValuesByCode = groupBy(currencyValues, 'code');
        let currencyValuesByCodeList = uniq(currencyValues.map((v) => v.code)).map(
            (code) => currencyValuesByCode[code],
        );
        if (isSum) {
            currencyValuesByCodeList = currencyValuesByCodeList.map((g) =>
                g.reduce(
                    (sum, v) => {
                        sum[0].amount += v.amount;
                        return sum;
                    },
                    [{ code: g[0].code, amount: 0 }],
                ),
            );
        }
        const domainStoreService = inject(DomainStoreService);
        return combineLatest([
            combineLatest(currencyValuesByCodeList.map((g) => formatCurrencyValues(g))),
            domainStoreService.isLoading$,
        ]).pipe(
            map(([currencyValueStrings, inProgress]) => ({
                value: currencyValueStrings[0],
                description: currencyValueStrings.slice(1).join('; '),
                inProgress,
            })),
        );
    },
);
