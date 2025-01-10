import { DEFAULT_CURRENCY_CODE, Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

import { formatCurrency } from '../utils';

@Pipe({
    standalone: true,
    name: 'amountCurrency',
})
export class AmountCurrencyPipe implements PipeTransform {
    constructor(
        @Inject(LOCALE_ID) private _locale: string,
        @Inject(DEFAULT_CURRENCY_CODE) private _defaultCurrencyCode: string = 'USD',
    ) {}

    transform(
        amount: unknown,
        currencyCode: string = this._defaultCurrencyCode,
        format: 'short' | 'long' = 'long',
        exponent?: number,
        isMajor = false,
    ): unknown {
        if (typeof amount === 'number') {
            return formatCurrency(amount, currencyCode, format, this._locale, exponent, isMajor);
        }
        return amount;
    }
}
