import { Component, Injector, OnChanges } from '@angular/core';
import { ValidationErrors, Validator } from '@angular/forms';
import { WrappedFormControlSuperclass } from '@s-libs/ng-core';
import { Predicate } from '@vality/domain-proto/lib/domain';
import { from } from 'rxjs';

import { DomainMetadataFormExtensionsService } from '@cc/app/shared/services';
import { createControlProviders } from '@cc/utils';

@Component({
    selector: 'cc-predicate',
    templateUrl: 'predicate.component.html',
    providers: createControlProviders(PredicateComponent),
})
export class PredicateComponent
    extends WrappedFormControlSuperclass<Predicate>
    implements Validator, OnChanges
{
    metadata$ = from(import('@vality/domain-proto/lib/metadata.json').then((m) => m.default));
    extensions$ = this.domainMetadataFormExtensionsService.metadataFormExtensions$;

    constructor(
        injector: Injector,
        private domainMetadataFormExtensionsService: DomainMetadataFormExtensionsService
    ) {
        super(injector);
    }

    validate(): ValidationErrors | null {
        return this.control.invalid ? this.control.errors || { controlsInvalid: true } : null;
    }
}
