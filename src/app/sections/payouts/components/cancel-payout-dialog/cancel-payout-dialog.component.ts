import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PayoutID } from '@vality/payout-manager-proto';
import { BehaviorSubject } from 'rxjs';

import { PayoutManagementService } from '@cc/app/api/payout-manager';
import { NotificationService } from '@cc/app/shared/services/notification';
import { progressTo } from '@cc/utils/operators';

@UntilDestroy()
@Component({
    selector: 'cc-cancel-payout-dialog',
    templateUrl: './cancel-payout-dialog.component.html',
})
export class CancelPayoutDialogComponent {
    detailsControl = new FormControl<string>();
    progress$ = new BehaviorSubject(0);

    constructor(
        private dialogRef: MatDialogRef<CancelPayoutDialogComponent, boolean>,
        @Inject(MAT_DIALOG_DATA) private data: { id: PayoutID },
        private payoutManagementService: PayoutManagementService,
        private notificationService: NotificationService
    ) {}

    accept() {
        this.payoutManagementService
            .cancelPayout(this.data.id, this.detailsControl.value)
            .pipe(progressTo(this.progress$), untilDestroyed(this))
            .subscribe({
                next: () => {
                    this.dialogRef.close(true);
                },
                error: () => {
                    this.notificationService.error('Payout cancellation error');
                },
            });
    }
}
