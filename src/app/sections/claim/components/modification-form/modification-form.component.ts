import { Component, Injector, Input, OnChanges } from '@angular/core';
import { ValidationErrors, Validator } from '@angular/forms';
import { WrappedFormControlSuperclass } from '@s-libs/ng-core';
import { Claim } from '@vality/domain-proto/lib/claim_management';
import { Party } from '@vality/domain-proto/lib/domain';
import { from } from 'rxjs';

import { ComponentChanges, MetadataFormExtension } from '@cc/app/shared';
import { createValidatedAbstractControlProviders } from '@cc/utils';

import { DomainStoreService } from '../../../../thrift-services/damsel/domain-store.service';
import { createDomainObjectMetadataFormExtension } from './utils/create-domain-object-metadata-form.extension';
import { createPartyClaimMetadataFormExtensions } from './utils/create-party-claim-metadata-form-extensions';

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

    constructor(injector: Injector, private domainStoreService: DomainStoreService) {
        super(injector);
    }

    ngOnChanges(changes: ComponentChanges<ModificationFormComponent>) {
        super.ngOnChanges(changes);
        if (changes.party || changes.claim) {
            this.extensions = [
                ...createPartyClaimMetadataFormExtensions(this.party, this.claim),
                ...this.createDomainMetadataFormExtensions(),
            ];
        }
    }

    validate(): ValidationErrors | null {
        return this.control.errors;
    }

    private createDomainMetadataFormExtensions(): MetadataFormExtension[] {
        return [
            createDomainObjectMetadataFormExtension('ContractTemplateRef', () =>
                this.domainStoreService.getObjects('contract_template')
            ),
            createDomainObjectMetadataFormExtension('PaymentInstitutionRef', () =>
                this.domainStoreService.getObjects('payment_institution')
            ),
            createDomainObjectMetadataFormExtension('CategoryRef', () =>
                this.domainStoreService.getObjects('category')
            ),
        ];
    }
}
