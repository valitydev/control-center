import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ClaimStatus } from '@vality/domain-proto/lib/claim_management';

@Component({
    selector: 'cc-party-claim-title',
    templateUrl: 'party-claim-title.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyClaimTitleComponent {
    @Input()
    status: ClaimStatus;

    @Input()
    claimID: string;
}
