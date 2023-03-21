import { Component, Input, Output, EventEmitter } from '@angular/core';
import { coerceBoolean } from 'coerce-property';
import startCase from 'lodash-es/startCase';

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

function createLabel(value: unknown): string {
    return startCase(String(value));
}

export class Schema<T> {
    get renderedParams() {
        return this.params.map((p) => {
            if (typeof p === 'object')
                return {
                    def: p.label ?? String(p.value),
                    label: p.label ?? createLabel(p.value),
                    value: createGetValueFn(p.value),
                    description: p.description ? createGetValueFn(p.description) : null,
                    type: p?.type,
                };
            return {
                def: String(p),
                label: createLabel(p),
                value: createGetValueFn(p),
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
