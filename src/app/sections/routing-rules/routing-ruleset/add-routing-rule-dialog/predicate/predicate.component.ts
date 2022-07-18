import { Component, Injector, OnChanges } from '@angular/core';
import { provideValueAccessor, WrappedFormControlSuperclass } from '@s-libs/ng-core';
import { Predicate } from '@vality/domain-proto/lib/domain';
import { from } from 'rxjs';

import { DomainMetadataFormExtensionsService } from '@cc/app/shared/services';

@Component({
    selector: 'cc-predicate',
    templateUrl: 'predicate.component.html',
    providers: [provideValueAccessor(PredicateComponent)],
})
export class PredicateComponent
    extends WrappedFormControlSuperclass<Predicate>
    implements OnChanges
{
    metadata$ = from(import('@vality/domain-proto/lib/metadata.json').then((m) => m.default));
    extensions$ = this.domainMetadataFormExtensionsService.extensions$;

    constructor(
        injector: Injector,
        private domainMetadataFormExtensionsService: DomainMetadataFormExtensionsService
    ) {
        super(injector);
    }
}
