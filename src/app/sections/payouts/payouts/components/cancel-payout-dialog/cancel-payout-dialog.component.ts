import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import {
    DialogResponseStatus,
    DialogSuperclass,
    NotifyLogService,
    progressTo,
} from '@vality/ng-core';
import { PayoutID } from '@vality/payout-manager-proto/payout_manager';
import { BehaviorSubject } from 'rxjs';

import { PayoutManagementService } from '@cc/app/api/payout-manager';

@Component({
    selector: 'cc-cancel-payout-dialog',
    templateUrl: './cancel-payout-dialog.component.html',
})
export class CancelPayoutDialogComponent extends DialogSuperclass<
    CancelPayoutDialogComponent,
    { id: PayoutID }
> {
    detailsControl = new FormControl() as FormControl<string>;
    progress$ = new BehaviorSubject(0);

    constructor(
        private payoutManagementService: PayoutManagementService,
        private log: NotifyLogService,
        private destroyRef: DestroyRef,
    ) {
        super();
    }

    accept() {
        this.payoutManagementService
            .CancelPayout(this.dialogData.id, this.detailsControl.value)
            .pipe(progressTo(this.progress$), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.dialogRef.close({ status: DialogResponseStatus.Success });
                    this.log.success('Payout canceled successfully');
                },
                error: this.log.error,
            });
    }
}
