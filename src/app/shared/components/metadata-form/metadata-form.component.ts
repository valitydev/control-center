import { Component, Input, OnChanges } from '@angular/core';
import { Field, ValueType } from '@vality/thrift-ts';

import {
    isComplexType,
    isPrimitiveType,
    NamespaceType,
    parseNamespaceType,
    ThriftAstMetadata,
} from '@cc/app/api/utils';
import { ComponentChanges } from '@cc/app/shared';

@Component({
    selector: 'cc-metadata-form',
    templateUrl: './metadata-form.component.html',
})
export class MetadataFormComponent implements OnChanges {
    @Input() metadata: ThriftAstMetadata[];
    @Input() namespace: string;
    @Input() type: ValueType;
    @Input() field?: Field;

    namespaceType: NamespaceType;
    isComplexType: boolean = false;
    isPrimitiveType: boolean = false;

    ngOnChanges({ namespace, type }: ComponentChanges<MetadataFormComponent>) {
        if (namespace || type) {
            this.namespaceType = parseNamespaceType(this.type, this.namespace);
            this.isComplexType = isComplexType(this.namespaceType.type);
            this.isPrimitiveType = isPrimitiveType(this.namespaceType.type);
        }
    }
}
