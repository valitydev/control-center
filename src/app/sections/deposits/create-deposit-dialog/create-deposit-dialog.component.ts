import { Component, DestroyRef, ViewChild, TemplateRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, Validators } from '@angular/forms';
import { DepositParams } from '@vality/fistful-proto/deposit';
import { DialogSuperclass, NotifyLogService, progressTo } from '@vality/ng-core';
import { isTypeWithAliases } from '@vality/ng-thrift';
import { BehaviorSubject, of } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { Overwrite } from 'utility-types';

import { SourceCash } from '../../../../components/source-cash-field';
import { DepositManagementService } from '../../../api/deposit';
import { MetadataFormExtension } from '../../../shared/components/metadata-form';
import { UserInfoBasedIdGeneratorService } from '../../../shared/services';
import { FetchSourcesService } from '../../sources';

@Component({
    templateUrl: 'create-deposit-dialog.component.html',
})
export class CreateDepositDialogComponent extends DialogSuperclass<CreateDepositDialogComponent> {
    @ViewChild('sourceCashTemplate') sourceCashTemplate: TemplateRef<unknown>;

    control = new FormControl(this.getDefaultValue(), [Validators.required]);
    progress$ = new BehaviorSubject(0);
    extensions: MetadataFormExtension[] = [
        {
            determinant: (data) =>
                of(
                    isTypeWithAliases(data, 'ContextSet', 'context') ||
                        isTypeWithAliases(data, 'DepositID', 'deposit') ||
                        isTypeWithAliases(data, 'SourceID', 'deposit'),
                ),
            extension: () => of({ hidden: true }),
        },
        {
            determinant: (data) => of(isTypeWithAliases(data, 'Cash', 'base')),
            extension: () => of({ template: this.sourceCashTemplate }),
        },
    ];

    constructor(
        private destroyRef: DestroyRef,
        private depositManagementService: DepositManagementService,
        private log: NotifyLogService,
        private userInfoBasedIdGeneratorService: UserInfoBasedIdGeneratorService,
        private fetchSourcesService: FetchSourcesService,
    ) {
        super();
    }

    create() {
        const { body: sourceCash, ...value } = this.control.value;
        this.fetchSourcesService.sources$
            .pipe(
                first(),
                map(
                    (sources) =>
                        sources.find((s) => s.id === sourceCash.sourceId).currency_symbolic_code,
                ),
                map(
                    (symbolicCode): DepositParams => ({
                        ...value,
                        source_id: sourceCash.sourceId,
                        body: {
                            amount: sourceCash.amount,
                            currency: { symbolic_code: symbolicCode },
                        },
                    }),
                ),
                switchMap((params) => this.depositManagementService.Create(params, new Map())),
                progressTo(this.progress$),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: () => this.closeWithSuccess(),
                error: (err) => this.log.error(err),
            });
    }

    getDefaultValue() {
        return {
            id: this.userInfoBasedIdGeneratorService.getUsernameBasedId(),
            source_id: 'STUB',
        } as Overwrite<DepositParams, { body: SourceCash }>;
    }
}
