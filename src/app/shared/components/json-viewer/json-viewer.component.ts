import { Component, Input } from '@angular/core';
import isEqual from 'lodash-es/isEqual';
import isObject from 'lodash-es/isObject';

import { InlineItem } from './types/inline-item';
import { Patch } from './types/patch';
import { getInline } from './utils/get-inline';

@Component({
    selector: 'cc-json-viewer',
    templateUrl: './json-viewer.component.html',
})
export class JsonViewerComponent {
    @Input() json: unknown;
    @Input() path: string[] = [];

    @Input() patches: Patch[] = [];

    get inline(): InlineItem[] {
        try {
            return Object.entries(this.json)
                .map(([k, v]) => getInline([k], v))
                .filter(Boolean)
                .map(
                    ([path, value]): InlineItem =>
                        new InlineItem(
                            path,
                            value,
                            this.patches?.find((p) => isEqual(p.path, path))
                        )
                )
                .sort(({ key: a }, { key: b }) => a.localeCompare(b));
        } catch (err) {
            return [];
        }
    }

    get objects() {
        return this.inline.filter(({ value }) => isObject(value));
    }

    get items() {
        return this.inline.filter(({ value }) => !isObject(value));
    }

    get className() {
        switch (this.path.length) {
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

    trackByFn(idx: number, item: InlineItem) {
        return item.path.join(';');
    }
}
