import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ThriftAstMetadata } from '@vality/fistful-proto';
import { createControlProviders, getImportValue } from '@vality/matez';
import { ThriftEditorModule, ThriftFormModule } from '@vality/ng-thrift';

import { BaseThriftFormSuperclass } from '../../thrift-forms/utils/thrift-form-superclass';

@Component({
    selector: 'cc-magista-thrift-form',
    templateUrl: './magista-thrift-form.component.html',
    providers: createControlProviders(() => MagistaThriftFormComponent),
    imports: [CommonModule, ReactiveFormsModule, ThriftFormModule, ThriftEditorModule],
})
export class MagistaThriftFormComponent extends BaseThriftFormSuperclass {
    metadata$ = getImportValue<ThriftAstMetadata[]>(import('@vality/magista-proto/metadata.json'));
    defaultNamespace = 'magista';
}
