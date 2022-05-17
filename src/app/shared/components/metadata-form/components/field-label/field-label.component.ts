import { Component, Input } from '@angular/core';
import { Field, ValueType } from '@vality/thrift-ts';

@Component({
    selector: 'cc-field-label',
    templateUrl: './field-label.component.html',
})
export class FieldLabelComponent {
    @Input() type: ValueType;
    @Input() field?: Field;
}
