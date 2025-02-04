import { Component, Input, forwardRef } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControlSuperclass, createControlProviders } from '@vality/matez';

import { ThriftData } from '../../../../../../models';
import { ThriftFormComponent } from '../../thrift-form.component';
import { MetadataFormExtension } from '../../types/metadata-form-extension';
@Component({
    selector: 'v-typedef-form',
    templateUrl: './typedef-form.component.html',
    providers: createControlProviders(() => TypedefFormComponent),
    imports: [forwardRef(() => ThriftFormComponent), ReactiveFormsModule],
})
export class TypedefFormComponent<T> extends FormControlSuperclass<T> {
    @Input() data!: ThriftData<string, 'typedef'>;
    @Input() extensions?: MetadataFormExtension[];
}
