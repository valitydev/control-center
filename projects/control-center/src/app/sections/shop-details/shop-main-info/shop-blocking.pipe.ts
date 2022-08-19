import { Pipe, PipeTransform } from '@angular/core';
import { Blocking } from '@vality/domain-proto/lib/domain';

import { getUnionKey } from '@cc/utils/get-union-key';

@Pipe({
    name: 'ccBlockingPipe',
})
export class ShopBlockingPipe implements PipeTransform {
    public transform(input: Blocking): string {
        switch (getUnionKey(input)) {
            case 'blocked':
                return 'Blocked';
            case 'unblocked':
                return 'Unblocked';
            default:
                return '';
        }
    }
}
