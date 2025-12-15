import { BehaviorSubject, combineLatest, first, map, of, switchMap } from 'rxjs';

import { Component, DestroyRef, TemplateRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, Validators } from '@angular/forms';

import { Cash } from '@vality/domain-proto/domain';
import { DepositParams } from '@vality/fistful-proto/deposit';
import { DialogSuperclass, NotifyLogService, progressTo } from '@vality/matez';
import { ThriftFormExtension, isTypeWithAliases } from '@vality/ng-thrift';

import { DomainObjectsStoreService } from '~/api/domain-config';
import { ThriftDepositManagementService, ThriftRepositoryClientService } from '~/api/services';
import { SourceCash, SourceCashFieldComponent } from '~/components/source-cash-field';
import { getDomainObjectOption } from '~/components/thrift-api-crud/domain/services/domain-metadata-form-extensions/utils/get-domain-object-option';
import { UserInfoBasedIdGeneratorService } from '~/services';

import { FetchSourcesService } from '../../../sources';

@Component({
    templateUrl: 'create-deposit-dialog.component.html',
    standalone: false,
})
export class CreateDepositDialogComponent extends DialogSuperclass<CreateDepositDialogComponent> {
    private dr = inject(DestroyRef);
    private depositManagementService = inject(ThriftDepositManagementService);
    private log = inject(NotifyLogService);
    private userInfoBasedIdGeneratorService = inject(UserInfoBasedIdGeneratorService);
    private domainStoreService = inject(DomainObjectsStoreService);
    private fetchSourcesService = inject(FetchSourcesService);
    private thriftRepositoryClientService = inject(ThriftRepositoryClientService);
    private sourceCashTemplate =
        viewChild<TemplateRef<SourceCashFieldComponent>>('sourceCashTemplate');

    control = new FormControl(this.getDefaultValue(), [Validators.required]);
    progress$ = new BehaviorSubject(0);
    extensions: ThriftFormExtension[] = [
        {
            determinant: (data) =>
                of(
                    isTypeWithAliases(data, 'ContextSet', 'context') ||
                        isTypeWithAliases(data, 'DepositID', 'deposit') ||
                        isTypeWithAliases(data, 'SourceID', 'deposit') ||
                        isTypeWithAliases(data, 'PartyID', 'deposit'),
                ),
            extension: () => of({ hidden: true }),
        },
        {
            determinant: (data) => of(isTypeWithAliases(data, 'Cash', 'base')),
            extension: () =>
                of({
                    template: this.sourceCashTemplate(),
                    converter: {
                        outputToInternal: (outputValue: Cash): Partial<SourceCash> => ({
                            amount: outputValue?.amount,
                            currencySymbolicCode: outputValue?.currency?.symbolic_code,
                        }),
                        internalToOutput: (inputValue: SourceCash): Cash => ({
                            amount: inputValue?.amount,
                            currency: { symbolic_code: inputValue?.currencySymbolicCode },
                        }),
                    },
                }),
        },
        {
            determinant: (data) => of(isTypeWithAliases(data, 'WalletID', 'deposit')),
            extension: () =>
                this.domainStoreService.getLimitedObjects('wallet_config').value$.pipe(
                    map((objects) => ({
                        options: objects.map((obj) => getDomainObjectOption(obj)),
                        isIdentifier: true,
                    })),
                ),
        },
    ];

    create() {
        const value = this.control.value;
        combineLatest([
            this.fetchSourcesService.sources$.pipe(first()),
            this.thriftRepositoryClientService.CheckoutObject(
                { head: {} },
                { wallet_config: { id: value.wallet_id } },
            ),
        ])
            .pipe(
                map(
                    ([sources, wallet]): DepositParams => ({
                        ...value,
                        party_id: wallet.object.wallet_config.data.party_ref.id,
                        source_id: sources.find(
                            (s) => s.currency_symbolic_code === value.body.currency.symbolic_code,
                        )?.id,
                    }),
                ),
                switchMap((params) => this.depositManagementService.Create(params, new Map())),
                progressTo(this.progress$),
                takeUntilDestroyed(this.dr),
            )
            .subscribe({
                next: () => this.closeWithSuccess(),
                error: (err) => this.log.error(err),
            });
    }

    getDefaultValue() {
        return {
            id: this.userInfoBasedIdGeneratorService.getUsernameBasedId(),
            source_id: '___AUTO___',
            party_id: '___AUTO___',
        } as DepositParams;
    }
}
