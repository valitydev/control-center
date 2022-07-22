import { Injectable } from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { PayoutID, PayoutStatus } from '@vality/magista-proto';
import { switchMap } from 'rxjs';
import { filter } from 'rxjs/operators';

import { BaseDialogResponseStatus } from '../../../../components/base-dialog';
import { BaseDialogService } from '../../../../components/base-dialog/services/base-dialog.service';
import { ConfirmActionDialogComponent } from '../../../../components/confirm-action-dialog';
import { PayoutManagementService } from '../../../api/payout-manager';
import { NotificationService } from '../../../shared/services/notification';
import { CancelPayoutDialogComponent } from '../payouts/components/cancel-payout-dialog/cancel-payout-dialog.component';

@Injectable({
    providedIn: 'root',
})
export class PayoutActionsService {
    constructor(
        private payoutManagementService: PayoutManagementService,
        private baseDialogService: BaseDialogService,
        private notificationService: NotificationService
    ) {}

    canBeConfirmed(status: keyof PayoutStatus) {
        return (['paid'] as (keyof PayoutStatus)[]).includes(status);
    }

    canBeCancelled(status: keyof PayoutStatus) {
        return (['paid', 'confirmed', 'unpaid'] as (keyof PayoutStatus)[]).includes(status);
    }

    cancel(id: PayoutID) {
        this.baseDialogService.open(CancelPayoutDialogComponent, { id }).afterClosed().subscribe();
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
                error: (err) => {
                    this.notificationService.error('Payout confirmation error');
                    console.error(err);
                },
            });
    }
}
