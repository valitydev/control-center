import { Component, Input } from '@angular/core';
import isEmpty from 'lodash-es/isEmpty';
import isEqual from 'lodash-es/isEqual';
import isNil from 'lodash-es/isNil';
import isObject from 'lodash-es/isObject';

import { Item } from './types/item';
import { Patch } from './types/patch';

@Component({
    selector: 'cc-json-viewer',
    templateUrl: './json-viewer.component.html',
    styleUrls: ['./json-viewer.component.scss'],
})
export class JsonViewerComponent {
    @Input() json: unknown;
    @Input() path: string[] = [];

    @Input() patches: Patch[] = [];

    get inline(): Item[] {
        return Object.entries(this.json)
            .map(([k, v]) => this.getInline([k], v))
            .filter((v) => !isNil(v))
            .map(([path, value]): Item => {
                const patch = this.patches?.find((p) => isEqual(p.path, path));
                return {
                    isPatched: !!patch,
                    key: path.join(' / '),
                    path,
                    value,
                    tooltip: patch ? JSON.stringify(value, null, 2) : undefined,
                    ...(patch || {}),
                };
            })
            .sort(({ key: a }, { key: b }) => a.localeCompare(b));
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

    isEmpty(v) {
        return isEmpty(v);
    }

    trackByFn(idx: number, item: Item) {
        return item.path.join(';');
    }

    private getInline(path: string[], value: unknown): [string[], unknown] {
        if (isNil(value)) {
            return null;
        }
        if (isObject(value)) {
            const entries = Object.entries(value).filter(([, v]) => !isNil(v));
            if (entries.length === 1) {
                return this.getInline([...path, entries[0][0]], entries[0][1]);
            }
        }
        return [path, value];
    }
}
