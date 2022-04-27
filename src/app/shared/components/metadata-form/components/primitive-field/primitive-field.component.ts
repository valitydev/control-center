import { Component, Input } from '@angular/core';
import { Field } from '@vality/thrift-ts';
import { ThriftType } from '@vality/thrift-ts/src/thrift-parser';

import { ThriftAstMetadata } from '@cc/app/api/utils';

@Component({
    selector: 'cc-primitive-field',
    templateUrl: './primitive-field.component.html',
})
export class PrimitiveFieldComponent {
    @Input() metadata: ThriftAstMetadata[];
    @Input() namespace: string;
    @Input() type: ThriftType;
    @Input() field?: Field;
}
