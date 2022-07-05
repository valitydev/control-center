import { Component, Injector } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormControl } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ExternalID } from '@vality/fistful-proto/lib/base';
import { StatWithdrawal } from '@vality/fistful-proto/lib/fistful_stat';
import { Status } from '@vality/fistful-proto/lib/withdrawal';
import { combineLatest, from, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import * as short from 'short-uuid';

import {
    BaseDialogResponseStatus,
    BaseDialogSuperclass,
} from '../../../../../components/base-dialog';
import { ManagementService } from '../../../../api/withdrawal';
import { MetadataFormExtension } from '../../../../shared';
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
    statusControl = new FormControl<Status>(
        { failed: { failure: { code: 'account_limit_exceeded:unknown' } } },
        [Validators.required]
    );
    externalIdControl = new FormControl<ExternalID>();
    typeControl = new FormControl<number>(0);
    metadata$ = from(import('@vality/fistful-proto/lib/metadata.json').then((m) => m.default));
    extensions: MetadataFormExtension[] = [
        {
            determinant: () => of(true),
            extension: () => of({ label: 'External ID' }),
        },
    ];
    progress = -1;

    constructor(
        injector: Injector,
        private managementService: ManagementService,
        private errorService: ErrorService,
        private notificationService: NotificationService
    ) {
        super(injector);
    }

    adjustment() {
        this.progress = 0;
        combineLatest(
            this.dialogData.withdrawals.map((w) =>
                this.managementService
                    .CreateAdjustment(w.id, {
                        id: this.typeControl.value === 0 ? w.id : short().uuid(),
                        change: { change_status: { new_status: this.statusControl.value } },
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
                next: () => {
                    this.dialogRef.close({ status: BaseDialogResponseStatus.Success });
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
