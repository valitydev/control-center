import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { ClaimManagementService } from '@cc/app/api/claim-management';
import { PartyManagementWithUserService } from '@cc/app/api/payment-processing';

import { CLAIM_STATUS_COLOR } from './types/claim-status-color';

@Component({
    selector: 'cc-claim',
    templateUrl: './claim.component.html',
    styleUrls: ['claim.component.scss'],
})
export class ClaimComponent {
    party$ = (this.route.params as Observable<Record<string, string>>).pipe(
        switchMap(({ partyID }) => this.partyManagementWithUserService.getParty(partyID)),
        shareReplay({ refCount: true, bufferSize: 1 })
    );
    claim$ = (this.route.params as Observable<Record<string, string>>).pipe(
        switchMap(({ claimID, partyID }) =>
            this.claimManagementService.GetClaim(partyID, Number(claimID))
        ),
        shareReplay({ refCount: true, bufferSize: 1 })
    );
    statusColor = CLAIM_STATUS_COLOR;

    constructor(
        private route: ActivatedRoute,
        private claimManagementService: ClaimManagementService,
        private partyManagementWithUserService: PartyManagementWithUserService
    ) {}
}
