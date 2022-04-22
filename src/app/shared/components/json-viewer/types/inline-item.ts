import isEmpty from 'lodash-es/isEmpty';

import { Patch } from '../types/patch';

export class InlineItem {
    get key() {
        return this.patch.key ?? this.path.join(' / ');
    }

    get tooltip() {
        return this.isPatched ? JSON.stringify(this.value, null, 2) : undefined;
    }

    get isPatched() {
        return !!this.patch;
    }

    get isEmpty() {
        return isEmpty(this.value);
    }

    constructor(public path: string[], public value: unknown, private patch: Patch) {
        this.path = this.patch.path ?? this.path;
        this.value = this.patch.value ?? this.value;
    }
}
