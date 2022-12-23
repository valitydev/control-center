import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PayoutID, PayoutStatus } from '@vality/magista-proto/magista';
import { BaseDialogResponseStatus, BaseDialogService } from '@vality/ng-core';
import { switchMap } from 'rxjs';
import { filter } from 'rxjs/operators';

import { ConfirmActionDialogComponent } from '../../../../components/confirm-action-dialog';
import { PayoutManagementService } from '../../../api/payout-manager';
import { NotificationService } from '../../../shared/services/notification';
import { NotificationErrorService } from '../../../shared/services/notification-error';
import { CancelPayoutDialogComponent } from '../payouts/components/cancel-payout-dialog/cancel-payout-dialog.component';

@UntilDestroy()
@Injectable()
export class PayoutActionsService {
    constructor(
        private payoutManagementService: PayoutManagementService,
        private baseDialogService: BaseDialogService,
        private notificationService: NotificationService,
        private notificationErrorService: NotificationErrorService
    ) {}

    canBeConfirmed(status: keyof PayoutStatus) {
        return (['paid'] as (keyof PayoutStatus)[]).includes(status);
    }

    canBeCancelled(status: keyof PayoutStatus) {
        return (['paid', 'confirmed', 'unpaid'] as (keyof PayoutStatus)[]).includes(status);
    }

    cancel(id: PayoutID) {
        this.baseDialogService.open(CancelPayoutDialogComponent, { id });
    }

    confirm(id: PayoutID) {
        this.baseDialogService
            .open(ConfirmActionDialogComponent, { title: 'Confirm payout' })
            .afterClosed()
            .pipe(
                filter(({ status }) => status === BaseDialogResponseStatus.Success),
                switchMap(() => this.payoutManagementService.ConfirmPayout(id)),
                untilDestroyed(this)
            )
            .subscribe({
                error: this.notificationErrorService.error,
            });
    }
}
