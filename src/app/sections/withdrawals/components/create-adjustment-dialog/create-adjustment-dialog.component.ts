import { Component, Injector } from '@angular/core';
import { Validators, FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ChangeRequest } from '@vality/fistful-proto/deposit_adjustment';
import { StatWithdrawal } from '@vality/fistful-proto/fistful_stat';
import { ExternalID } from '@vality/fistful-proto/withdrawal_adjustment';
import { DialogSuperclass, forkJoinToResult, NotifyLogService } from '@vality/ng-core';
import { from, of, BehaviorSubject } from 'rxjs';
import * as short from 'short-uuid';

import { ManagementService } from '@cc/app/api/withdrawal';
import { MetadataFormExtension } from '@cc/app/shared/components/metadata-form';

@UntilDestroy()
@Component({
    templateUrl: './create-adjustment-dialog.component.html',
})
export class CreateAdjustmentDialogComponent extends DialogSuperclass<
    CreateAdjustmentDialogComponent,
    { withdrawals: StatWithdrawal[] }
> {
    control = new FormControl<ChangeRequest>(
        {
            change_status: {
                new_status: { failed: { failure: { code: 'account_limit_exceeded:unknown' } } },
            },
        },
        [Validators.required],
    );
    externalIdControl = new FormControl() as FormControl<ExternalID>;
    externalIdExtensions: MetadataFormExtension[] = [
        {
            determinant: () => of(true),
            extension: () => of({ label: 'External ID' }),
        },
    ];
    typeControl = new FormControl<number>(1);
    metadata$ = from(import('@vality/fistful-proto/metadata.json').then((m) => m.default));
    progress$ = new BehaviorSubject(0);

    constructor(
        injector: Injector,
        private managementService: ManagementService,
        private log: NotifyLogService,
    ) {
        super(injector);
    }

    createAdjustment() {
        forkJoinToResult(
            this.dialogData.withdrawals.map((w) =>
                this.managementService.CreateAdjustment(w.id, {
                    id: this.typeControl.value === 0 ? w.id : short().uuid(),
                    change: this.control.value,
                    external_id: this.externalIdControl.value,
                }),
            ),
            this.progress$,
        )
            .pipe(untilDestroyed(this))
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
