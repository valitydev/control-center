import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogSuperclass, NotifyLogService, progressTo } from '@vality/matez';
import { BehaviorSubject } from 'rxjs';

import { ClaimManagementService } from '../../../../api/claim-management/claim-management.service';

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
        private log: NotifyLogService,
        private router: Router,
        private destroyRef: DestroyRef,
    ) {
        super();
    }

    create() {
        this.claimService
            .CreateClaim(this.control.value, [])
            .pipe(progressTo(this.progress$), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (claim) => {
                    this.log.successOperation('create', 'claim');
                    void this.router.navigate([`party/${claim.party_id}/claim/${claim.id}`]);
                    this.closeWithSuccess();
                },
                error: (err) => {
                    this.log.errorOperation(err, 'create', 'claim');
                },
            });
    }
}
