import isEmpty from 'lodash-es/isEmpty';
import isNil from 'lodash-es/isNil';
import isObject from 'lodash-es/isObject';

import { Patch } from '../types/patch';

export class InlineItem {
    get key() {
        return this.patch?.key ?? this.path.join(' / ');
    }

    get value() {
        return this.patch?.value ?? this.sourceValue;
    }

    get tooltip() {
        return this.isPatched ? JSON.stringify(this.sourceValue, null, 2) : undefined;
    }

    get isPatched() {
        return !!this.patch;
    }

    get isEmpty() {
        return isObject(this.sourceValue) ? isEmpty(this.sourceValue) : isNil(this.sourceValue);
    }

    constructor(public path: string[], public sourceValue: unknown, private patch?: Patch) {
        this.path = this.patch?.path ?? this.path;
    }
}
