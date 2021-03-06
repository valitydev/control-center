import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PartyID } from '@vality/domain-proto';
import { Claim, ClaimID } from '@vality/domain-proto/lib/claim_management';

@Component({
    selector: 'cc-claims-table',
    templateUrl: 'claims-table.component.html',
    styleUrls: ['claims-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimsTableComponent {
    @Input()
    claims: Claim[];

    displayedColumns: string[] = ['claimID', 'status', 'createdAt', 'updatedAt', 'actions'];

    constructor(private router: Router) {}

    navigateToClaim(partyID: PartyID, claimID: ClaimID) {
        void this.router.navigate([`/party/${partyID}/claim/${claimID}`]);
    }

    navigateToNewClaim(partyID: PartyID, claimID: ClaimID) {
        void this.router.navigate([`/party/${partyID}/claim/${claimID}/new`]);
    }
}
