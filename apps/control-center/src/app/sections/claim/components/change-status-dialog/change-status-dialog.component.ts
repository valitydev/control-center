import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Validators, FormBuilder } from '@angular/forms';
import { Claim, ClaimStatus } from '@vality/domain-proto/claim_management';
import {
    DialogResponseStatus,
    DialogSuperclass,
    NotifyLogService,
    inProgressFrom,
    progressTo,
} from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';
import { BehaviorSubject, Observable } from 'rxjs';

import { ClaimManagementService } from '../../../../api/claim-management/claim-management.service';
import { AllowedClaimStatusesService } from '../../services/allowed-claim-statuses.service';

@Component({
    selector: 'cc-change-status-dialog',
    templateUrl: './change-status-dialog.component.html',
})
export class ChangeStatusDialogComponent extends DialogSuperclass<
    ChangeStatusDialogComponent,
    { partyID: string; claim: Claim }
> {
    form = this.fb.group({
        status: [null as keyof ClaimStatus, Validators.required],
        revokeReason: null as string,
        denyReason: null as string,
    });
    statuses = this.allowedClaimStatusesService.getAllowedStatuses(
        getUnionKey(this.dialogData.claim.status),
    );
    inProgress$ = inProgressFrom(() => this.progress$);

    private progress$ = new BehaviorSubject(0);

    constructor(
        private fb: FormBuilder,
        private claimManagementService: ClaimManagementService,
        private log: NotifyLogService,
        private allowedClaimStatusesService: AllowedClaimStatusesService,
        private destroyRef: DestroyRef,
    ) {
        super();
    }

    confirm(): void {
        let result$: Observable<void>;
        const { value } = this.form;
        const { partyID, claim } = this.dialogData;
        const params = [partyID, claim.id, claim.revision] as const;
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
        result$.pipe(progressTo(this.progress$), takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
                this.dialogRef.close({ status: DialogResponseStatus.Success });
                this.log.success('Status successfully changed');
            },
            error: this.log.error,
        });
    }
}
