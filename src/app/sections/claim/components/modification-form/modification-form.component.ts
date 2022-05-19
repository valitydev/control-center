import { Component, Injector, Input, OnChanges } from '@angular/core';
import { ValidationErrors, Validator } from '@angular/forms';
import { WrappedFormControlSuperclass } from '@s-libs/ng-core';
import { Claim } from '@vality/domain-proto/lib/claim_management';
import { Party } from '@vality/domain-proto/lib/domain';
import { from } from 'rxjs';

import { ComponentChanges, MetadataFormExtension } from '@cc/app/shared';
import { DomainCacheService } from '@cc/app/thrift-services/damsel/domain-cache.service';
import { createValidatedAbstractControlProviders } from '@cc/utils';

import { createDomainObjectMetadataFormExtension } from './utils/create-domain-object-metadata-form.extension';
import { createMetadataFormExtensions } from './utils/create-metadata-form-extensions';

@Component({
    selector: 'cc-modification-form',
    templateUrl: './modification-form.component.html',
    providers: createValidatedAbstractControlProviders(ModificationFormComponent),
})
export class ModificationFormComponent
    extends WrappedFormControlSuperclass<unknown>
    implements Validator, OnChanges
{
    @Input() party: Party;
    @Input() claim: Claim;
    @Input() type: string;

    metadata$ = from(import('@vality/domain-proto/lib/metadata.json').then((m) => m.default));
    extensions: MetadataFormExtension[];

    constructor(injector: Injector, private domainCacheService: DomainCacheService) {
        super(injector);
    }

    ngOnChanges(changes: ComponentChanges<ModificationFormComponent>) {
        super.ngOnChanges(changes);
        if (changes.party || changes.claim) {
            this.extensions = [
                ...createMetadataFormExtensions(this.party, this.claim),
                ...this.createDomainMetadataFormExtensions(),
            ];
        }
    }

    validate(): ValidationErrors | null {
        return this.control.invalid ? { invalid: true } : null;
    }

    private createDomainMetadataFormExtensions(): MetadataFormExtension[] {
        return [
            ...createMetadataFormExtensions(this.party, this.claim),
            createDomainObjectMetadataFormExtension('ContractTemplateRef', () =>
                this.domainCacheService.getObjects('contract_template')
            ),
            createDomainObjectMetadataFormExtension('PaymentInstitutionRef', () =>
                this.domainCacheService.getObjects('payment_institution')
            ),
            createDomainObjectMetadataFormExtension('CategoryRef', () =>
                this.domainCacheService.getObjects('category')
            ),
        ];
    }
}
