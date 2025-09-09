import { map, of } from 'rxjs';
import short from 'short-uuid';

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { Reference } from '@vality/domain-proto/domain';
import { metadata$ } from '@vality/fistful-proto';
import { createControlProviders } from '@vality/matez';
import { ThriftEditorModule, ThriftFormExtension, isTypeWithAliases } from '@vality/ng-thrift';

import { DomainObjectsStoreService } from '~/api/domain-config';

import { getLimitedDomainObjectDetails } from '../thrift-api-crud';
import { BaseThriftFormSuperclass } from '../thrift-api-crud/thrift-forms/utils/thrift-form-superclass';

@Component({
    selector: 'cc-fistful-thrift-form',
    templateUrl: './fistful-thrift-form.component.html',
    providers: createControlProviders(() => FistfulThriftFormComponent),
    imports: [CommonModule, ReactiveFormsModule, ThriftEditorModule],
})
export class FistfulThriftFormComponent extends BaseThriftFormSuperclass {
    private domainStoreService = inject(DomainObjectsStoreService);

    metadata$ = metadata$;

    override internalExtensions$ = of<ThriftFormExtension[]>([
        {
            determinant: (data) => of(isTypeWithAliases(data, 'SourceID', 'fistful')),
            extension: () => of({ generate: () => of(short().uuid()), isIdentifier: true }),
        },
        {
            determinant: (data) =>
                of(
                    isTypeWithAliases(data, 'PartyID', 'webhooker') ||
                        isTypeWithAliases(data, 'WalletID', 'webhooker'),
                ),
            extension: (data) => {
                const refType: keyof Reference = isTypeWithAliases(data, 'PartyID', 'webhooker')
                    ? 'party_config'
                    : 'wallet_config';
                return this.domainStoreService.getLimitedObjects(refType).value$.pipe(
                    map((objects) => ({
                        options: objects.map((o) => ({
                            label: getLimitedDomainObjectDetails(o).label,
                            value: getLimitedDomainObjectDetails(o).id,
                        })),
                    })),
                );
            },
        },
    ]);
    defaultNamespace = 'fistful';
}
