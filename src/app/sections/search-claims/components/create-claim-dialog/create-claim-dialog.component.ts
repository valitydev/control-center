import { Component, Injector } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseDialogSuperclass } from '@vality/ng-core';

import { ClaimManagementService } from '@cc/app/api/claim-management';
import { ErrorService } from '@cc/app/shared/services/error';
import { NotificationService } from '@cc/app/shared/services/notification';

@Component({
    selector: 'cc-create-claim-dialog',
    templateUrl: './create-claim-dialog.component.html',
})
export class CreateClaimDialogComponent extends BaseDialogSuperclass<
    CreateClaimDialogComponent,
    { partyId: string }
> {
    control = new FormControl(this.dialogData.partyId, Validators.required);

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
        this.claimService.CreateClaim(this.dialogData.partyId, []).subscribe({
            next: (claim) => {
                this.notificationService.success('Claim successfully created');
                void this.router.navigate([`party/${this.dialogData.partyId}/claim/${claim.id}`]);
            },
            error: (err) => {
                this.errorService.error(err, 'An error occurred while claim creation');
            },
        });
    }
}
