import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { metadata$ } from '@vality/fistful-proto';
import { createControlProviders } from '@vality/matez';
import { ThriftEditorModule, ThriftFormExtension, isTypeWithAliases } from '@vality/ng-thrift';
import { of } from 'rxjs';
import short from 'short-uuid';

import { BaseThriftFormSuperclass } from '../thrift-api-crud/thrift-forms/utils/thrift-form-superclass';

@Component({
    selector: 'cc-fistful-thrift-form',
    templateUrl: './fistful-thrift-form.component.html',
    providers: createControlProviders(() => FistfulThriftFormComponent),
    imports: [CommonModule, ReactiveFormsModule, ThriftEditorModule],
})
export class FistfulThriftFormComponent extends BaseThriftFormSuperclass {
    metadata$ = metadata$;
    override internalExtensions$ = of<ThriftFormExtension[]>([
        {
            determinant: (data) => of(isTypeWithAliases(data, 'SourceID', 'fistful')),
            extension: () => of({ generate: () => of(short().uuid()), isIdentifier: true }),
        },
    ]);
    defaultNamespace = 'fistful';
}
