import { EventEmitter, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import {
    TreeInlineData,
    TreeData,
    TreeInlineDataItem,
    treeDataItemToInlineDataItem,
} from '../tree-data';

import { cachedHeadMap } from './cached-head-map';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class TableDataSource<T extends object, C extends object = never> extends MatTableDataSource<
    T | TreeInlineDataItem<T, C>,
    OnePageTableDataSourcePaginator & MatPaginator
> {
    isTreeData$ = new BehaviorSubject(false);
    sourceData$ = new BehaviorSubject<T[] | TreeData<T, C>>([]);
    data$: Observable<T[] | TreeInlineData<T, C>> = this.isTreeData$.pipe(
        switchMap((isTreeData) =>
            isTreeData
                ? (this.sourceData$ as Observable<TreeData<T, C>>).pipe(
                      cachedHeadMap(treeDataItemToInlineDataItem),
                      map((v) => v.flat()),
                  )
                : this.sourceData$,
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    override get paginator() {
        return this.__paginator as OnePageTableDataSourcePaginator & MatPaginator;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    private __paginator = new OnePageTableDataSourcePaginator();

    constructor() {
        super();
        this.data$.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((data) => {
            this.data = data;
        });
    }

    setData(data: T[]) {
        this.sourceData$.next(data);
        if (this.isTreeData$.value) {
            this.isTreeData$.next(false);
        }
    }

    setTreeData(data: TreeData<T, C>) {
        this.sourceData$.next(data);
        if (!this.isTreeData$.value) {
            this.isTreeData$.next(true);
        }
    }
}

class OnePageTableDataSourcePaginator implements Partial<MatPaginator> {
    pageIndex = 0;
    pageSize = 0;
    page = new EventEmitter<PageEvent>();
    initialized = new BehaviorSubject(undefined);

    get length() {
        return this.pageSize;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    set length(_length) {} 

    get displayedPages() {
        return this.pageSize / this.partSize;
    }

    private partSize!: number;

    constructor(partSize?: number) {
        this.setSize(partSize);
    }

    setSize(partSize = 25) {
        if (partSize !== this.partSize) {
            this.pageSize = this.partSize = partSize;
            this.reload();
        }
    }

    reload() {
        this.pageSize = this.partSize;
        this.update();
    }

    more() {
        this.pageSize += this.partSize;
        this.update();
    }

    private update() {
        this.page.next({
            pageIndex: this.pageIndex,
            pageSize: this.pageSize,
            length: this.length,
        });
    }
}
