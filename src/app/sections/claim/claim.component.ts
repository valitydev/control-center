import { Component, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap, EMPTY, BehaviorSubject, merge, combineLatest } from 'rxjs';
import { shareReplay, catchError } from 'rxjs/operators';

import { ClaimManagementService } from '@cc/app/api/claim-management';
import { PartyManagementWithUserService } from '@cc/app/api/payment-processing';
import { NotificationService } from '@cc/app/shared/services/notification';
import { DIALOG_CONFIG, DialogConfig } from '@cc/app/tokens';
import { inProgressFrom, progressTo } from '@cc/utils';

import { AddModificationDialogComponent } from './components/add-modification-dialog/add-modification-dialog.component';
import { CLAIM_STATUS_COLOR } from './types/claim-status-color';

@Component({
    selector: 'cc-claim',
    templateUrl: './claim.component.html',
    styleUrls: ['claim.component.scss'],
})
export class ClaimComponent {
    party$ = (this.route.params as Observable<Record<string, string>>).pipe(
        switchMap(({ partyID }) =>
            this.partyManagementWithUserService.getParty(partyID).pipe(
                progressTo(this.progress$),
                catchError((err) => {
                    this.notificationService.error('The party was not loaded');
                    console.error(err);
                    return EMPTY;
                })
            )
        ),
        shareReplay({ refCount: true, bufferSize: 1 })
    );
    claim$ = (this.route.params as Observable<Record<string, string>>).pipe(
        switchMap(({ claimID, partyID }) =>
            this.claimManagementService.GetClaim(partyID, Number(claimID)).pipe(
                progressTo(this.progress$),
                catchError((err) => {
                    this.notificationService.error('The claim was not loaded');
                    console.error(err);
                    return EMPTY;
                })
            )
        ),
        shareReplay({ refCount: true, bufferSize: 1 })
    );
    isLoading$ = inProgressFrom(() => this.progress$, merge(this.claim$, this.party$));
    statusColor = CLAIM_STATUS_COLOR;

    private progress$ = new BehaviorSubject(0);

    constructor(
        private route: ActivatedRoute,
        private claimManagementService: ClaimManagementService,
        private partyManagementWithUserService: PartyManagementWithUserService,
        private notificationService: NotificationService,
        private dialog: MatDialog,
        @Inject(DIALOG_CONFIG) private dialogConfig: DialogConfig
    ) {
        this.addModification();
    }

    addModification() {
        combineLatest([this.party$, this.claim$])
            .pipe(
                switchMap(([party, claim]) =>
                    this.dialog
                        .open(AddModificationDialogComponent, {
                            ...this.dialogConfig.large,
                            data: { party, claim },
                        })
                        .afterClosed()
                )
            )
            .subscribe();
    }
}
