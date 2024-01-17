import { Component, Input, OnChanges } from '@angular/core';
import { Validator } from '@angular/forms';
import { Claim } from '@vality/domain-proto/claim_management';
import { Party } from '@vality/domain-proto/domain';
import { ComponentChanges, createControlProviders, FormControlSuperclass } from '@vality/ng-core';
import { from, combineLatest, ReplaySubject, defer } from 'rxjs';
import { map } from 'rxjs/operators';

import { DomainMetadataFormExtensionsService } from '@cc/app/shared/services/domain-metadata-form-extensions';

import { createPartyClaimMetadataFormExtensions } from './utils/create-party-claim-metadata-form-extensions';

@Component({
    selector: 'cc-modification-form',
    templateUrl: './modification-form.component.html',
    providers: createControlProviders(() => ModificationFormComponent),
})
export class ModificationFormComponent
    extends FormControlSuperclass<unknown>
    implements Validator, OnChanges
{
    @Input() party: Party;
    @Input() claim: Claim;
    @Input() type: string;

    metadata$ = from(import('@vality/domain-proto/metadata.json').then((m) => m.default));
    extensions$ = combineLatest([
        defer(() => this.claimOrPartyChanged$).pipe(
            map(() => createPartyClaimMetadataFormExtensions(this.party, this.claim)),
        ),
        this.domainMetadataFormExtensionsService.extensions$,
    ]).pipe(map((extensionGroups) => extensionGroups.flat()));

    private claimOrPartyChanged$ = new ReplaySubject<void>(1);

    constructor(private domainMetadataFormExtensionsService: DomainMetadataFormExtensionsService) {
        super();
    }

    ngOnChanges(changes: ComponentChanges<ModificationFormComponent>) {
        super.ngOnChanges(changes);
        if (changes.party || changes.claim) {
            this.claimOrPartyChanged$.next();
        }
    }
}
