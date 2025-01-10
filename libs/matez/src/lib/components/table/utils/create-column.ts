import { Injector, inject, runInInjectionContext } from '@angular/core';
import { combineLatest, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';

import { PossiblyAsync, getPossiblyAsyncObservable } from '../../../utils';
import { Value } from '../../value';
import { CellFnArgs, Column, normalizeCell } from '../types';

import { createUniqueColumnDef } from './create-unique-column-def';

export function createColumn<P, A extends object>(
    createCell: (cellParams: P, ...args: CellFnArgs<A>) => PossiblyAsync<Value>,
    columnObject: Partial<Column<A>> = {},
) {
    return <T extends A>(
        getCellParams: (...args: CellFnArgs<T>) => PossiblyAsync<P>,
        { isLazyCell, ...column }: Partial<Column<T>> & { isLazyCell?: boolean } = {},
    ): Column<T> => {
        const injector = inject(Injector);
        const field = column?.field ?? createUniqueColumnDef(column?.header);
        const cellKey = isLazyCell ? 'lazyCell' : 'cell';
        return {
            field,
            ...columnObject,
            ...column,
            [cellKey]: (...cellArgs: CellFnArgs<T>) => {
                const cellValue$ = getPossiblyAsyncObservable(getCellParams(...cellArgs)).pipe(
                    switchMap((cellParams) =>
                        getPossiblyAsyncObservable(
                            runInInjectionContext(injector, () =>
                                createCell(cellParams, ...cellArgs),
                            ),
                        ),
                    ),
                );
                if (column[cellKey]) {
                    const columnCellValue$ = normalizeCell(
                        field,
                        column[cellKey],
                        !!column?.child,
                    )(...cellArgs);
                    return combineLatest([cellValue$, columnCellValue$]).pipe(
                        map(([a, b]) => Object.assign({}, a, b, { value: b?.value || a?.value })),
                    );
                }
                return cellValue$;
            },
        };
    };
}
