import { Pipe, PipeTransform } from '@angular/core';
import { Suspension } from '@vality/domain-proto/lib/domain';

import { getUnionKey } from '@cc/utils/get-union-key';

@Pipe({
    name: 'ccSuspensionPipe',
})
export class ShopSuspensionPipe implements PipeTransform {
    public transform(input: Suspension): string {
        switch (getUnionKey(input)) {
            case 'active':
                return 'Active';
            case 'suspended':
                return 'Suspended';
            default:
                return '';
        }
    }
}
