import { Component, Injector } from '@angular/core';
import { FormControl } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PayoutID } from '@vality/payout-manager-proto';
import { BehaviorSubject } from 'rxjs';

import { PayoutManagementService } from '@cc/app/api/payout-manager';
import { NotificationService } from '@cc/app/shared/services/notification';
import { progressTo } from '@cc/utils/operators';

import {
    BaseDialogResponseStatus,
    BaseDialogSuperclass,
} from '../../../../../../components/base-dialog';

@UntilDestroy()
@Component({
    selector: 'cc-cancel-payout-dialog',
    templateUrl: './cancel-payout-dialog.component.html',
})
export class CancelPayoutDialogComponent extends BaseDialogSuperclass<
    CancelPayoutDialogComponent,
    { id: PayoutID }
> {
    detailsControl = new FormControl<string>();
    progress$ = new BehaviorSubject(0);

    constructor(
        injector: Injector,
        private payoutManagementService: PayoutManagementService,
        private notificationService: NotificationService
    ) {
        super(injector);
    }

    accept() {
        this.payoutManagementService
            .CancelPayout(this.dialogData.id, this.detailsControl.value)
            .pipe(progressTo(this.progress$), untilDestroyed(this))
            .subscribe({
                next: () => {
                    this.dialogRef.close({ status: BaseDialogResponseStatus.Success });
                    this.notificationService.success('Payout canceled successfully');
                },
                error: (err) => {
                    this.notificationService.error('Payout cancellation error');
                    console.error(err);
                },
            });
    }
}
