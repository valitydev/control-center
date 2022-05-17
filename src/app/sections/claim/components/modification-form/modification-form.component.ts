import { Component, Input, OnChanges } from '@angular/core';
import { ValidationErrors, Validator } from '@angular/forms';
import { WrappedFormControlSuperclass } from '@s-libs/ng-core';
import { Claim } from '@vality/domain-proto/lib/claim_management';
import { Party } from '@vality/domain-proto/lib/domain';
import { from } from 'rxjs';

import { createMetadataFormExtensions } from '@cc/app/sections/claim/components/modification-form/utils/create-metadata-form-extensions';
import { ComponentChanges, MetadataFormExtension } from '@cc/app/shared';
import { createValidatedAbstractControlProviders } from '@cc/utils';

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

    ngOnChanges(changes: ComponentChanges<ModificationFormComponent>) {
        super.ngOnChanges(changes);
        if (changes.party || changes.claim) {
            this.extensions = createMetadataFormExtensions(this.party, this.claim);
        }
    }

    validate(): ValidationErrors | null {
        return this.control.invalid ? { invalid: true } : null;
    }
}
