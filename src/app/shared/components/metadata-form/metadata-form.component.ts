import { Component, Input, OnChanges } from '@angular/core';
import { Field, ValueType } from '@vality/thrift-ts';

import { ThriftAstMetadata } from '@cc/app/api/utils';

import { MetadataFormData } from './types/metadata-form-data';

@Component({
    selector: 'cc-metadata-form',
    templateUrl: './metadata-form.component.html',
})
export class MetadataFormComponent implements OnChanges {
    @Input() metadata: ThriftAstMetadata[];
    @Input() namespace: string;
    @Input() type: ValueType;
    @Input() field?: Field;
    @Input() parent?: MetadataFormData;

    data: MetadataFormData;

    ngOnChanges() {
        if (this.metadata && this.namespace && this.type) {
            this.data = new MetadataFormData(
                this.metadata,
                this.namespace,
                this.type,
                this.field,
                this.parent
            );
        }
    }
}
