import { Component, Input, OnChanges } from '@angular/core';
import isObject from 'lodash-es/isObject';

import { ComponentChanges } from '@cc/app/shared';
import { getInline } from '@cc/app/shared/components/json-viewer/utils/get-inline';

@Component({
    selector: 'cc-json-viewer',
    templateUrl: './json-viewer.component.html',
})
export class JsonViewerComponent implements OnChanges {
    @Input() json: unknown;
    @Input() level = 0;

    inline: any;
    objects: any;
    items: any;
    className = this.getClassName();

    ngOnChanges({ json, level }: ComponentChanges<JsonViewerComponent>) {
        if (json) {
            this.inline = getInline(this.json);
            this.objects = this.inline.filter(([, value]) => isObject(value));
            this.items = this.inline.filter(([, value]) => !isObject(value));
        }
        if (level) {
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

    isIndex(item) {
        return typeof item[0][0] === 'number';
    }

    getKey(item) {
        return item[0].join(' / ');
    }
}
