import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Injector, inject, runInInjectionContext } from '@angular/core';
import { Sort } from '@angular/material/sort';

import { compareDifferentTypes } from '../../../utils';
import { valueToString } from '../../value/utils/value-to-string';
import { NormColumn } from '../types';
import { ColumnData, DisplayedData, DisplayedDataItem } from '../utils/to-columns-data';

import { normalizeString } from './normalize-string';

export type FilterSearchData<T extends object, C extends object> = Map<
    DisplayedDataItem<T, C>,
    { byColumns: string[][]; byRow: string }
>;

export function columnsDataToFilterSearchData<T extends object, C extends object>(
    src$: Observable<Map<DisplayedDataItem<T, C>, ColumnData>>,
) {
    const injector = inject(Injector);
    return src$.pipe(
        map(
            (data) =>
                new Map(
                    Array.from(data.entries()).map(([item, value]) => [
                        item,
                        {
                            byColumns: value.map((el) => [
                                runInInjectionContext(injector, () =>
                                    normalizeString(valueToString(el?.value)),
                                ),
                                normalizeString(String(el?.value?.description ?? '')),
                            ]),
                            byRow: JSON.stringify(item),
                        },
                    ]),
                ),
        ),
    );
}

function getWeight(
    searchValue: string,
    search: string,
    lowerCaseSearch: string,
    unimportance: number = 0,
) {
    if (searchValue === search) {
        return 1000000 - unimportance;
    } else if (searchValue.includes(search)) {
        return 10000 - unimportance;
    } else if (searchValue.toLowerCase().includes(lowerCaseSearch)) {
        return 100 - unimportance;
    }
    return 0;
}

export function filterData<T extends object, C extends object>(
    data: FilterSearchData<T, C>,
    search: string,
) {
    const lowerCaseSearch = search.toLowerCase();
    return Array.from(data.entries())
        .map(([value, searchValuesCols]) => ({
            value,
            priority:
                searchValuesCols.byColumns.reduce(
                    (priority, searchValues) =>
                        searchValues.reduce(
                            (colPriority, searchValue, idx) =>
                                colPriority + getWeight(searchValue, search, lowerCaseSearch, idx),
                            priority,
                        ),
                    0,
                ) + getWeight(searchValuesCols.byRow, search, lowerCaseSearch, 1),
        }))
        .filter((v) => v.priority)
        .sort((a, b) => b.priority - a.priority)
        .map((v) => v.value);
}

export function sortData<T extends object, C extends object>(
    source: DisplayedData<T, C>,
    data: FilterSearchData<T, C>,
    columns: NormColumn<T, C>[],
    sort: Sort,
) {
    if (!sort?.active || !sort?.direction) {
        return source;
    }
    const colIdx = columns.findIndex((c) => c.field === sort.active);
    const sortedData = source
        .slice()
        .sort((a, b) =>
            compareDifferentTypes(
                (data.get(a)?.byColumns ?? [])[colIdx]?.[0],
                (data.get(b)?.byColumns ?? [])[colIdx]?.[0],
            ),
        );
    return sort.direction === 'desc' ? sortedData.reverse() : sortedData;
}
