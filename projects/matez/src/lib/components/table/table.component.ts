import {
    BehaviorSubject,
    Observable,
    Subject,
    combineLatest,
    debounceTime,
    defer,
    first,
    forkJoin,
    merge,
    switchMap,
    take,
    tap,
} from 'rxjs';
import {
    delay,
    distinctUntilChanged,
    filter,
    map,
    share,
    shareReplay,
    startWith,
} from 'rxjs/operators';

import { CdkDragDrop } from '@angular/cdk/drag-drop';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    DestroyRef,
    ElementRef,
    Injector,
    OnInit,
    ViewChild,
    booleanAttribute,
    computed,
    inject,
    input,
    model,
    numberAttribute,
    output,
    runInInjectionContext,
    signal,
} from '@angular/core';
import { outputFromObservable, takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatSort, Sort } from '@angular/material/sort';
import { MatRow, MatTable } from '@angular/material/table';

import { ArrayAttributeTransform, arrayAttribute, createCsv, downloadFile } from '../../utils';

import { TableInputsComponent } from './components/table-inputs.component';
import {
    COLUMN_DEFS,
    DEBOUNCE_TIME_MS,
    DEFAULT_LOADED_LAZY_ROWS_COUNT,
    DEFAULT_SORT,
} from './consts';
import { TreeData } from './tree-data';
import { Column, DragDrop, NormColumn, UpdateOptions } from './types';
import { columnsDataToFilterSearchData, filterData, sortData } from './utils/filter-sort';
import { TableDataSource } from './utils/table-data-source';
import { tableToCsvObject } from './utils/table-to-csv-object';
import {
    DisplayedData,
    DisplayedDataItem,
    toColumnsData,
    toObservableColumnsData,
} from './utils/to-columns-data';

@Component({
    selector: 'v-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
})
export class TableComponent<T extends object, C extends object> implements OnInit {
    private dr = inject(DestroyRef);
    private injector = inject(Injector);
    private cdr = inject(ChangeDetectorRef);
    data = input<T[], ArrayAttributeTransform<T>>([], { transform: arrayAttribute });
    treeData = input<TreeData<T, C>>();
    columns = input<Column<T, C>[], ArrayAttributeTransform<Column<T, C>>>([], {
        transform: arrayAttribute,
    });
    progress = input(false, { transform: Boolean });
    hasMore = input(false, { transform: booleanAttribute });
    size = input(25, { transform: numberAttribute });
    maxSize = input(1000, { transform: numberAttribute });
    noDownload = input(false, { transform: booleanAttribute });
    noToolbar = input(false, { transform: booleanAttribute });

