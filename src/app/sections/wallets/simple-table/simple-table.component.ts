import { Component, Input, Output, EventEmitter } from '@angular/core';
import { coerceBoolean } from 'coerce-property';

export type Path<T> = ((p: T) => string) | keyof T;

export type Param<T> = {
    label?: string;
    value: Path<T>;
    description?: Path<T>;
    type?: 'datetime';
};

function createGetValueFn<T>(v: ((d: T) => string) | keyof T): (d: T) => string {
    if (typeof v === 'function') return v;
    return (d) => d[v as any];
}

export class Schema<T> {
    get renderedParams() {
        return this.params.map((p) => {
            let label: string;
            let value: (v: T) => string;
            let description: (v: T) => string;
            if (typeof p === 'object') {
                label = p.label ?? (typeof p.value === 'object' ? '' : String(p.value));
                value = createGetValueFn(p.value);
                description = p.description ? createGetValueFn(p.description) : null;
            } else {
                label = String(p);
                value = createGetValueFn(p);
            }
            return {
                label,
                value,
                description,
                def: label,
                type: (p as any)?.type,
            };
        });
    }

    get list() {
        return this.renderedParams.map((p) => p.def);
    }

    constructor(private params: (Param<T> | keyof T)[]) {}
}

@Component({
    selector: 'cc-simple-table',
    templateUrl: './simple-table.component.html',
    styleUrls: ['./simple-table.component.scss'],
})
export class SimpleTableComponent<T> {
    @Input() data: T[];
    @Input() schema: Schema<T>;

    @Input() @coerceBoolean hasMore = false;
    @Input() @coerceBoolean inProgress = false;

    @Output() fetchMore = new EventEmitter<void>();
}
