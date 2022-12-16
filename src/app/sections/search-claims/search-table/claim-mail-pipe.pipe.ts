import { Pipe, PipeTransform } from '@angular/core';
import { Claim } from '@vality/domain-proto/claim_management';

@Pipe({
    name: 'ccClaimMail',
})
export class ClaimMailPipePipe implements PipeTransform {
    transform(value: Claim): string {
        let res = 'Unknown';

        const changeSet = value.changeset;
        if (changeSet.length > 0) {
            const modificationUnit = changeSet[0];
            res = modificationUnit.user_info.email;
        }

        return res;
    }
}
