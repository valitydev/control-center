import { Component, Injector } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Claim, ClaimStatus } from '@vality/domain-proto/claim_management';
import { DialogResponseStatus, DialogSuperclass } from '@vality/ng-core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ClaimManagementService } from '@cc/app/api/claim-management';
import { AllowedClaimStatusesService } from '@cc/app/sections/claim/services/allowed-claim-statuses.service';
import { NotificationService } from '@cc/app/shared/services/notification';
import { getUnionKey, inProgressFrom, progressTo } from '@cc/utils';

import { NotificationErrorService } from '../../../../shared/services/notification-error';

@UntilDestroy()
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
        getUnionKey(this.dialogData.claim.status)
    );
    inProgress$ = inProgressFrom(() => this.progress$);

    private progress$ = new BehaviorSubject(0);

    constructor(
        injector: Injector,
        private fb: FormBuilder,
        private claimManagementService: ClaimManagementService,
        private notificationService: NotificationService,
        private allowedClaimStatusesService: AllowedClaimStatusesService,
        private notificationErrorService: NotificationErrorService
    ) {
        super(injector);
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
        result$.pipe(progressTo(this.progress$), untilDestroyed(this)).subscribe({
            next: () => {
                this.dialogRef.close({ status: DialogResponseStatus.Success });
                this.notificationService.success('Status successfully changed');
            },
            error: this.notificationErrorService.error,
        });
    }
}
