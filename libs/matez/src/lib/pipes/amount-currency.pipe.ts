import { DEFAULT_CURRENCY_CODE, LOCALE_ID, Pipe, PipeTransform, inject } from '@angular/core';

import { formatCurrency } from '../utils';

@Pipe({
    standalone: true,
    name: 'amountCurrency',
})
export class AmountCurrencyPipe implements PipeTransform {
    private _locale = inject<string>(LOCALE_ID);
    private _defaultCurrencyCode = inject<string>(DEFAULT_CURRENCY_CODE);

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
