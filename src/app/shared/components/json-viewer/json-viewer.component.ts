import { Component, Input, OnChanges } from '@angular/core';
import { ValueType, Field } from '@vality/thrift-ts';
import isObject from 'lodash-es/isObject';

import { ThriftAstMetadata } from '@cc/app/api/utils';
import { ComponentChanges } from '@cc/app/shared';
import { getInline, Inline } from '@cc/app/shared/components/json-viewer/utils/get-inline';
import { getKeyValues } from '@cc/app/shared/components/json-viewer/utils/get-key-values';
import { MetadataFormData } from '@cc/app/shared/components/metadata-form';

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

    inline: Inline[];
    objects: any;
    items: any;
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
            this.inline = getInline(this.json, this.data);
            this.objects = this.inline.filter((inline) => isObject(this.getValue(inline)));
            this.items = this.inline.filter((inline) => !this.objects.includes(inline));
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

    isIndex(item: Inline) {
        return typeof item.keys[0] === 'number';
    }

    getKey(item: Inline) {
        return item.keys.join(' / ');
    }

    getValue(item: Inline) {
        if (
            isObject(item.value) &&
            !getKeyValues(item.value).length &&
            item.data.trueTypeNode.data.objectType === 'union'
        )
            return getKeyValues(item.value)[0];
        return item.value;
    }
}
