import { Injectable, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PayoutID, PayoutStatus } from '@vality/magista-proto/magista';
import { DialogResponseStatus, DialogService, ConfirmDialogComponent } from '@vality/ng-core';
import { switchMap } from 'rxjs';
import { filter } from 'rxjs/operators';

import { PayoutManagementService } from '@cc/app/api/payout-manager';
import { NotificationErrorService } from '@cc/app/shared/services/notification-error';

import { CancelPayoutDialogComponent } from '../payouts/components/cancel-payout-dialog/cancel-payout-dialog.component';

@Injectable()
export class PayoutActionsService {
    constructor(
        private payoutManagementService: PayoutManagementService,
        private dialogService: DialogService,
        private notificationErrorService: NotificationErrorService,
        private destroyRef: DestroyRef,
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
            .open(ConfirmDialogComponent, { title: 'Confirm payout' })
            .afterClosed()
            .pipe(
                filter(({ status }) => status === DialogResponseStatus.Success),
                switchMap(() => this.payoutManagementService.ConfirmPayout(id)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                error: this.notificationErrorService.error,
            });
    }
}
