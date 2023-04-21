import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PayoutID, PayoutStatus } from '@vality/magista-proto/magista';
import { DialogResponseStatus, DialogService } from '@vality/ng-core';
import { switchMap } from 'rxjs';
import { filter } from 'rxjs/operators';

import { PayoutManagementService } from '@cc/app/api/payout-manager';
import { NotificationErrorService } from '@cc/app/shared/services/notification-error';
import { ConfirmActionDialogComponent } from '@cc/components/confirm-action-dialog';

import { CancelPayoutDialogComponent } from '../payouts/components/cancel-payout-dialog/cancel-payout-dialog.component';

@UntilDestroy()
@Injectable()
export class PayoutActionsService {
    constructor(
        private payoutManagementService: PayoutManagementService,
        private dialogService: DialogService,
        private notificationErrorService: NotificationErrorService
    ) {}

    canBeConfirmed(status: keyof PayoutStatus) {
        return (['paid'] as (keyof PayoutStatus)[]).includes(status);
    }

    canBeCancelled(status: keyof PayoutStatus) {
        return (['paid', 'confirmed', 'unpaid'] as (keyof PayoutStatus)[]).includes(status);
    }

    cancel(id: PayoutID) {
        this.dialogService.open(CancelPayoutDialogComponent, { id });
    }

    confirm(id: PayoutID) {
        this.dialogService
            .open(ConfirmActionDialogComponent, { title: 'Confirm payout' })
            .afterClosed()
            .pipe(
                filter(({ status }) => status === DialogResponseStatus.Success),
                switchMap(() => this.payoutManagementService.ConfirmPayout(id)),
                untilDestroyed(this)
            )
            .subscribe({
                error: this.notificationErrorService.error,
            });
    }
}
