import { Component, DestroyRef, TemplateRef, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, Validators } from '@angular/forms';
import { DepositParams, Management } from '@vality/fistful-proto/deposit';
import { DialogSuperclass, NotifyLogService, progressTo } from '@vality/matez';
import { ThriftFormExtension, isTypeWithAliases } from '@vality/ng-thrift';
import { BehaviorSubject, of } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { Overwrite } from 'utility-types';

import { SourceCash } from '../../../../components/source-cash-field';
import { UserInfoBasedIdGeneratorService } from '../../../../services';
import { FetchSourcesService } from '../../../sections/sources';

@Component({
    templateUrl: 'create-deposit-dialog.component.html',
    standalone: false,
})
export class CreateDepositDialogComponent extends DialogSuperclass<CreateDepositDialogComponent> {
    private destroyRef = inject(DestroyRef);
    private depositManagementService = inject(Management);
    private log = inject(NotifyLogService);
    private userInfoBasedIdGeneratorService = inject(UserInfoBasedIdGeneratorService);
    private fetchSourcesService = inject(FetchSourcesService);

    @ViewChild('sourceCashTemplate') sourceCashTemplate: TemplateRef<unknown>;

    control = new FormControl(this.getDefaultValue(), [Validators.required]);
    progress$ = new BehaviorSubject(0);
    extensions: ThriftFormExtension[] = [
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

    create() {
        const { body: sourceCash, ...value } = this.control.value;
        this.fetchSourcesService.sources$
            .pipe(
                first(),
                map(
                    (sources) =>
                        sources.find((s) => s.id === sourceCash.sourceId).currency_symbolic_code,
                ),
                switchMap((symbolicCode) =>
                    this.depositManagementService.Create(
                        {
                            ...value,
                            source_id: sourceCash.sourceId,
                            body: {
                                amount: sourceCash.amount,
                                currency: { symbolic_code: symbolicCode },
                            },
                        },
                        new Map(),
                    ),
                ),
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
