import { get } from 'lodash-es';
import isNil from 'lodash-es/isNil';
import startCase from 'lodash-es/startCase';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Async, PossiblyAsync, getPossiblyAsyncObservable } from '../../../utils';
import { Value } from '../../value';

export type Fn<R, P extends Array<unknown> = []> = (...args: P) => R;
export type PossiblyFn<R, P extends Array<unknown> = []> = Fn<R, P> | R;

export type CellFnArgs<T extends object> = [data: T, index: number];

interface ColumnParams {
    sticky?: 'start' | 'end';
    style?: Record<string, unknown>;
}

export type CellValue = 'string' | Value;

export interface Column<T extends object, C extends object = object> extends ColumnParams {
    field: string;

    header?: PossiblyAsync<Partial<Value> | string>;

    cell?: PossiblyFn<PossiblyAsync<CellValue>, CellFnArgs<T>>;
    lazyCell?: PossiblyFn<Async<CellValue>, CellFnArgs<T>>;
    child?: PossiblyFn<PossiblyAsync<CellValue>, CellFnArgs<C>>;

    hidden?: PossiblyAsync<boolean>;
    sort?: PossiblyAsync<boolean>;
}

export function normalizePossiblyFn<R, P extends Array<unknown>>(fn: PossiblyFn<R, P>): Fn<R, P> {
    return typeof fn === 'function' ? (fn as Fn<R, P>) : () => fn;
}

export function normalizeCell<T extends object, C extends object>(
    field: string,
    cell: Column<T, C>['cell'],
    hasChild: boolean = false,
): Fn<Observable<Value>, CellFnArgs<T>> {
    const cellFn = normalizePossiblyFn(cell);
    return (...args) =>
        getPossiblyAsyncObservable(cellFn(...args)).pipe(
            map((value) => {
                const defaultValue = hasChild ? { value: '' } : { value: get(args[0], field) };
                if (isNil(value)) {
                    return defaultValue;
                }
                return typeof value === 'object' ? { ...defaultValue, ...value } : { value };
            }),
        );
}

export class NormColumn<T extends object, C extends object = object> {
    field!: string;
    header!: Observable<Value>;
    cell?: Fn<Observable<Value>, CellFnArgs<T>>;
    lazyCell?: Fn<Observable<Value>, CellFnArgs<T>>;
    child?: Fn<Observable<Value>, CellFnArgs<C>>;
    hidden!: Observable<boolean>;
    sort!: Observable<boolean | null>;
    params!: ColumnParams;

    constructor(
        { field, header, cell, child, hidden, sort, lazyCell, ...params }: Column<T, C>,
        commonParams: ColumnParams = {},
    ) {
        this.field = field ?? (typeof header === 'string' ? header : String(Math.random()));
        const defaultHeaderValue = startCase((field || '').split('.').at(-1));
        this.header = getPossiblyAsyncObservable(header).pipe(
            map((value) =>
                typeof value === 'object'
                    ? ({ value: defaultHeaderValue, ...value } as Value)
                    : { value: value ?? defaultHeaderValue },
            ),
        );
        if (cell || !lazyCell) {
            this.cell = normalizeCell(this.field, cell, !!child);
        }
        if (lazyCell) {
            this.lazyCell = normalizeCell(this.field, lazyCell, !!child);
        }
        if (child) {
            this.child = normalizeCell(this.field, child);
        }
        this.params = {
            ...commonParams,
            ...params,
            style: Object.assign({}, commonParams?.style, params?.style),
        };
        this.hidden = isNil(hidden) ? of(false) : getPossiblyAsyncObservable(hidden);
        this.sort = isNil(sort) ? of(null) : getPossiblyAsyncObservable(sort);
    }
}
