import { Component, Input, OnChanges } from '@angular/core';
import { ValueType, Field } from '@vality/thrift-ts';

import { ThriftAstMetadata } from '@cc/app/api/utils';

import { MetadataFormData } from '../metadata-form';
import { MetadataViewItem } from './utils/metadata-view';
import { MetadataViewExtension } from './utils/metadata-view-extension';

@Component({
    selector: 'cc-json-viewer',
    templateUrl: './json-viewer.component.html',
})
export class JsonViewerComponent implements OnChanges {
    @Input() value: unknown;
    @Input() level = 0;

    @Input() metadata: ThriftAstMetadata[];
    @Input() namespace: string;
    @Input() type: ValueType;
    @Input() field?: Field;
    @Input() parent?: MetadataFormData;

    @Input() data: MetadataFormData;
    @Input() extensions: MetadataViewExtension[];

    view: MetadataViewItem;
    className = this.getClassName();

    ngOnChanges() {
        if (this.metadata && this.namespace && this.type) {
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
        this.view = new MetadataViewItem(this.value, undefined, this.data, this.extensions);
        this.className = this.getClassName();
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
