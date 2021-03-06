import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { FormBuilder } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PayoutParams } from '@vality/payout-manager-proto';
import isNil from 'lodash-es/isNil';
import omitBy from 'lodash-es/omitBy';
import { BehaviorSubject } from 'rxjs';

import { PayoutManagementService } from '@cc/app/api/payout-manager';
import { NotificationService } from '@cc/app/shared/services/notification';
import { progressTo } from '@cc/utils/operators';
import { toMinor } from '@cc/utils/to-minor';

import {
    BaseDialogResponseStatus,
    BaseDialogSuperclass,
} from '../../../../../../components/base-dialog';

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
export class CreatePayoutDialogComponent extends BaseDialogSuperclass<CreatePayoutDialogComponent> {
    progress$ = new BehaviorSubject(0);
    control = this.fb.group<CreatePayoutDialogForm>({
        partyId: null,
        shopId: null,
        currency: null,
        amount: null,
        payoutToolId: null,
    });

    constructor(
        injector: Injector,
        private fb: FormBuilder,
        private payoutManagementService: PayoutManagementService,
        private notificationService: NotificationService
    ) {
        super(injector);
    }

    create() {
        const { value } = this.control;
        this.payoutManagementService
            .CreatePayout(
                omitBy(
                    {
                        shop_params: {
                            shop_id: value.shopId,
                            party_id: value.partyId,
                        },
                        cash: {
                            amount: toMinor(value.amount),
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
                    this.notificationService.error('Payout created successfully');
                    this.dialogRef.close({ status: BaseDialogResponseStatus.Success });
                },
                error: (err) => {
                    console.error(err);
                    this.notificationService.error('Payout creation error');
                },
            });
    }
}
