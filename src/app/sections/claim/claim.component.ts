import { Component, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
    Observable,
    switchMap,
    EMPTY,
    BehaviorSubject,
    merge,
    combineLatest,
    Subject,
    defer,
} from 'rxjs';
import { shareReplay, catchError, map, first } from 'rxjs/operators';

import { ClaimManagementService } from '@cc/app/api/claim-management';
import { PartyManagementWithUserService } from '@cc/app/api/payment-processing';
import { UploadFileService } from '@cc/app/sections/claim/services/upload-file.service';
import { NotificationService } from '@cc/app/shared/services/notification';
import { DIALOG_CONFIG, DialogConfig } from '@cc/app/tokens';
import { inProgressFrom, progressTo } from '@cc/utils';

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
    isLoading$ = inProgressFrom(() => this.progress$, merge(this.claim$, this.party$));
    statusColor = CLAIM_STATUS_COLOR;

    private progress$ = new BehaviorSubject(0);
    private loadClaim$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private claimManagementService: ClaimManagementService,
        private partyManagementWithUserService: PartyManagementWithUserService,
        private notificationService: NotificationService,
        private dialog: MatDialog,
        @Inject(DIALOG_CONFIG) private dialogConfig: DialogConfig,
        private uploadFileService: UploadFileService
    ) {}

    addModification() {
        combineLatest([this.party$, this.claim$])
            .pipe(
                first(),
                switchMap(([party, claim]) =>
                    this.dialog
                        .open(AddModificationDialogComponent, {
                            ...this.dialogConfig.large,
                            data: { party, claim },
                        })
                        .afterClosed()
                ),
                untilDestroyed(this)
            )
            .subscribe((result) => {
                if (result === 'success') this.reloadClaim();
            });
    }

    reloadClaim() {
        this.loadClaim$.next();
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
}
