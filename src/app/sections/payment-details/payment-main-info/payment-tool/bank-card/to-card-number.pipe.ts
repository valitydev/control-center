import { Pipe, PipeTransform } from '@angular/core';
import { BankCard } from '@vality/domain-proto/lib/merch_stat';

@Pipe({
    name: 'toCardNumber',
})
export class ToCardNumberPipe implements PipeTransform {
    transform(card: BankCard): string {
        return toCardNumber(card);
    }
}

export const toCardNumber = (card: BankCard): string =>
    `${card.bin}******${card.masked_pan}`.replace(/(.{4})/g, '$& ');
