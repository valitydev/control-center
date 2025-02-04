import { Component, Input } from '@angular/core';
import { FormControlSuperclass, createControlProviders } from '@vality/matez';

import { ThriftData } from '../../../../../../models';

@Component({
    selector: 'v-enum-field',
    templateUrl: './enum-field.component.html',
    providers: createControlProviders(() => EnumFieldComponent),
    standalone: false,
})
export class EnumFieldComponent<T> extends FormControlSuperclass<T> {
    @Input() data!: ThriftData<string, 'enum'>;
}
