import { Component, Injector } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormControl } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ExternalID } from '@vality/fistful-proto/lib/base';
import { ChangeRequest } from '@vality/fistful-proto/lib/deposit_adjustment';
import { StatWithdrawal } from '@vality/fistful-proto/lib/fistful_stat';
import { BaseDialogResponseStatus, BaseDialogSuperclass } from '@vality/ng-core';
import { combineLatest, from, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import * as short from 'short-uuid';

import { MetadataFormExtension } from '@cc/app/shared/components/metadata-form';

import { ManagementService } from '../../../../api/withdrawal';
import { ErrorService } from '../../../../shared/services/error';
import { NotificationService } from '../../../../shared/services/notification';

@UntilDestroy()
@Component({
    templateUrl: './create-adjustment-dialog.component.html',
})
export class CreateAdjustmentDialogComponent extends BaseDialogSuperclass<
    CreateAdjustmentDialogComponent,
    { withdrawals: StatWithdrawal[] }
> {
    control = new FormControl<ChangeRequest>(
        {
            change_status: {
                new_status: { failed: { failure: { code: 'account_limit_exceeded:unknown' } } },
            },
        },
        [Validators.required]
    );
    externalIdControl = new FormControl<ExternalID>();
    externalIdExtensions: MetadataFormExtension[] = [
        {
            determinant: () => of(true),
            extension: () => of({ label: 'External ID' }),
        },
    ];
    typeControl = new FormControl<number>(0);
    metadata$ = from(import('@vality/fistful-proto/lib/metadata.json').then((m) => m.default));
    progress = -1;

    constructor(
        injector: Injector,
        private managementService: ManagementService,
        private errorService: ErrorService,
        private notificationService: NotificationService
    ) {
        super(injector);
    }

    createAdjustment() {
        this.progress = 0;
        combineLatest(
            this.dialogData.withdrawals.map((w) =>
                this.managementService
                    .CreateAdjustment(w.id, {
                        id: this.typeControl.value === 0 ? w.id : short().uuid(),
                        change: this.control.value,
                        external_id: this.externalIdControl.value,
                    })
                    .pipe(
                        catchError(() => {
                            this.notificationService.error(
                                `Error when creating adjustment for withdrawal ${w.id}`
                            );
                            return of(null);
                        }),
                        finalize(() => {
                            this.progress += 1;
                        })
                    )
            )
        )
            .pipe(untilDestroyed(this))
            .subscribe({
                next: (res) => {
                    if (!res.includes(null)) {
                        this.dialogRef.close({ status: BaseDialogResponseStatus.Success });
                    }
                },
                error: (err) => {
                    this.errorService.error(err);
                    this.notificationService.error();
                },
                complete: () => {
                    this.progress = -1;
                },
            });
    }
}
