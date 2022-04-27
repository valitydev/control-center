import { Component, Input } from '@angular/core';
import { Field } from '@vality/thrift-ts';

import { parseNamespaceObjectType, ThriftAstMetadata } from '@cc/app/api/utils';

@Component({
    selector: 'cc-object-form',
    templateUrl: './object-form.component.html',
})
export class ObjectFormComponent {
    @Input() metadata: ThriftAstMetadata[];
    @Input() namespace: string;
    @Input() type: string;
    @Input() field?: Field;

    get parsedNamespaceObjectType() {
        return parseNamespaceObjectType(this.metadata, this.namespace, this.type);
    }

    get typedefType() {
        //TODO
        return (
            this.parsedNamespaceObjectType.namespaceMetadata.ast[
                this.parsedNamespaceObjectType.objectType
            ][this.type] as any
        ).type;
    }
}
