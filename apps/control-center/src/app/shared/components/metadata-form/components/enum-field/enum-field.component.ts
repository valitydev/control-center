import { Component, Input } from '@angular/core';
import { createControlProviders, FormControlSuperclass } from '@vality/matez';
import { ThriftData } from '@vality/ng-thrift';

@Component({
    selector: 'cc-enum-field',
    templateUrl: './enum-field.component.html',
    providers: createControlProviders(() => EnumFieldComponent),
})
export class EnumFieldComponent<T> extends FormControlSuperclass<T> {
    @Input() data: ThriftData<string, 'enum'>;
}
