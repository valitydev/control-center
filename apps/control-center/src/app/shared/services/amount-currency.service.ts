import { Injectable } from '@angular/core';
import { toMajorByExponent, toMinorByExponent } from '@vality/matez';
import { map, first, shareReplay } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/domain-config';

@Injectable({
    providedIn: 'root',
})
export class AmountCurrencyService {
    currencies$ = this.domainStoreService.getObjects('currency').pipe(
        map((currencies) => new Map(currencies.map((c) => [c.ref.symbolic_code, c.data]))),
        shareReplay(1),
    );

    constructor(private domainStoreService: DomainStoreService) {}

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
