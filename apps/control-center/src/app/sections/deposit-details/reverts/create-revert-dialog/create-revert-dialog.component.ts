import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    viewChild,
    TemplateRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { DepositParams } from '@vality/fistful-proto/deposit';
import { Revert } from '@vality/fistful-proto/internal/deposit_revert';
import { DialogSuperclass, NotifyLogService, clean } from '@vality/matez';
import { isTypeWithAliases } from '@vality/ng-thrift';
import { BehaviorSubject, of } from 'rxjs';
import { Overwrite } from 'utility-types';

import { Cash } from '../../../../../components/cash-field';
import { DepositManagementService } from '../../../../api/deposit/deposit-management.service';
import { MetadataFormExtension } from '../../../../shared/components/metadata-form';
import { UserInfoBasedIdGeneratorService } from '../../../../shared/services';

import { CreateRevertDialogConfig } from './types/create-revert-dialog-config';

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
    control = new FormControl({
        id: this.idGenerator.getUsernameBasedId(),
        body: { currencyCode: this.dialogData.currency },
    } as Overwrite<DepositParams, { body: Cash }>);
    progress$ = new BehaviorSubject(0);
    cashTemplate = viewChild<TemplateRef<unknown>>('cashTemplate');
    extensions: MetadataFormExtension[] = [
        {
            determinant: (data) => of(isTypeWithAliases(data, 'RevertID', 'deposit_revert')),
            extension: () => of({ hidden: true }),
        },
        {
            determinant: (data) => of(isTypeWithAliases(data, 'Cash', 'base')),
            extension: () => of({ template: this.cashTemplate() }),
        },
    ];

    constructor(
        private depositManagementService: DepositManagementService,
        private idGenerator: UserInfoBasedIdGeneratorService,
        private log: NotifyLogService,
        private destroyRef: DestroyRef,
    ) {
        super();
    }

    createRevert() {
        const { body, ...value } = this.control.value;
        this.depositManagementService
            .CreateRevert(
                this.dialogData.depositID,
                clean(
                    {
                        ...value,
                        body: {
                            currency: { symbolic_code: body.currencyCode },
                            amount: body.amount,
                        },
                    },
                    false,
                    true,
                ),
            )
            .pipe(takeUntilDestroyed(this.destroyRef))
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
