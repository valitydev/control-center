import { ChangeDetectionStrategy, Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import {
    DialogResponseStatus,
    DialogSuperclass,
    NotifyLogService,
    progressTo,
    toMinor,
} from '@vality/ng-core';
import { PayoutParams } from '@vality/payout-manager-proto/payout_manager';
import isNil from 'lodash-es/isNil';
import omitBy from 'lodash-es/omitBy';
import { BehaviorSubject } from 'rxjs';

import { PayoutManagementService } from '@cc/app/api/payout-manager';

interface CreatePayoutDialogForm {
    partyId: string;
    shopId: string;
    currency: string;
    amount: number;
    payoutToolId?: string;
}

@Component({
    selector: 'cc-create-payout-dialog',
    templateUrl: './create-payout-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePayoutDialogComponent extends DialogSuperclass<CreatePayoutDialogComponent> {
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
        private log: NotifyLogService,
        private destroyRef: DestroyRef,
    ) {
        super();
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
                            amount: toMinor(value.amount, value.currency), // TODO use domain currencies refs
                            currency: { symbolic_code: value.currency },
                        },
                        payout_tool_id: value.payoutToolId,
                    },
                    isNil,
                ) as PayoutParams,
            )
            .pipe(takeUntilDestroyed(this.destroyRef), progressTo(this.progress$))
            .subscribe({
                next: () => {
                    this.log.success('Payout created successfully');
                    this.dialogRef.close({ status: DialogResponseStatus.Success });
                },
                error: this.log.error,
            });
    }
}
