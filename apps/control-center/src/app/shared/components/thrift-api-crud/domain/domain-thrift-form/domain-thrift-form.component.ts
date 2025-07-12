import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { metadata$ } from '@vality/domain-proto';
import { Party } from '@vality/domain-proto/domain';
import { createControlProviders } from '@vality/matez';
import { ThriftEditorModule, ThriftFormModule } from '@vality/ng-thrift';
import { combineLatest, filter } from 'rxjs';
import { map, shareReplay, startWith } from 'rxjs/operators';

import { DomainMetadataFormExtensionsService } from '../../../../services';
import { BaseThriftFormSuperclass } from '../../thrift-forms/utils/thrift-form-superclass';

@Component({
    selector: 'cc-domain-thrift-form',
    templateUrl: './domain-thrift-form.component.html',
    providers: createControlProviders(() => DomainThriftFormComponent),
    imports: [CommonModule, ReactiveFormsModule, ThriftFormModule, ThriftEditorModule],
})
export class DomainThriftFormComponent extends BaseThriftFormSuperclass {
    private domainMetadataFormExtensionsService = inject(DomainMetadataFormExtensionsService);
    party = input<Party>();

    metadata$ = metadata$;
    override internalExtensions$ = combineLatest([
        this.domainMetadataFormExtensionsService.extensions$,
        toObservable(this.party).pipe(
            filter(Boolean),
            map((party) => this.domainMetadataFormExtensionsService.createPartyExtensions(party)),
            startWith([]),
        ),
    ]).pipe(
        map((extGroups) => extGroups.flat()),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    defaultNamespace = 'domain';
}
