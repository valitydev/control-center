import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Claim } from '@vality/domain-proto/lib/claim_management';
import { BehaviorSubject, EMPTY, Observable, Subject } from 'rxjs';
import { catchError, pluck, switchMap } from 'rxjs/operators';

import { ClaimManagementService } from '../../thrift-services/damsel/claim-management.service';

@Injectable()
export class CreateClaimService {
    claimCreation$ = new Subject<string>();

    claim$: Observable<Claim> = this.claimCreation$.pipe(
        switchMap((partyId) =>
            this.claimService.createClaim(partyId, []).pipe(
                catchError(() => {
                    this.snackBar.open('An error occurred while claim creation', 'OK');
                    this.error$.next({ hasError: true });
                    return EMPTY;
                })
            )
        )
    );

    private error$ = new BehaviorSubject({ hasError: false });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private claimService: ClaimManagementService,
        private snackBar: MatSnackBar
    ) {
        this.claim$.subscribe(({ id, party_id }) => {
            void this.router.navigate([`party/${party_id}/claim/${id}`]);
        });
    }

    createClaim() {
        this.route.params.pipe(pluck('partyID')).subscribe((partyID) => {
            this.claimCreation$.next(partyID);
        });
    }
}
