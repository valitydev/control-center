import { map, of, shareReplay } from 'rxjs';

import { CommonModule } from '@angular/common';
import { Component, TemplateRef, inject, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { metadata$ } from '@vality/domain-proto';
import {
    CurrencyRef,
    ShopAccount,
    SystemAccount,
    WalletAccount,
} from '@vality/domain-proto/domain';
import { clean, createControlProviders } from '@vality/matez';
import {
    ThriftEditorModule,
    ThriftFormExtension,
    ThriftFormModule,
    isTypeWithAliases,
} from '@vality/ng-thrift';

import { AccountFieldComponent, CurrencyAccount } from '~/components/account-field';
import { SystemAccountsFieldComponent } from '~/components/system-accounts-field';

import { BaseThriftFormSuperclass } from '../../thrift-forms/utils/thrift-form-superclass';
import { DomainMetadataFormExtensionsService } from '../services/domain-metadata-form-extensions';

@Component({
    selector: 'cc-domain-thrift-editor',
    templateUrl: './domain-thrift-editor.component.html',
    providers: createControlProviders(() => DomainThriftFormComponent),
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ThriftFormModule,
        ThriftEditorModule,
        AccountFieldComponent,
        SystemAccountsFieldComponent,
    ],
})
export class DomainThriftFormComponent extends BaseThriftFormSuperclass {
    private domainMetadataFormExtensionsService = inject(DomainMetadataFormExtensionsService);

    private oneAccountFieldTemplate = viewChild<TemplateRef<unknown>>('oneAccountFieldTemplate');
    private twoAccountFieldTemplate = viewChild<TemplateRef<unknown>>('twoAccountFieldTemplate');
    private systemAccountsFieldTemplate = viewChild<TemplateRef<unknown>>(
        'systemAccountsFieldTemplate',
    );

    metadata$ = metadata$;
    override internalExtensions$ = this.domainMetadataFormExtensionsService.extensions$.pipe(
        map((extensions): ThriftFormExtension[] => [
            ...extensions,
            {
                determinant: (data) => of(isTypeWithAliases(data, 'ShopAccount', 'domain')),
                extension: () =>
                    of({
                        template: this.twoAccountFieldTemplate(),
                        converter: {
                            internalToOutput: (ca: Partial<CurrencyAccount>): ShopAccount => ({
                                currency: { symbolic_code: ca?.currency || '' },
                                settlement: ca?.accounts?.[0],
                                guarantee: ca?.accounts?.[1],
                            }),
                            outputToInternal: (ca: Partial<ShopAccount> = {}): CurrencyAccount => ({
                                currency: ca?.currency?.symbolic_code,
                                accounts: [ca?.settlement, ca?.guarantee].filter(Boolean),
                            }),
                        },
                    }),
            },
            {
                determinant: (data) => of(isTypeWithAliases(data, 'WalletAccount', 'domain')),
                extension: () =>
                    of({
                        template: this.oneAccountFieldTemplate(),
                        converter: {
                            internalToOutput: (
                                ca: Partial<CurrencyAccount> = {},
                            ): WalletAccount => ({
                                currency: { symbolic_code: ca?.currency || '' },
                                settlement: ca?.accounts?.[0],
                            }),
                            outputToInternal: (
                                ca: Partial<WalletAccount> = {},
                            ): CurrencyAccount => ({
                                currency: ca?.currency?.symbolic_code,
                                accounts: [ca?.settlement].filter(Boolean),
                            }),
                        },
                    }),
            },
            {
                determinant: (data) =>
                    of(
                        isTypeWithAliases(
                            data,
                            { name: 'map', keyType: 'CurrencyRef', valueType: 'SystemAccount' },
                            'domain',
                        ),
                    ),
                extension: () =>
                    of({
                        template: this.systemAccountsFieldTemplate(),
                        converter: {
                            internalToOutput: (
                                currencyAccounts: CurrencyAccount[],
                            ): Map<CurrencyRef, SystemAccount> =>
                                new Map(
                                    (currencyAccounts || []).map((ca) => [
                                        { symbolic_code: ca?.currency },
                                        clean({
                                            settlement: ca?.accounts?.[0],
                                            subagent: ca?.accounts?.[1],
                                        }),
                                    ]),
                                ),
                            outputToInternal: (
                                accounts: Map<CurrencyRef, SystemAccount>,
                            ): CurrencyAccount[] =>
                                Array.from(accounts?.entries?.() || []).map(
                                    ([currency, { settlement, subagent }]) => ({
                                        currency: currency.symbolic_code,
                                        accounts: [settlement, subagent].filter(Boolean),
                                    }),
                                ),
                        },
                    }),
            },
        ]),
        shareReplay({ bufferSize: 1, refCount: true }),
    );
    defaultNamespace = 'domain';
}
