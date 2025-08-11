import { first, map, shareReplay } from 'rxjs/operators';

import { Injectable, inject } from '@angular/core';

import { toMajorByExponent, toMinorByExponent } from '@vality/matez';

import { CurrenciesStoreService } from '~/api/domain-config';

@Injectable({
    providedIn: 'root',
})
export class AmountCurrencyService {
    private currenciesStoreService = inject(CurrenciesStoreService);
    currencies$ = this.currenciesStoreService.currencies$.pipe(
        map((currencies) => new Map(currencies.map((c) => [c.symbolic_code, c]))),
        shareReplay(1),
    );

    toMajor(amount: number, symbolicCode: string) {
        return this.getCurrency(symbolicCode).pipe(
            first(),
            map((currency) => toMajorByExponent(amount, currency?.exponent)),
        );
    }

    toMinor(amount: number, symbolicCode: string) {
        return this.getCurrency(symbolicCode).pipe(
            first(),
            map((currency) => toMinorByExponent(amount, currency?.exponent)),
        );
    }

    getCurrency(symbolicCode: string) {
        return this.currencies$.pipe(map((currencies) => currencies.get(symbolicCode)));
    }
}
