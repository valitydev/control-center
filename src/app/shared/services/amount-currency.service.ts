import { Injectable } from '@angular/core';
import { toMajorByExponent } from '@vality/ng-core';
import { map, first } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/deprecated-damsel';

@Injectable({
    providedIn: 'root',
})
export class AmountCurrencyService {
    constructor(private domainStoreService: DomainStoreService) {}

    toMajor(amount: number, symbolicCode: string) {
        return this.getCurrency(symbolicCode).pipe(
            first(),
            map((currency) => toMajorByExponent(amount, currency.data.exponent))
        );
    }

    getCurrency(symbolicCode: string) {
        return this.domainStoreService
            .getObjects('currency')
            .pipe(
                map((currencies) => currencies.find((c) => c.ref.symbolic_code === symbolicCode))
            );
    }
}
