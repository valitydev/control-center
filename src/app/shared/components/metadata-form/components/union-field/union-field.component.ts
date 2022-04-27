import { Component, Input } from '@angular/core';
import { Field } from '@vality/thrift-ts';

import { parseNamespaceObjectType, ThriftAstMetadata } from '@cc/app/api/utils';

@Component({
    selector: 'cc-union-field',
    templateUrl: './union-field.component.html',
})
export class UnionFieldComponent {
    @Input() metadata: ThriftAstMetadata[];
    @Input() namespace: string;
    @Input() type: string;
    @Input() field?: Field;

    selected: any;

    get parsedNamespaceObjectType() {
        return parseNamespaceObjectType(this.metadata, this.namespace, this.type);
    }
    get fields() {
        return this.parsedNamespaceObjectType.namespaceMetadata.ast[
            this.parsedNamespaceObjectType.objectType as 'union'
        ][this.type];
    }
}
