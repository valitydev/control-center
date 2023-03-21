import startCase from 'lodash-es/startCase';
import { Overwrite } from 'utility-types';

export type Path<T> = ((p: T) => string) | keyof T;

export interface BaseParam<T> {
    def: string;
    label: string;
    value: (p: T) => string;
    description?: (p: T) => string;
    type?: 'datetime';
}

export type Param<T> = Overwrite<
    Omit<BaseParam<T>, 'def'>,
    {
        label?: string;
        value: Path<T>;
        description?: Path<T>;
    }
>;

function createGetValueFn<T>(v: ((d: T) => string) | keyof T): (d: T) => string {
    if (typeof v === 'function') return v;
    return (d) => d[v as any];
}

function createLabel(value: unknown): string {
    return startCase(String(value));
}

export class Schema<T> {
    params: BaseParam<T>[];

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
