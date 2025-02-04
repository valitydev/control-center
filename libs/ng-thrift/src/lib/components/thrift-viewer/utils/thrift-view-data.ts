import { isEmpty } from '@vality/matez';
import { Enum, JsonAST, ListType, MapType, SetType, ValueType } from '@vality/thrift-ts';
import isNil from 'lodash-es/isNil';
import isObject from 'lodash-es/isObject';
import { Observable, combineLatest, defer, of, switchMap } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, startWith } from 'rxjs/operators';

import { ThriftData } from '../../../models';

import { getChildrenTypes } from './get-children-types';
import { getEntries } from './get-entries';
import { getFirstDeterminedThriftViewExtensionResult } from './get-first-determined-thrift-view-extension-result';
import { ThriftViewExtension } from './thrift-view-extension';
import { ThriftViewExtensionResult } from './thrift-view-extension-result';

export class ThriftViewData {
    extension$: Observable<ThriftViewExtensionResult | null> = defer(() => this.renderValue$).pipe(
        switchMap((viewValue) =>
            getFirstDeterminedThriftViewExtensionResult(
                this.extensions,
                this.data as ThriftData,
                this.value,
                viewValue,
            ),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    data$: Observable<ThriftData | null | undefined> = this.extension$.pipe(
        startWith(null),
        map((ext) => (ext ? null : this.data)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    key$: Observable<ThriftViewData> = this.extension$.pipe(
        map((ext) =>
            isNil(ext?.key) ? (this.key as ThriftViewData) : new ThriftViewData(ext.key),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    value$ = this.extension$.pipe(
        startWith(null),
        map((ext) => this.getValue(ext)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    renderValue$ = combineLatest([this.value$, this.data$]).pipe(
        map(([value, data]) => this.getRenderValue(value, data)),
        distinctUntilChanged(),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    isEmpty$ = this.renderValue$.pipe(map((value) => isEmpty(value)));

    items$: Observable<ThriftViewData[]> = this.createItems().pipe(
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    inline$: Observable<ThriftViewData[]> = combineLatest([
        this.items$,
        this.key$,
        this.data$,
        this.key$.pipe(switchMap((key) => key?.value$ || of(null))),
    ]).pipe(
        switchMap(([items, key, data, keyValue]) => {
            if (
                !items.length ||
                items.length > 1 ||
                isObject(keyValue) ||
                key?.data ||
                (data?.trueTypeNode?.data as ThriftData<SetType | ListType | MapType>)?.type?.name
            ) {
                return of([]);
            }
            const [item] = items;
            return combineLatest([
                item.key$.pipe(switchMap((key) => key.value$)),
                item.value$,
            ]).pipe(
                switchMap(([childKey, childValue]) => {
                    if (
                        typeof childKey === 'number' ||
                        (data?.objectType === 'union' && isEmpty(childValue))
                    ) {
                        return of([]);
                    }
                    return item.data$.pipe(
                        switchMap((itemData) => {
                            if (data?.objectType === 'union' && itemData?.objectType !== 'union') {
                                return of([item]);
                            }
                            return item.inline$.pipe(map((childInline) => [item, ...childInline]));
                        }),
                    );
                }),
            );
        }),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    path$: Observable<ThriftViewData[]> = this.inline$.pipe(
        map((inline) => {
            return [this, ...inline];
        }),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    current$ = this.path$.pipe(map((keys) => keys.at(-1) as ThriftViewData));

    isLeaf$ = combineLatest([
        this.current$.pipe(switchMap((c) => c.items$)),
        this.data$,
        this.value$,
    ]).pipe(
        map(([items, data, value]) => {
            return (
                !items.length ||
                (data?.objectType === 'union' && isEmpty(getEntries(value)?.[0]?.[1]))
            );
        }),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    isValue$ = combineLatest([
        this.current$.pipe(switchMap((c) => c.items$)),
        this.data$,
        this.value$,
        this.current$.pipe(map((c) => c.key)),
    ]).pipe(
        map(([items, data, value, key]) => {
            return (
                (!items.length && !key) ||
                (data?.objectType === 'union' && isEmpty(getEntries(value)?.[0]?.[1]))
            );
        }),
    );

    leaves$: Observable<ThriftViewData[]> = this.items$.pipe(
        switchMap((items) =>
            combineLatest(
                items.map((item) => item.isLeaf$.pipe(map((isLeaf) => (isLeaf ? item : null)))),
            ),
        ),
        map((items) => items.filter(Boolean) as ThriftViewData[]),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    nodes$: Observable<ThriftViewData[]> = this.items$.pipe(
        switchMap((items) =>
            combineLatest(
                items.map((item) => item.isLeaf$.pipe(map((isLeaf) => (isLeaf ? null : item)))),
            ),
        ),
        map((items) => items.filter(Boolean) as ThriftViewData[]),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    isNumberKey$ = this.key$.pipe(map(({ value }) => typeof value === 'number'));

    constructor(
        private value: unknown,
        public key?: ThriftViewData,
        private data?: ThriftData | null,
        private extensions?: ThriftViewExtension[],
    ) {}

    private createItems(): Observable<ThriftViewData[]> {
        return combineLatest([this.data$, this.value$]).pipe(
            map(([data, value]) => {
                if (data) {
                    const trueData = this.data?.trueTypeNode.data as ThriftData<
                        ValueType,
                        keyof JsonAST
                    >;
                    if (
                        trueData.objectType === 'struct' ||
                        trueData.objectType === 'union' ||
                        (trueData as ThriftData<SetType | ListType | MapType>).type?.name
                    ) {
                        const types = getChildrenTypes(trueData);
                        return getEntries(value).map(([itemKey, itemValue]) => {
                            return new ThriftViewData(
                                itemValue,
                                types?.keyType
                                    ? new ThriftViewData(
                                          itemKey,
                                          undefined,
                                          trueData.create({ type: types.keyType }),
                                          this.extensions,
                                      )
                                    : new ThriftViewData(itemKey),
                                trueData.create({
                                    field: types?.fields?.find((f) => f.name === itemKey),
                                    type: types?.valueType,
                                }),
                                this.extensions,
                            );
                        });
                    }
                }
                return isObject(value)
                    ? getEntries(value).map(
                          ([k, v]) => new ThriftViewData(v, new ThriftViewData(k)),
                      )
                    : [];
            }),
        );
    }

    private getValue(ext: ThriftViewExtensionResult | null) {
        const value = ext?.value ?? this.value;
        return isEmpty(value) || ext?.hidden ? null : value;
    }

    private getRenderValue(value: unknown, data?: ThriftData | null) {
        if (data?.trueTypeNode?.data?.objectType === 'enum') {
            return (
                (
                    ((data.trueTypeNode.data as ThriftData<ValueType, 'enum'>).ast?.['items'] as
                        | Enum[]
                        | undefined) ?? []
                ).find((i, idx) => {
                    if ('value' in i) {
                        return i.value === value;
                    }
                    return idx === value;
                })?.name ?? value
            );
        }
        if (data?.objectType === 'union' && isEmpty(getEntries(value)?.[0]?.[1])) {
            return getEntries(value)?.[0]?.[0];
        }
        return value;
    }
}
