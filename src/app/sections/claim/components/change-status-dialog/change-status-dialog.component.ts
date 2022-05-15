import { Component, Inject } from '@angular/core';
import { Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Claim, ClaimStatus } from '@vality/domain-proto/lib/claim_management';
import { BehaviorSubject, Observable } from 'rxjs';

import { ClaimManagementService } from '@cc/app/api/claim-management';
import { AllowedClaimStatusesService } from '@cc/app/sections/claim/services/allowed-claim-statuses.service';
import { NotificationService } from '@cc/app/shared/services/notification';
import { getUnionKey, inProgressFrom, progressTo } from '@cc/utils';

@UntilDestroy()
@Component({
    selector: 'cc-change-status-dialog',
    templateUrl: './change-status-dialog.component.html',
})
export class ChangeStatusDialogComponent {
    form = this.fb.group<{ status: keyof ClaimStatus; revokeReason?: string; denyReason?: string }>(
        {
            status: [null, Validators.required],
            revokeReason: null,
            denyReason: null,
        }
    );
    statuses = this.allowedClaimStatusesService.getAllowedStatuses(
        getUnionKey(this.data.claim.status)
    );
    inProgress$ = inProgressFrom(() => this.progress$);

    private progress$ = new BehaviorSubject(0);

    constructor(
        private dialogRef: MatDialogRef<ChangeStatusDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        private data: { partyID: string; claim: Claim },
        private fb: FormBuilder,
        private claimManagementService: ClaimManagementService,
        private notificationService: NotificationService,
        private allowedClaimStatusesService: AllowedClaimStatusesService
    ) {}

    confirm(): void {
        let result$: Observable<void>;
        const { value } = this.form;
        const params = [this.data.partyID, this.data.claim.id, this.data.claim.revision] as const;
        switch (value.status) {
            case 'accepted':
                result$ = this.claimManagementService.AcceptClaim(...params);
                break;
            case 'revoked':
                result$ = this.claimManagementService.RevokeClaim(...params, value.revokeReason);
                break;
            case 'denied':
                result$ = this.claimManagementService.DenyClaim(...params, value.denyReason);
                break;
            case 'review':
                result$ = this.claimManagementService.RequestClaimReview(...params);
                break;
            case 'pending':
                result$ = this.claimManagementService.RequestClaimChanges(...params);
                break;
        }
        result$.pipe(progressTo(this.progress$), untilDestroyed(this)).subscribe({
            next: () => {
                this.dialogRef.close('success');
                this.notificationService.error('Status successfully changed');
            },
            error: (err) => {
                console.error(err);
                this.notificationService.error('Status change error');
            },
        });
    }
}
