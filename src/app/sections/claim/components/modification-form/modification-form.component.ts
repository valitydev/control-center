import { Component, Injector, Input, OnChanges } from '@angular/core';
import { ValidationErrors, Validator } from '@angular/forms';
import { WrappedFormControlSuperclass } from '@s-libs/ng-core';
import { Claim } from '@vality/domain-proto/lib/claim_management';
import { Party } from '@vality/domain-proto/lib/domain';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ComponentChanges, MetadataFormExtension } from '@cc/app/shared';
import { DomainMetadataFormExtensionsService } from '@cc/app/shared/services/domain-metadata-form-extensions';
import { createControlProviders } from '@cc/utils';

import { createPartyClaimMetadataFormExtensions } from './utils/create-party-claim-metadata-form-extensions';

@Component({
    selector: 'cc-modification-form',
    templateUrl: './modification-form.component.html',
    providers: createControlProviders(ModificationFormComponent),
})
export class ModificationFormComponent
    extends WrappedFormControlSuperclass<unknown>
    implements Validator, OnChanges
{
    @Input() party: Party;
    @Input() claim: Claim;
    @Input() type: string;

    metadata$ = from(import('@vality/domain-proto/lib/metadata.json').then((m) => m.default));
    extensions$: Observable<MetadataFormExtension[]>;

    constructor(
        injector: Injector,
        private domainMetadataFormExtensionsService: DomainMetadataFormExtensionsService
    ) {
        super(injector);
    }

    ngOnChanges(changes: ComponentChanges<ModificationFormComponent>) {
        super.ngOnChanges(changes);
        if (changes.party || changes.claim) {
            this.extensions$ = this.domainMetadataFormExtensionsService.extensions$.pipe(
                map((e) => [
                    ...createPartyClaimMetadataFormExtensions(this.party, this.claim),
                    ...e,
                ])
            );
        }
    }

    validate(): ValidationErrors | null {
        return this.control.errors;
    }
}
