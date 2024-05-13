import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ThriftAstMetadata } from '@vality/fistful-proto';
import { createControlProviders, getImportValue } from '@vality/ng-core';
import { isTypeWithAliases } from '@vality/ng-thrift';
import { of } from 'rxjs';
import short from 'short-uuid';

import { MetadataFormExtension } from '../metadata-form';
import { BaseThriftFormSuperclass } from '../thrift-api-crud/thrift-forms/utils/thrift-form-superclass';
import { ThriftEditorModule } from '../thrift-editor';

@Component({
    standalone: true,
    selector: 'cc-fistful-thrift-form',
    templateUrl: './fistful-thrift-form.component.html',
    providers: createControlProviders(() => FistfulThriftFormComponent),
    imports: [CommonModule, ReactiveFormsModule, ThriftEditorModule],
})
export class FistfulThriftFormComponent extends BaseThriftFormSuperclass {
    metadata$ = getImportValue<ThriftAstMetadata[]>(import('@vality/fistful-proto/metadata.json'));
    internalExtensions$ = of<MetadataFormExtension[]>([
        {
            determinant: (data) => of(isTypeWithAliases(data, 'SourceID', 'fistful')),
            extension: () => of({ generate: () => of(short().uuid()), isIdentifier: true }),
        },
    ]);
    defaultNamespace = 'fistful';
}
