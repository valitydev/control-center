import { Component, Input, OnChanges } from '@angular/core';
import { ValueType, Field } from '@vality/thrift-ts';

import { ThriftAstMetadata } from '@cc/app/api/utils';
import { ComponentChanges } from '@cc/app/shared';

import { MetadataFormData } from '../metadata-form';
import { View } from './utils/get-inline';

@Component({
    selector: 'cc-json-viewer',
    templateUrl: './json-viewer.component.html',
})
export class JsonViewerComponent implements OnChanges {
    @Input() json: unknown;
    @Input() level = 0;

    @Input() metadata: ThriftAstMetadata[];
    @Input() namespace: string;
    @Input() type: ValueType;
    @Input() field?: Field;
    @Input() parent?: MetadataFormData;

    @Input() data: MetadataFormData;

    view: View;
    className = this.getClassName();

    ngOnChanges({ data }: ComponentChanges<JsonViewerComponent>) {
        if (data || (this.metadata && this.namespace && this.type)) {
            if (!data) {
                try {
                    this.data = new MetadataFormData(
                        this.metadata,
                        this.namespace,
                        this.type,
                        this.field,
                        this.parent
                    );
                } catch (err) {
                    this.data = undefined;
                    console.warn(err);
                }
            }
            this.view = new View(this.json, this.data);
            this.className = this.getClassName();
        }
    }

    getClassName() {
        switch (this.level) {
            case 0:
                return 'cc-title';
            case 1:
                return 'cc-subheading-2';
            case 2:
                return 'cc-subheading-1';
            default:
                return 'cc-body-2';
        }
    }
}
