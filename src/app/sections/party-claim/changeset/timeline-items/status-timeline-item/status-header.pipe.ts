import { Pipe, PipeTransform } from '@angular/core';
import { ClaimStatus } from '@vality/domain-proto/lib/claim_management';

import { getUnionKey } from '@cc/utils/get-union-key';

@Pipe({
    name: 'ccStatusHeader',
})
export class StatusHeaderPipe implements PipeTransform {
    transform(status: ClaimStatus): string {
        switch (getUnionKey(status)) {
            case 'pending_acceptance':
            case 'accepted':
                return 'accepted claim';
            case 'revoked':
                return 'revoked claim';
            case 'review':
                return 'changed claim status to review';
            case 'pending':
                return 'changed claim status to pending';
            case 'denied':
                return 'denied claim';
        }
    }
}
