import { Component, Injector } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { BaseDialogSuperclass } from '@vality/ng-core';
import { BehaviorSubject } from 'rxjs';

import { ClaimManagementService } from '@cc/app/api/claim-management';
import { ErrorService } from '@cc/app/shared/services/error';
import { NotificationService } from '@cc/app/shared/services/notification';
import { progressTo } from '@cc/utils';

@UntilDestroy()
@Component({
    selector: 'cc-create-claim-dialog',
    templateUrl: './create-claim-dialog.component.html',
})
export class CreateClaimDialogComponent extends BaseDialogSuperclass<
    CreateClaimDialogComponent,
    { partyId: string }
> {
    control = new FormControl(this.dialogData.partyId, Validators.required);
    progress$ = new BehaviorSubject(0);

    constructor(
        injector: Injector,
        private claimService: ClaimManagementService,
        private notificationService: NotificationService,
        private errorService: ErrorService,
        private router: Router
    ) {
        super(injector);
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
                    this.errorService.error(err, 'An error occurred while claim creation');
                },
            });
    }
}
