import { isEqual } from 'lodash-es';
import { Observable, combineLatest, of, scan, switchMap, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { Overwrite } from 'utility-types';

import { Value } from '../../value';
import { TreeInlineData, TreeInlineDataItem } from '../tree-data';
import { CellFnArgs, Fn, NormColumn } from '../types';

export type DisplayedDataItem<T extends object, C extends object> = TreeInlineDataItem<T, C> | T;
export type DisplayedData<T extends object, C extends object> = TreeInlineData<T, C> | T[];

export type ColumnDataItem = {
    value: Value | null;
    lazyValue?: Observable<Value>;
    isChild?: boolean;
    isNextChild?: boolean;
};
export type ColumnData = ColumnDataItem[];

type ScanColumnDataItem = Overwrite<ColumnDataItem, { value: Observable<Value | null> }>;
type ScanColumnData<T extends object, C extends object> = Map<NormColumn<T, C>, ScanColumnDataItem>;
type ColumnDataMap<T extends object, C extends object> = Map<
    DisplayedDataItem<T, C>,
    ScanColumnData<T, C>
>;

function getValue<T extends object>(
    cellFn: Fn<Observable<Value>, CellFnArgs<T>> | undefined,
    ...[value, idx]: CellFnArgs<T>
) {
    return cellFn ? cellFn(value, idx).pipe(toScannedValue) : of(null);
}

function toScannedValue(src$: Observable<Value>) {
    return src$.pipe(
        shareReplay({
            bufferSize: 1,
            refCount: true,
        }),
    );
}

export function toObservableColumnsData<T extends object, C extends object>(
    src$: Observable<{ isTree: boolean; data: DisplayedData<T, C>; cols: NormColumn<T, C>[] }>,
): Observable<ColumnDataMap<T, C>> {
    return src$.pipe(
        scan(
            (acc, { isTree, data, cols }) => {
                const isColsNotChanged = acc.cols === cols;
                return {
                    res: new Map<TreeInlineDataItem<T, C> | T, ScanColumnData<T, C>>(
                        isTree
                            ? (data as TreeInlineData<T, C>).map((d, idx) => [
                                  d,
                                  isColsNotChanged &&
                                  d === acc.data[idx] &&
                                  // This is not the last value, because we need to calculate isNextChild
                                  idx !== acc.data.length - 1
                                      ? (acc.res.get(d) as ScanColumnData<T, C>)
                                      : new Map(
                                            cols.map((c) => [
                                                c,
                                                {
                                                    value:
                                                        d.child && c.child
                                                            ? getValue(c.child, d.child, idx)
                                                            : d.value
                                                              ? getValue(c.cell, d.value, idx)
                                                              : of({ value: '' }),
                                                    // TODO add support of lazyValue
                                                    isChild: !d.value,
                                                    isNextChild: !(data as TreeInlineData<T, C>)[
                                                        idx + 1
                                                    ]?.value,
                                                },
                                            ]),
                                        ),
                              ])
                            : (data as T[]).map((d, idx) => [
                                  d,
                                  isColsNotChanged && d === acc.data[idx]
                                      ? (acc.res.get(d) as ScanColumnData<T, C>)
                                      : new Map(
                                            cols.map((c) => [
                                                c,
                                                {
                                                    value: getValue(c.cell, d, idx),
                                                    lazyValue: c.lazyCell
                                                        ? c.lazyCell(d, idx).pipe(toScannedValue)
                                                        : undefined,
                                                },
                                            ]),
                                        ),
                              ]),
                    ),
                    data,
                    cols,
                };
            },
            { data: [], cols: [], res: new Map() } as {
                data: DisplayedData<T, C>;
                cols: NormColumn<T, C>[];
                res: ColumnDataMap<T, C>;
            },
        ),
        map(({ res }) => res),
    );
}

export function toColumnsData<T extends object, C extends object>(
    src$: Observable<ColumnDataMap<T, C>>,
): Observable<Map<DisplayedDataItem<T, C>, ColumnData>> {
    return src$.pipe(
        switchMap((columnsData) => {
            if (!columnsData.size) {
                return of(new Map());
            }
            return combineLatest(
                Array.from(columnsData.values()).map((v) =>
                    combineLatest(
                        Array.from(v.values()).map((cell) =>
                            timer(0).pipe(
                                switchMap(() => cell.value),
                                distinctUntilChanged(isEqual),
                            ),
                        ),
                    ).pipe(debounceTime(0)),
                ),
            ).pipe(
                debounceTime(0),
                map(
                    (res) =>
                        new Map(
                            Array.from(columnsData.entries()).map(([k, v], idx) => [
                                k,
                                Array.from(v.values()).map((cell, colIdx) => ({
                                    ...cell,
                                    value: res[idx][colIdx],
                                })),
                            ]),
                        ),
                ),
            );
        }),
    );
}
