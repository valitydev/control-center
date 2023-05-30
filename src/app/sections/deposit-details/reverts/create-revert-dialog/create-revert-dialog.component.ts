import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { Validators, NonNullableFormBuilder } from '@angular/forms';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { Revert } from '@vality/fistful-proto/internal/deposit_revert';
import { DialogSuperclass, NotifyLogService, toMinor, clean } from '@vality/ng-core';
import { BehaviorSubject } from 'rxjs';

import { ManagementService } from '@cc/app/api/deposit';

import { UserInfoBasedIdGeneratorService } from '../../../../shared/services';
import { CreateRevertDialogConfig } from './types/create-revert-dialog-config';

@UntilDestroy()
@Component({
    templateUrl: 'create-revert-dialog.component.html',
    styleUrls: ['create-revert-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateRevertDialogComponent extends DialogSuperclass<
    CreateRevertDialogComponent,
    CreateRevertDialogConfig,
    Revert
> {
    form = this.fb.group({
        amount: [undefined as number, [Validators.pattern(/^\d+([,.]\d{1,2})?$/)]],
        currency: this.dialogData.currency,
        reason: undefined as string,
        externalID: undefined as string,
    });
    progress$ = new BehaviorSubject(0);

    constructor(
        injector: Injector,
        private fb: NonNullableFormBuilder,
        private depositManagementService: ManagementService,
        private idGenerator: UserInfoBasedIdGeneratorService,
        private log: NotifyLogService
    ) {
        super(injector);
    }

    createRevert() {
        const { reason, amount, currency, externalID } = this.form.value;
        this.depositManagementService
            .CreateRevert(
                this.dialogData.depositID,
                clean(
                    {
                        id: this.idGenerator.getUsernameBasedId(),
                        body: {
                            amount: toMinor(amount, currency),
                            currency: {
                                symbolic_code: currency,
                            },
                        },
                        reason,
                        external_id: externalID,
                    },
                    false,
                    true
                )
            )
            .pipe(untilDestroyed(this))
            .subscribe({
                next: (revert) => {
                    this.log.successOperation('create', 'revert');
                    this.closeWithSuccess(revert);
                },
                error: (err) => {
                    this.log.errorOperation(err, 'create', 'revert');
                },
            });
    }
}
