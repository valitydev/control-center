import { Component, Input } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { PayoutID, PayoutStatus, StatPayout } from '@vality/magista-proto/magista';

import { StatusColor } from '@cc/app/styles';

import { PayoutActionsService } from '../../../services/payout-actions.service';

@UntilDestroy()
@Component({
    selector: 'cc-payouts-table',
    templateUrl: './payouts-table.component.html',
    styleUrls: ['./payouts-table.component.scss'],
})
export class PayoutsTableComponent {
    @Input() payouts: StatPayout[];

    displayedColumns: string[] = [
        'id',
        'party',
        'shop',
        'createdAt',
        'status',
        'amount',
        'fee',
        'payoutToolType',
        'actions',
    ];

    constructor(private payoutActionsService: PayoutActionsService) {}

    getColorByStatus(status: keyof PayoutStatus) {
        switch (status) {
            case 'paid':
            case 'confirmed':
                return StatusColor.Success;
            case 'unpaid':
                return StatusColor.Pending;
            case 'cancelled':
                return StatusColor.Warn;
            default:
                return StatusColor.Neutral;
        }
    }

    canBeConfirmed(status: keyof PayoutStatus) {
        return this.payoutActionsService.canBeConfirmed(status);
    }

    canBeCancelled(status: keyof PayoutStatus) {
        return this.payoutActionsService.canBeCancelled(status);
    }

    cancel(id: PayoutID) {
        this.payoutActionsService.cancel(id);
    }

    confirm(id: PayoutID) {
        this.payoutActionsService.confirm(id);
    }
}
