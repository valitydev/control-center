import { Patch } from '../types/patch';

export class InlineItem {
    get isIndex() {
        return (
            (this.patch?.key || this.path.length === 1) &&
            typeof (this.patch?.key ?? this.path[0]) === 'number'
        );
    }

    get key() {
        return this.patch?.key ?? (this.isIndex ? Number(this.path[0]) + 1 : this.path.join(' / '));
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

    constructor(
        public path: (string | number)[],
        public sourceValue: unknown,
        private patch?: Patch
    ) {
        this.path = this.patch?.path ?? this.path;
    }
}
