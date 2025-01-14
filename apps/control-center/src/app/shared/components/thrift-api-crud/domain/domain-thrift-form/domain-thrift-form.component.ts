import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { Claim } from '@vality/domain-proto/claim_management';
import { Party } from '@vality/domain-proto/domain';
import { ThriftAstMetadata } from '@vality/fistful-proto';
import { createControlProviders, getImportValue } from '@vality/matez';
import { combineLatest, filter } from 'rxjs';
import { map, shareReplay, startWith } from 'rxjs/operators';

import { DomainMetadataFormExtensionsService } from '../../../../services';
import { ThriftFormModule } from '../../../metadata-form';
import { ThriftEditorModule } from '../../../thrift-editor';
import { BaseThriftFormSuperclass } from '../../thrift-forms/utils/thrift-form-superclass';

@Component({
    selector: 'cc-domain-thrift-form',
    templateUrl: './domain-thrift-form.component.html',
    providers: createControlProviders(() => DomainThriftFormComponent),
    imports: [CommonModule, ReactiveFormsModule, ThriftFormModule, ThriftEditorModule],
})
export class DomainThriftFormComponent extends BaseThriftFormSuperclass {
    party = input<Party>();
    claim = input<Claim>();

    metadata$ = getImportValue<ThriftAstMetadata[]>(import('@vality/domain-proto/metadata.json'));
    override internalExtensions$ = combineLatest([
        this.domainMetadataFormExtensionsService.extensions$,
        combineLatest([toObservable(this.party), toObservable(this.claim)]).pipe(
            filter(([party, claim]) => !!party && !!claim),
            map(([party, claim]) =>
                this.domainMetadataFormExtensionsService.createPartyClaimExtensions(party, claim),
            ),
            startWith([]),
        ),
    ]).pipe(
        map((extGroups) => extGroups.flat()),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    defaultNamespace = 'domain';

    constructor(private domainMetadataFormExtensionsService: DomainMetadataFormExtensionsService) {
        super();
    }
}
