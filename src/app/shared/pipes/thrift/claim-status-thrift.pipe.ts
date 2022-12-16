import { Pipe, PipeTransform } from '@angular/core';
import { ClaimStatus as UnionClaimStatus } from '@vality/domain-proto/claim_management';

import { extractClaimStatus } from '../../utils';

@Pipe({
    name: 'ccClaimStatusThrift',
})
export class ClaimStatusThriftPipe implements PipeTransform {
    transform(value: UnionClaimStatus): string {
        return extractClaimStatus(value);
    }
}
