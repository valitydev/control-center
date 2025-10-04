import { map, of, shareReplay } from 'rxjs';

import { CommonModule } from '@angular/common';
import { Component, TemplateRef, inject, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { metadata$ } from '@vality/domain-proto';
import { ShopAccount } from '@vality/domain-proto/domain';
import { createControlProviders } from '@vality/matez';
import {
    ThriftEditorModule,
    ThriftFormExtension,
    ThriftFormModule,
    isTypeWithAliases,
} from '@vality/ng-thrift';

import { AccountFieldComponent, CurrencyAccount } from '~/components/account-field';

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
    ],
})
export class DomainThriftFormComponent extends BaseThriftFormSuperclass {
    private domainMetadataFormExtensionsService = inject(DomainMetadataFormExtensionsService);

    private oneAccountFieldTemplate = viewChild<TemplateRef<unknown>>('oneAccountFieldTemplate');
    private twoAccountFieldTemplate = viewChild<TemplateRef<unknown>>('twoAccountFieldTemplate');

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
                            internalToOutput: ({
                                currency,
                                accounts,
                            }: Partial<CurrencyAccount> = {}) => ({
                                currency,
                                settlement: accounts?.[0],
                                guarantee: accounts?.[1],
                            }),
                            outputToInternal: ({
                                currency,
                                settlement,
                                guarantee,
                            }: Partial<ShopAccount> = {}) => ({
                                currency,
                                accounts: [settlement, guarantee].filter(Boolean),
                            }),
                        },
                    }),
            },
        ]),
        shareReplay({ bufferSize: 1, refCount: true }),
    );
    defaultNamespace = 'domain';
}
