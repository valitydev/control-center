import { Component, OnChanges } from '@angular/core';
import { Predicate } from '@vality/domain-proto/domain';
import { from } from 'rxjs';

import { DomainMetadataFormExtensionsService } from '@cc/app/shared/services';
import { createControlProviders, ValidatedFormControlSuperclass } from '@cc/utils';

@Component({
    selector: 'cc-predicate',
    templateUrl: 'predicate.component.html',
    providers: createControlProviders(() => PredicateComponent),
})
export class PredicateComponent
    extends ValidatedFormControlSuperclass<Predicate>
    implements OnChanges
{
    metadata$ = from(import('@vality/domain-proto/metadata.json').then((m) => m.default));
    extensions$ = this.domainMetadataFormExtensionsService.extensions$;

    constructor(private domainMetadataFormExtensionsService: DomainMetadataFormExtensionsService) {
        super();
    }
}
