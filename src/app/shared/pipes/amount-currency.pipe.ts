import { formatCurrency, getCurrencySymbol } from '@angular/common';
import { Pipe, Inject, LOCALE_ID, DEFAULT_CURRENCY_CODE, PipeTransform } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ReplaySubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/deprecated-damsel';

import { toMajor } from '../../../utils';

@UntilDestroy()
@Pipe({
    standalone: true,
    pure: false,
    name: 'amountCurrency',
})
export class AmountCurrencyPipe implements PipeTransform {
    private params$ = new ReplaySubject<{
        amount: number;
        currencyCode: string;
        format: 'short' | 'long';
    }>(1);
    private latestValue: string = '';
    private isInit = false;

    constructor(
        @Inject(LOCALE_ID) private _locale: string,
        @Inject(DEFAULT_CURRENCY_CODE) private _defaultCurrencyCode: string = 'USD',
        private domainStoreService: DomainStoreService
    ) {}

    init() {
        this.isInit = true;
        combineLatest([this.domainStoreService.getObjects('currency'), this.params$])
            .pipe(
                map(([currencies, { amount, currencyCode, format }]) => {
                    const exponent = currencies.find((c) => c.data.symbolic_code === currencyCode)
                        .data.exponent;
                    return formatCurrency(
                        toMajor(amount, exponent),
                        this._locale,
                        getCurrencySymbol(currencyCode, 'narrow', this._locale),
                        currencyCode,
                        format === 'short' ? '0.0-2' : undefined
                    );
                }),
                untilDestroyed(this)
            )
            .subscribe((value) => {
                this.latestValue = value;
            });
    }

    transform(
        amount: number,
        currencyCode: string = this._defaultCurrencyCode,
        format: 'short' | 'long' = 'long'
    ) {
        this.params$.next({ amount, currencyCode, format });
        if (!this.isInit) this.init();
        return this.latestValue;
    }
}
