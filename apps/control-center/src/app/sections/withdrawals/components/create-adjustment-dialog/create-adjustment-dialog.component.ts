import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, Validators } from '@angular/forms';
import { StatWithdrawal } from '@vality/fistful-proto/fistful_stat';
import { AdjustmentParams } from '@vality/fistful-proto/withdrawal_adjustment';
import { DialogSuperclass, NotifyLogService, forkJoinToResult } from '@vality/matez';
import { ThriftFormExtension, isTypeWithAliases } from '@vality/ng-thrift';
import { BehaviorSubject, of } from 'rxjs';
import short from 'short-uuid';

import { ManagementService } from '../../../../api/withdrawal/management.service';

@Component({
    templateUrl: './create-adjustment-dialog.component.html',
    standalone: false,
})
export class CreateAdjustmentDialogComponent extends DialogSuperclass<
    CreateAdjustmentDialogComponent,
    { withdrawals: StatWithdrawal[] }
> {
    private managementService = inject(ManagementService);
    private log = inject(NotifyLogService);
    private destroyRef = inject(DestroyRef);
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
    extensions: ThriftFormExtension[] = [
        {
            determinant: (d) => of(isTypeWithAliases(d, 'AdjustmentID', 'withdrawal_adjustment')),
            extension: () => of({ hidden: true }),
        },
    ];
    progress$ = new BehaviorSubject(0);

    constructor() {
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
            this.dialogData.withdrawals,
            2,
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

                    console.log(`Adjustments: ${res.map((e) => !e.result.id).join(', ')}`);
                    this.closeWithSuccess();
                }
            });
    }
}
