import { Pipe, PipeTransform } from '@angular/core';
import round from 'lodash-es/round';

@Pipe({
    name: 'ccFormatAmount',
    standalone: false,
})
/**
 * @deprecated
 */
export class FormatAmountPipe implements PipeTransform {
    public transform(input: number): string | number {
        const value = round(input / 100, 2);
        return value ? format(value, 2, 3, ' ', ',') : input;
    }
}

/**
 * @deprecated
 */
function format(
    value: number,
    decimalLength: number,
    wholeLength: number,
    delimiter: string,
    decimalDelimiter: string,
) {
    const exp =
        '\\d(?=(\\d{' + String(wholeLength || 3) + '})+' + (decimalLength > 0 ? '\\D' : '$') + ')';

    const num = value.toFixed(Math.max(0, ~~decimalLength));
    return (decimalDelimiter ? num.replace('.', decimalDelimiter) : num).replace(
        new RegExp(exp, 'g'),
        '$&' + (delimiter || ','),
    );
}
