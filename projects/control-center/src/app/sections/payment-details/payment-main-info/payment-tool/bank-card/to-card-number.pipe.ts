import { Pipe, PipeTransform } from '@angular/core';
import { BankCard } from '@vality/magista-proto/lib/domain';

@Pipe({
    name: 'toCardNumber',
})
export class ToCardNumberPipe implements PipeTransform {
    transform(card: BankCard): string {
        return toCardNumber(card);
    }
}

export const toCardNumber = (card: BankCard): string =>
    `${card.bin}******${card.last_digits}`.replace(/(.{4})/g, '$& ');
