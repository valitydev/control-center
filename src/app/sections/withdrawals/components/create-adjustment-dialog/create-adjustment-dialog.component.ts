import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Validators, FormControl } from '@angular/forms';
import { StatWithdrawal } from '@vality/fistful-proto/fistful_stat';
import { AdjustmentParams } from '@vality/fistful-proto/withdrawal_adjustment';
import { DialogSuperclass, forkJoinToResult, NotifyLogService } from '@vality/ng-core';
import { isTypeWithAliases } from '@vality/ng-thrift';
import { BehaviorSubject, of } from 'rxjs';
import short from 'short-uuid';

import { ManagementService } from '@cc/app/api/withdrawal';

import { MetadataFormExtension } from '../../../../shared/components/metadata-form';

@Component({
    templateUrl: './create-adjustment-dialog.component.html',
})
export class CreateAdjustmentDialogComponent extends DialogSuperclass<
    CreateAdjustmentDialogComponent,
    { withdrawals: StatWithdrawal[] }
> {
    control = new FormControl<Partial<AdjustmentParams>>(
        {
            id: '-',
            change: {
                change_status: {
                    new_status: { failed: { failure: { code: 'account_limit_exceeded:unknown' } } },
                },
            },
        },
        [Validators.required],
    );
    extensions: MetadataFormExtension[] = [
        {
            determinant: (d) => of(isTypeWithAliases(d, 'AdjustmentID', 'withdrawal_adjustment')),
            extension: () => of({ hidden: true }),
        },
    ];
    progress$ = new BehaviorSubject(0);

    constructor(
        private managementService: ManagementService,
        private log: NotifyLogService,
        private destroyRef: DestroyRef,
    ) {
        super();
    }

    createAdjustment() {
        forkJoinToResult(
            this.dialogData.withdrawals.map((w) =>
                this.managementService.CreateAdjustment(w.id, {
                    ...this.control.value,
                    id: short().uuid(),
                } as AdjustmentParams),
            ),
            this.progress$,
        )
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
                const withError = res.filter((e) => e.hasError);
                if (withError.length) {
                    this.log.error(
                        withError.map((c) => c.error),
                        `Adjustment of ${withError.length} withdrawals ended in an error`,
                    );
                } else {
                    this.log.successOperation('create', 'adjustments');
                    // eslint-disable-next-line no-console
                    console.log(`Adjustments: ${res.map((e) => !e.result.id).join(', ')}`);
                    this.closeWithSuccess();
                }
            });
    }
}
