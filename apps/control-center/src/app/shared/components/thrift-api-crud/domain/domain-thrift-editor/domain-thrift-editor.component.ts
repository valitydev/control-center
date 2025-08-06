import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { metadata$ } from '@vality/domain-proto';
import { createControlProviders } from '@vality/matez';
import { ThriftEditorModule, ThriftFormModule } from '@vality/ng-thrift';

import { DomainMetadataFormExtensionsService } from '../../../../services';
import { BaseThriftFormSuperclass } from '../../thrift-forms/utils/thrift-form-superclass';

@Component({
    selector: 'cc-domain-thrift-editor',
    templateUrl: './domain-thrift-editor.component.html',
    providers: createControlProviders(() => DomainThriftFormComponent),
    imports: [CommonModule, ReactiveFormsModule, ThriftFormModule, ThriftEditorModule],
})
export class DomainThriftFormComponent extends BaseThriftFormSuperclass {
    private domainMetadataFormExtensionsService = inject(DomainMetadataFormExtensionsService);

    metadata$ = metadata$;
    override internalExtensions$ = this.domainMetadataFormExtensionsService.extensions$;
    defaultNamespace = 'domain';
}
