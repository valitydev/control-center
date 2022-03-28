import { Pipe, PipeTransform } from '@angular/core';
import { ClaimStatus } from '@vality/domain-proto/lib/claim_management';

import { getUnionKey } from '@cc/utils/get-union-key';

@Pipe({
    name: 'ccStatusBadgeColor',
})
export class StatusBadgeColorPipe implements PipeTransform {
    transform(status: ClaimStatus): 'primary' | 'warn' | 'error' | 'success' {
        switch (getUnionKey(status)) {
            case 'pending_acceptance':
            case 'accepted':
                return 'success';
            case 'revoked':
                return 'warn';
            case 'denied':
                return 'error';
        }
    }
}
