import { Component, Input, forwardRef } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControlSuperclass, createControlProviders } from '@vality/matez';

import { ThriftData } from '../../../../models';
import { ThriftFormExtension } from '../../types/thrift-form-extension';
import { ThriftFormComponent } from '../thrift-form/thrift-form.component';
@Component({
    selector: 'v-typedef-form',
    templateUrl: './typedef-form.component.html',
    providers: createControlProviders(() => TypedefFormComponent),
    imports: [forwardRef(() => ThriftFormComponent), ReactiveFormsModule],
})
export class TypedefFormComponent<T> extends FormControlSuperclass<T> {
    @Input() data!: ThriftData<string, 'typedef'>;
    @Input() extensions?: ThriftFormExtension[];
}
