import { Component, Inject, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PayoutID, PayoutStatus, StatPayout } from '@vality/magista-proto';
import { switchMap } from 'rxjs';
import { filter } from 'rxjs/operators';

import { PayoutManagementService } from '@cc/app/api/payout-manager';
import { StatusColor } from '@cc/app/shared/components/status/types/status-color';
import { ConfirmActionDialogComponent } from '@cc/components/confirm-action-dialog';

import { DIALOG_CONFIG, DialogConfig } from '../../../../tokens';

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

    constructor(
        private router: Router,
        private payoutManagementService: PayoutManagementService,
        private dialog: MatDialog,
        @Inject(DIALOG_CONFIG) private dialogConfig: DialogConfig
    ) {}

    async navigateToPayout(id: PayoutID) {
        await this.router.navigate(['/payouts', id]);
    }

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
        return (['paid'] as (keyof PayoutStatus)[]).includes(status);
    }

    canBeCancelled(status: keyof PayoutStatus) {
        return (['paid', 'confirmed'] as (keyof PayoutStatus)[]).includes(status);
    }

    cancel(id: PayoutID) {
        this.dialog
            .open(ConfirmActionDialogComponent, {
                ...this.dialogConfig.medium,
                data: { id },
            })
            .afterClosed()
            .subscribe();
    }

    confirm(id: PayoutID) {
        this.dialog
            .open(ConfirmActionDialogComponent, {
                ...this.dialogConfig.medium,
                data: { title: 'Confirm payout' },
            })
            .afterClosed()
            .pipe(
                filter((res) => res === 'confirm'),
                switchMap(() => this.payoutManagementService.confirmPayout(id)),
                untilDestroyed(this)
            )
            .subscribe();
    }
}
