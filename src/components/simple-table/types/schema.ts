import startCase from 'lodash-es/startCase';
import { Observable, of, isObservable } from 'rxjs';

export type Path<T> = ((p: T) => string | Observable<string>) | keyof T;
export type SchemaFn<T> = (p: T) => Observable<string>;

export interface SchemaParam<T> {
    def: string;
    label: string;
    value: SchemaFn<T>;
    description?: SchemaFn<T>;
    type?: 'datetime';
}

export interface Param<T> {
    type?: 'datetime';
    label?: string;
    value: Path<T>;
    description?: Path<T>;
}

function createGetValueFn<T>(v: Path<T>): SchemaFn<T> {
    if (typeof v === 'function')
        return (...args) => {
            const res = v(...args);
            if (isObservable(res)) return res;
            return of(res);
        };
    return (d) => of(d[v as any]);
}

function createLabel(value: unknown): string {
    return startCase(String(value));
}

export class Schema<T> {
    params: SchemaParam<T>[];

    get list() {
        return this.params.map((p) => p.def);
    }

    constructor(params: (Param<T> | keyof T)[]) {
        this.params = params.map((p) => {
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
}
