import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ThriftAstMetadata } from '@vality/fistful-proto';
import { createControlProviders, getImportValue } from '@vality/ng-core';

import { DomainMetadataFormExtensionsService } from '../../../services';
import { MetadataFormModule } from '../../metadata-form';
import { BaseThriftFormSuperclass } from '../utils/thrift-form-superclass';

@Component({
    standalone: true,
    selector: 'cc-domain-thrift-form',
    templateUrl: './domain-thrift-form.component.html',
    providers: createControlProviders(() => DomainThriftFormComponent),
    imports: [CommonModule, ReactiveFormsModule, MetadataFormModule],
})
export class DomainThriftFormComponent extends BaseThriftFormSuperclass {
    metadata$ = getImportValue<ThriftAstMetadata[]>(import('@vality/domain-proto/metadata.json'));
    internalExtensions$ = this.domainMetadataFormExtensionsService.extensions$;
    defaultNamespace = 'domain';

    constructor(private domainMetadataFormExtensionsService: DomainMetadataFormExtensionsService) {
        super();
    }
}