    // Filter
    filter = model('');
    filter$ = toObservable(this.filter).pipe(
        map((v) => (v || '').trim()),
        distinctUntilChanged(),
        debounceTime(DEBOUNCE_TIME_MS),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    standaloneFilter = input(false, { transform: booleanAttribute });
    externalFilter = input(false, { transform: booleanAttribute });
    filteredSortData$ = new BehaviorSubject<DisplayedData<T, C> | null>(null);
    displayedData$ = combineLatest([
        defer(() => this.dataSource.data$),
        this.filteredSortData$.pipe(distinctUntilChanged()),
        defer(() => this.columnsDataProgress$),
    ]).pipe(
        map(
            ([data, filteredSortData, columnsDataProgress]) =>
                (filteredSortData && !columnsDataProgress ? filteredSortData : data) || [],
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    displayedCount$ = this.displayedData$.pipe(
        map((data) => data.length),
        distinctUntilChanged(),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    // Select
    rowSelectable = input(false, { transform: booleanAttribute });
    rowSelected = model<DisplayedData<T, C>>([]);

    // Sort
    sort = model<Sort>(DEFAULT_SORT);
    @ViewChild(MatSort) sortComponent!: MatSort;

    // Drag & drop
    rowDragDrop = input(false, {
        transform: (v: boolean | string[]) => {
            if (Array.isArray(v)) {
                return v;
            }
            return booleanAttribute(v);
        },
    });
    rowDropped = output<DragDrop<DisplayedDataItem<T, C>>>();
    dragDisabled = true;

    update$ = new Subject<UpdateOptions>();
    update = outputFromObservable(this.update$);
    more = output<UpdateOptions>();

    loadedLazyItems = new WeakMap<DisplayedDataItem<T, C>, boolean>();

    dataSource = new TableDataSource<T, C>();
    normColumns = computed<NormColumn<T, C>[]>(() => this.columns().map((c) => new NormColumn(c)));
    displayedNormColumns$ = toObservable(this.normColumns).pipe(
        switchMap((cols) =>
            combineLatest(cols.map((c) => c.hidden)).pipe(
                map((c) => cols.filter((_, idx) => !c[idx])),
            ),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    columnsData$$ = combineLatest({
        isTree: this.dataSource.isTreeData$,
        data: this.dataSource.data$,
        cols: toObservable(this.normColumns),
    }).pipe(toObservableColumnsData, shareReplay({ refCount: true, bufferSize: 1 }));
    columnsDataProgress$ = new BehaviorSubject(false);
    columnsData$ = this.columnsData$$.pipe(
        tap(() => {
            this.columnsDataProgress$.next(true);
        }),
        toColumnsData,
        tap(() => {
            this.columnsDataProgress$.next(false);
        }),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    isPreload = signal(false);
    loadSize = computed(() => (this.isPreload() ? this.maxSize() : this.size()));
    hasAutoShowMore$ = combineLatest([
        toObservable(this.hasMore),
        this.dataSource.data$.pipe(map((d) => d?.length)),
        this.displayedCount$,
        this.dataSource.paginator.page.pipe(
            startWith(null),
            map(() => this.dataSource.paginator.pageSize),
        ),
    ]).pipe(
        map(
            ([hasMore, dataCount, displayedDataCount, size]) =>
                (hasMore && displayedDataCount !== 0 && displayedDataCount >= dataCount) ||
                displayedDataCount > size,
        ),
        distinctUntilChanged(),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    displayedColumns$ = combineLatest([
        this.displayedNormColumns$,
        toObservable(this.rowSelectable),
        toObservable(this.sort),
        toObservable(this.rowDragDrop),
    ]).pipe(
        map(([normColumns, rowSelectable, sort, rowDragDrop]) => [
            ...((
                Array.isArray(rowDragDrop)
                    ? sort?.direction && rowDragDrop.includes(sort?.active)
                    : rowDragDrop
            )
                ? [this.columnDefs.drag]
                : []),
            ...(rowSelectable ? [this.columnDefs.select] : []),
            ...normColumns.map((c) => c.field),
        ]),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    columnDefs = COLUMN_DEFS;

    @ViewChild('scrollViewport', { read: ElementRef }) scrollViewport!: ElementRef;
    @ViewChild('matTable', { static: false }) table!: MatTable<T>;
    @ContentChild(TableInputsComponent, { read: ElementRef }) tableInputsContent!: ElementRef;
    @ViewChild(MatRow, { static: false }) tableRow!: ElementRef;

    ngOnInit() {
        const sort$ = toObservable(this.sort, { injector: this.injector }).pipe(
            distinctUntilChanged(),
            share(),
        );

        toObservable(this.data, { injector: this.injector })
            .pipe(filter(Boolean), takeUntilDestroyed(this.dr))
            .subscribe((data) => {
                this.dataSource.setData(data);
            });
        toObservable(this.treeData, { injector: this.injector })
            .pipe(filter(Boolean), takeUntilDestroyed(this.dr))
            .subscribe((data) => {
                this.dataSource.setTreeData(data);
            });
        combineLatest([
            this.filter$,
            sort$,
            this.dataSource.data$,
            runInInjectionContext(this.injector, () =>
                this.columnsData$.pipe(columnsDataToFilterSearchData),
            ),
            this.dataSource.isTreeData$,
            toObservable(this.normColumns, { injector: this.injector }),
            toObservable(this.externalFilter, { injector: this.injector }),
        ])
            .pipe(
                map(([search, sort, source, data, isTreeData, columns, isExternalFilter]) => {
                    if (isTreeData) {
                        return source;
                    }
                    const filteredData: DisplayedData<T, C> =
                        !isExternalFilter && search ? filterData(data, search) : source;
                    return sortData(filteredData, data, columns, sort);
                }),
                takeUntilDestroyed(this.dr),
            )
            .subscribe((filtered) => {
                this.updateSortFilter(filtered);
                this.updateLoadedLazyItems(filtered);
                this.cdr.markForCheck();
            });
        merge(
            this.filter$.pipe(filter(Boolean)),
            toObservable(this.hasMore, { injector: this.injector }).pipe(filter(Boolean)),
        )
            .pipe(takeUntilDestroyed(this.dr))
            .subscribe(() => {
                this.sort.set(DEFAULT_SORT);
            });
        merge(this.filter$, sort$)
            .pipe(takeUntilDestroyed(this.dr))
            .subscribe(() => {
                this.reset();
            });
        // TODO: 2, 3 column is torn away from the previous one, fixed by calling update
        this.dataSource.data$
            .pipe(
                filter((v) => !!v?.length),
                first(),
                delay(100),
                takeUntilDestroyed(this.dr),
            )
            .subscribe(() => {
                this.table.updateStickyColumnStyles();
            });
    }

    load() {
        if (this.isPreload()) {
            this.isPreload.set(false);
        }
        this.reload();
    }

    preload() {
        if (!this.isPreload()) {
            this.isPreload.set(true);
            this.reload();
        } else if (this.hasMore()) {
            this.more.emit({ size: this.loadSize() });
        }
    }

    showMore() {
        this.dataSource.paginator.more();
        if (this.hasMore() && this.dataSource.paginator.pageSize > this.dataSource.data.length) {
            this.more.emit({ size: this.loadSize() });
        }
        this.refreshTable();
    }

    downloadCsv() {
        this.generateCsvData()
            .pipe(takeUntilDestroyed(this.dr))
            .subscribe((csvData) => {
                downloadFile(csvData, 'csv');
            });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    drop(event: CdkDragDrop<any>) {
        this.dragDisabled = true;
        this.filteredSortData$.pipe(filter(Boolean), first()).subscribe((data) => {
            const item = event.item.data;
            const { previousIndex, currentIndex } = event;
            const previousData = data;
            const currentData = previousData.slice();
            let currentDataIndex = 0;
            if (previousIndex > currentIndex) {
                currentData.splice(previousIndex, 1);
                currentData.splice(currentIndex, 0, event.item.data);
                currentDataIndex = currentIndex;
            } else {
                currentData.splice(currentIndex, 0, event.item.data);
                currentData.splice(previousIndex, 1);
                currentDataIndex = currentIndex - 1;
            }
            this.rowDropped.emit({
                previousIndex,
                currentIndex,
                item,
                previousData,
                currentData,
                currentDataIndex,
                sort: this?.sortComponent,
            });
        });
    }

    private generateCsvData(): Observable<string> {
        return combineLatest([
            this.displayedNormColumns$.pipe(
                switchMap((cols) => forkJoin(cols.map((c) => c.header.pipe(take(1))))),
            ),
            this.columnsData$.pipe(take(1)),
        ]).pipe(
            map(([cols, data]) =>
                createCsv(runInInjectionContext(this.injector, () => tableToCsvObject(cols, data))),
            ),
        );
    }

    private reload() {
        this.update$.next({ size: this.loadSize() });
        this.reset();
    }

    private updateSortFilter(filtered: DisplayedData<T, C>) {
        this.filteredSortData$.next(filtered);
        this.dataSource.sortData = () => filtered;
        this.dataSource.sort = this.sortComponent;
    }

    private reset() {
        (this.scrollViewport?.nativeElement as HTMLElement)?.scrollTo?.({ top: 0 });
        this.dataSource.paginator.reload();
        this.refreshTable();
    }

    // TODO: Refresh table when pagination is updated
    private refreshTable() {
        // eslint-disable-next-line no-self-assign
        this.dataSource.data = this.dataSource.data;
    }

    private updateLoadedLazyItems(items: DisplayedData<T, C>) {
        const lazyLoadedItems = items.slice(0, DEFAULT_LOADED_LAZY_ROWS_COUNT);
        for (const item of lazyLoadedItems) {
            this.loadedLazyItems.set(item, true);
        }
    }
}
