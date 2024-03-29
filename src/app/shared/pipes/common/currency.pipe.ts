import { getCurrencySymbol } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

/**
 * @deprecated
 */
@Pipe({
    name: 'ccCurrency',
})
export class CurrencyPipe implements PipeTransform {
    public transform(input: string): string {
        return getCurrencySymbol(input, 'narrow');
    }
}
