import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DialogResponseStatus, DialogSuperclass } from '@vality/ng-core';
import { PayoutID } from '@vality/payout-manager-proto/payout_manager';
import { BehaviorSubject } from 'rxjs';

import { PayoutManagementService } from '@cc/app/api/payout-manager';
import { NotificationService } from '@cc/app/shared/services/notification';
import { progressTo } from '@cc/utils/operators';

import { NotificationErrorService } from '../../../../../shared/services/notification-error';

@UntilDestroy()
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
        private notificationService: NotificationService,
        private notificationErrorService: NotificationErrorService,
    ) {
        super();
    }

    accept() {
        this.payoutManagementService
            .CancelPayout(this.dialogData.id, this.detailsControl.value)
            .pipe(progressTo(this.progress$), untilDestroyed(this))
            .subscribe({
                next: () => {
                    this.dialogRef.close({ status: DialogResponseStatus.Success });
                    this.notificationService.success('Payout canceled successfully');
                },
                error: this.notificationErrorService.error,
            });
    }
}
