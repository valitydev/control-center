import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PayoutParams } from '@vality/payout-manager-proto';
import isNil from 'lodash-es/isNil';
import omitBy from 'lodash-es/omitBy';
import { BehaviorSubject } from 'rxjs';

import { PayoutManagementService } from '@cc/app/api/payout-manager';
import { NotificationService } from '@cc/app/shared/services/notification';
import { progressTo } from '@cc/utils/operators';

interface CreatePayoutDialogForm {
    partyId: string;
    shopId: string;
    currency: string;
    amount: number;
    payoutToolId?: string;
}

@UntilDestroy()
@Component({
    selector: 'cc-create-payout-dialog',
    templateUrl: './create-payout-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePayoutDialogComponent {
    progress$ = new BehaviorSubject(0);
    control = this.fb.group<CreatePayoutDialogForm>({
        partyId: null,
        shopId: null,
        currency: null,
        amount: null,
        payoutToolId: null,
    });

    constructor(
        private fb: FormBuilder,
        private payoutManagementService: PayoutManagementService,
        private dialogRef: MatDialogRef<CreatePayoutDialogComponent, boolean>,
        private notificationService: NotificationService
    ) {}

    create() {
        const { value } = this.control;
        this.payoutManagementService
            .createPayout(
                omitBy(
                    {
                        shop_params: {
                            shop_id: value.shopId,
                            party_id: value.partyId,
                        },
                        cash: {
                            amount: value.amount as never,
                            currency: { symbolic_code: value.currency },
                        },
                        payout_tool_id: value.payoutToolId,
                    },
                    isNil
                ) as PayoutParams
            )
            .pipe(untilDestroyed(this), progressTo(this.progress$))
            .subscribe({
                next: () => {
                    this.dialogRef.close(true);
                },
                error: () => {
                    this.notificationService.error('Error creating payout');
                },
            });
    }
}
