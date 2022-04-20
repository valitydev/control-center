import { Component, Input } from '@angular/core';
import isNil from 'lodash-es/isNil';
import isObject from 'lodash-es/isObject';

@Component({
    selector: 'cc-json-viewer',
    templateUrl: './json-viewer.component.html',
    styleUrls: ['./json-viewer.component.scss'],
})
export class JsonViewerComponent {
    @Input() json: any;
    @Input() nesting = 0;
    @Input() parentsCount = 0;

    get inline() {
        return Object.entries(this.json)
            .map(([k, v]) => this.getInline(k, v))
            .filter(([, v]) => !isNil(v))
            .sort(([a], [b]) => a.localeCompare(b));
    }

    get objects() {
        return this.inline
            .filter(([, v]) => isObject(v))
            .map(([k, v]) => ({
                key: k,
                value: v,
            }));
    }

    get items() {
        return this.inline
            .filter(([, v]) => !isObject(v))
            .map(([k, v]) => ({
                key: k,
                value: v,
            }));
    }

    get className() {
        switch (this.nesting) {
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

    private getInline(key: string, value: any) {
        if (isObject(value)) {
            const entries = Object.entries(value).filter(([, v]) => !isNil(v));
            if (entries.length === 1) {
                return this.getInline(key + ' / ' + entries[0][0], entries[0][1]);
            }
        }
        return [
            key
                .replaceAll('_', ' ')
                .split(' ')
                .map((v) => v.charAt(0).toUpperCase() + v.slice(1))
                .join(' '),
            value,
        ];
    }
}
