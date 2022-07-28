import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BaseDialogResponseStatus, BaseDialogService } from '@vality/ng-core';
import {
    BehaviorSubject,
    combineLatest,
    defer,
    EMPTY,
    merge,
    Observable,
    Subject,
    switchMap,
} from 'rxjs';
import { catchError, first, map, shareReplay } from 'rxjs/operators';

import { ClaimManagementService } from '@cc/app/api/claim-management';
import { PartyManagementService } from '@cc/app/api/payment-processing';
import { ChangeStatusDialogComponent } from '@cc/app/sections/claim/components/change-status-dialog/change-status-dialog.component';
import { AllowedClaimStatusesService } from '@cc/app/sections/claim/services/allowed-claim-statuses.service';
import { UploadFileService } from '@cc/app/sections/claim/services/upload-file.service';
import { NotificationService } from '@cc/app/shared/services/notification';
import { getUnionKey, inProgressFrom, progressTo } from '@cc/utils';

import { AddModificationDialogComponent } from './components/add-modification-dialog/add-modification-dialog.component';
import { CLAIM_STATUS_COLOR } from './types/claim-status-color';

@UntilDestroy()
@Component({
    selector: 'cc-claim',
    templateUrl: './claim.component.html',
    styleUrls: ['claim.component.scss'],
    providers: [UploadFileService],
})
export class ClaimComponent {
    party$ = (this.route.params as Observable<Record<string, string>>).pipe(
        switchMap(({ partyID }) =>
            this.partyManagementService.Get(partyID).pipe(
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
    claim$ = merge(
        this.route.params,
        defer(() => this.loadClaim$)
    ).pipe(
        map(() => this.route.snapshot.params as Record<string, string>),
        switchMap(({ partyID, claimID }) =>
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
    isAllowedChangeStatus$ = this.claim$.pipe(
        map(
            (claim) =>
                !!this.allowedClaimStatusesService.getAllowedStatuses(getUnionKey(claim.status))
                    .length
        ),
        shareReplay({ refCount: true, bufferSize: 1 })
    );
    isLoading$ = inProgressFrom(() => this.progress$, merge(this.claim$, this.party$));
    statusColor = CLAIM_STATUS_COLOR;

    private progress$ = new BehaviorSubject(0);
    private loadClaim$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private claimManagementService: ClaimManagementService,
        private partyManagementService: PartyManagementService,
        private notificationService: NotificationService,
        private uploadFileService: UploadFileService,
        private allowedClaimStatusesService: AllowedClaimStatusesService,
        private baseDialogService: BaseDialogService
    ) {}

    reloadClaim() {
        this.loadClaim$.next();
    }

    addModification() {
        combineLatest([this.party$, this.claim$])
            .pipe(
                first(),
                switchMap(([party, claim]) =>
                    this.baseDialogService
                        .open(AddModificationDialogComponent, { party, claim })
                        .afterClosed()
                ),
                untilDestroyed(this)
            )
            .subscribe((result) => {
                if (result.status === BaseDialogResponseStatus.Success) this.reloadClaim();
            });
    }

    attachFile([file]: File[]) {
        combineLatest([this.party$, this.claim$])
            .pipe(
                first(),
                switchMap(([party, { id, revision }]) =>
                    this.uploadFileService.upload(file, party.id, id, revision)
                ),
                untilDestroyed(this)
            )
            .subscribe({
                next: () => {
                    this.reloadClaim();
                    this.notificationService.success('Uploaded successfully');
                },
                error: (err) => {
                    console.error(err);
                    this.notificationService.error('Uploading error');
                },
            });
    }

    changeStatus() {
        combineLatest([this.party$, this.claim$])
            .pipe(
                first(),
                switchMap(([party, claim]) =>
                    this.baseDialogService
                        .open(ChangeStatusDialogComponent, { partyID: party.id, claim })
                        .afterClosed()
                ),
                untilDestroyed(this)
            )
            .subscribe((result) => {
                if (result.status === BaseDialogResponseStatus.Success) this.reloadClaim();
            });
    }
}
