import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { DialogResponseStatus, DialogService } from '@vality/ng-core';
import { BehaviorSubject, combineLatest, defer, merge, Observable, Subject, switchMap } from 'rxjs';
import { first, map, shareReplay } from 'rxjs/operators';

import { ClaimManagementService } from '@cc/app/api/claim-management';
import { PartyManagementService } from '@cc/app/api/payment-processing';
import { getUnionKey, inProgressFrom, progressTo } from '@cc/utils';

import { NotificationErrorService, handleError } from '../../shared/services/notification-error';

import { AddModificationDialogComponent } from './components/add-modification-dialog/add-modification-dialog.component';
import { ChangeStatusDialogComponent } from './components/change-status-dialog/change-status-dialog.component';
import { AllowedClaimStatusesService } from './services/allowed-claim-statuses.service';
import { CLAIM_STATUS_COLOR } from './types/claim-status-color';

@Component({
    selector: 'cc-claim',
    templateUrl: './claim.component.html',
    styleUrls: ['claim.component.scss'],
})
export class ClaimComponent {
    party$ = (this.route.params as Observable<Record<string, string>>).pipe(
        switchMap(({ partyID }) =>
            this.partyManagementService
                .Get(partyID)
                .pipe(progressTo(this.progress$), handleError(this.notificationErrorService.error)),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    claim$ = merge(
        this.route.params,
        defer(() => this.loadClaim$),
    ).pipe(
        map(() => this.route.snapshot.params as Record<string, string>),
        switchMap(({ partyID, claimID }) =>
            this.claimManagementService
                .GetClaim(partyID, Number(claimID))
                .pipe(progressTo(this.progress$), handleError(this.notificationErrorService.error)),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    isAllowedChangeStatus$ = this.claim$.pipe(
        map(
            (claim) =>
                !!this.allowedClaimStatusesService.getAllowedStatuses(getUnionKey(claim.status))
                    .length,
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    isLoading$ = inProgressFrom(() => this.progress$, merge(this.claim$, this.party$));
    statusColor = CLAIM_STATUS_COLOR;

    private progress$ = new BehaviorSubject(0);
    private loadClaim$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private claimManagementService: ClaimManagementService,
        private partyManagementService: PartyManagementService,
        private allowedClaimStatusesService: AllowedClaimStatusesService,
        private dialogService: DialogService,
        private notificationErrorService: NotificationErrorService,
        private destroyRef: DestroyRef,
    ) {}

    reloadClaim() {
        this.loadClaim$.next();
    }

    addModification() {
        combineLatest([this.party$, this.claim$])
            .pipe(
                first(),
                switchMap(([party, claim]) =>
                    this.dialogService
                        .open(AddModificationDialogComponent, { party, claim })
                        .afterClosed(),
                ),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((result) => {
                if (result.status === DialogResponseStatus.Success) {
                    this.reloadClaim();
                }
            });
    }

    changeStatus() {
        combineLatest([this.party$, this.claim$])
            .pipe(
                first(),
                switchMap(([party, claim]) =>
                    this.dialogService
                        .open(ChangeStatusDialogComponent, { partyID: party.id, claim })
                        .afterClosed(),
                ),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((result) => {
                if (result.status === DialogResponseStatus.Success) {
                    this.reloadClaim();
                }
            });
    }
}
