import { Component, Input } from '@angular/core';
import { Field } from '@vality/thrift-ts';

import { parseNamespaceObjectType, ThriftAstMetadata } from '@cc/app/api/utils';

@Component({
    selector: 'cc-struct-field',
    templateUrl: './struct-field.component.html',
})
export class StructFieldComponent {
    @Input() metadata: ThriftAstMetadata[];
    @Input() namespace: string;
    @Input() type: string;
    @Input() field?: Field;

    get parsedNamespaceObjectType() {
        return parseNamespaceObjectType(this.metadata, this.namespace, this.type);
    }
    get fields() {
        return this.parsedNamespaceObjectType.namespaceMetadata.ast[
            this.parsedNamespaceObjectType.objectType as 'struct'
        ][this.type];
    }
}
