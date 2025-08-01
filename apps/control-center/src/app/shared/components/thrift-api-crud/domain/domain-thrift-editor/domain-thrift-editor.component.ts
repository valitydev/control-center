import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { metadata$ } from '@vality/domain-proto';
import { Party } from '@vality/domain-proto/domain';
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
    party = input<Party>();

    metadata$ = metadata$;
    override internalExtensions$ = this.domainMetadataFormExtensionsService.extensions$;
    defaultNamespace = 'domain';
}
