import { Component, Input } from '@angular/core';
import { Field } from '@vality/thrift-ts';
import { ListType, MapType, SetType } from '@vality/thrift-ts/src/thrift-parser';

import { ThriftAstMetadata } from '@cc/app/api/utils';

@Component({
    selector: 'cc-complex-field',
    templateUrl: './complex-field.component.html',
})
export class ComplexFieldComponent {
    @Input() metadata: ThriftAstMetadata[];
    @Input() namespace: string;
    @Input() type: SetType | ListType | MapType;
    @Input() field?: Field;
}
