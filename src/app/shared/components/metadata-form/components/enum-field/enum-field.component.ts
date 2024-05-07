import { Component, Input } from '@angular/core';
import { createControlProviders, FormControlSuperclass } from '@vality/ng-core';

import { ThriftData } from '../../types/thrift-data';

@Component({
    selector: 'cc-enum-field',
    templateUrl: './enum-field.component.html',
    providers: createControlProviders(() => EnumFieldComponent),
})
export class EnumFieldComponent<T> extends FormControlSuperclass<T> {
    @Input() data: ThriftData<string, 'enum'>;
}
