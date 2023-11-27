import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { DialogSuperclass } from '@vality/ng-core';
import { BehaviorSubject } from 'rxjs';

import { ClaimManagementService } from '@cc/app/api/claim-management';
import { NotificationService } from '@cc/app/shared/services/notification';
import { NotificationErrorService } from '@cc/app/shared/services/notification-error';
import { progressTo } from '@cc/utils';

@UntilDestroy()
@Component({
    selector: 'cc-create-claim-dialog',
    templateUrl: './create-claim-dialog.component.html',
})
export class CreateClaimDialogComponent extends DialogSuperclass<
    CreateClaimDialogComponent,
    { partyId: string }
> {
    control = new FormControl(this.dialogData.partyId, Validators.required);
    progress$ = new BehaviorSubject(0);

    constructor(
        private claimService: ClaimManagementService,
        private notificationService: NotificationService,
        private notificationErrorService: NotificationErrorService,
        private router: Router,
    ) {
        super();
    }

    create() {
        this.claimService
            .CreateClaim(this.control.value, [])
            .pipe(progressTo(this.progress$), untilDestroyed(this))
            .subscribe({
                next: (claim) => {
                    this.notificationService.success('Claim successfully created');
                    void this.router.navigate([`party/${claim.party_id}/claim/${claim.id}`]);
                    this.closeWithSuccess();
                },
                error: (err) => {
                    this.notificationErrorService.error(
                        err,
                        'An error occurred while claim creation',
                    );
                },
            });
    }
}
