import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ThriftAstMetadata } from '@vality/fistful-proto';
import { createControlProviders, getImportValue } from '@vality/ng-core';

import { MetadataFormModule } from '../../../metadata-form';
import { ThriftEditorModule } from '../../../thrift-editor';
import { BaseThriftFormSuperclass } from '../../thrift-forms/utils/thrift-form-superclass';

@Component({
    standalone: true,
    selector: 'cc-magista-thrift-form',
    templateUrl: './magista-thrift-form.component.html',
    providers: createControlProviders(() => MagistaThriftFormComponent),
    imports: [CommonModule, ReactiveFormsModule, MetadataFormModule, ThriftEditorModule],
})
export class MagistaThriftFormComponent extends BaseThriftFormSuperclass {
    metadata$ = getImportValue<ThriftAstMetadata[]>(import('@vality/magista-proto/metadata.json'));
    defaultNamespace = 'magista';
}
