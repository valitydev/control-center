import { isEmpty } from '@vality/ng-core';
import { SetType, ListType, MapType } from '@vality/thrift-ts';
import isNil from 'lodash-es/isNil';
import isObject from 'lodash-es/isObject';
import { Observable, of, switchMap, combineLatest, defer } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { MetadataFormData } from '../../metadata-form';
import { getChildrenTypes } from './get-children-types';
import { getEntries } from './get-entries';
import {
    MetadataViewExtension,
    getFirstDeterminedExtensionsResult,
} from './metadata-view-extension';

export class MetadataViewItem {
    extension$ = getFirstDeterminedExtensionsResult(this.extensions, this.data, this.value).pipe(
        shareReplay({ refCount: true, bufferSize: 1 })
    );

    key$ = this.extension$.pipe(
        map((ext) => (isNil(ext?.key) ? this.key : new MetadataViewItem(ext.key)))
    );
    value$ = this.extension$.pipe(
        map((ext) => {
            const value = ext?.value ?? this.value;
            return isEmpty(value) ? null : value;
        })
    );
    renderValue$ = combineLatest([this.value$, defer(() => this.data$)]).pipe(
        map(([value, data]) => {
            if (data?.objectType === 'union' && isEmpty(getEntries(value)?.[0]?.[1]))
                return getEntries(value)?.[0]?.[0];
            return value;
        })
    );

    data$ = this.extension$.pipe(map((ext) => (ext ? null : this.data)));

    items$: Observable<MetadataViewItem[]> = this.createItems().pipe(
        shareReplay({ refCount: true, bufferSize: 1 })
    );
    inline$: Observable<MetadataViewItem[]> = combineLatest([
        this.items$,
        this.key$,
        this.data$,
    ]).pipe(
        switchMap(([items, key, data]) => {
            if (!items.length || items.length > 1 || key?.data) return of([]);
            const [item] = items;
            return combineLatest([
                item.key$.pipe(switchMap((key) => key.value$)),
                item.value$,
            ]).pipe(
                switchMap(([childKey, childValue]) => {
                    if (
                        typeof childKey === 'number' ||
                        (data?.objectType === 'union' && isEmpty(childValue))
                    )
                        return of([]);
                    return item.inline$.pipe(map((childInline) => [item, ...childInline]));
                })
            );
        })
    );
    path$: Observable<MetadataViewItem[]> = this.inline$.pipe(
        map((inline) => {
            return [this, ...inline];
        })
    );
    current$ = this.path$.pipe(map((keys) => keys.at(-1)));

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
        })
    );

    leaves$ = this.items$.pipe(
        switchMap((items) =>
            combineLatest(
                items.map((item) => item.isLeaf$.pipe(map((isLeaf) => (isLeaf ? item : null))))
            )
        ),
        map((items) => items.filter(Boolean))
    );
    nodes$ = this.items$.pipe(
        switchMap((items) =>
            combineLatest(
                items.map((item) => item.isLeaf$.pipe(map((isLeaf) => (isLeaf ? null : item))))
            )
        ),
        map((items) => items.filter(Boolean))
    );

    isNumberKey$ = this.key$.pipe(map(({ value }) => typeof value === 'number'));

    constructor(
        private value: any,
        private key?: MetadataViewItem,
        private data?: MetadataFormData,
        private extensions?: MetadataViewExtension[]
    ) {}

    private createItems(): Observable<MetadataViewItem[]> {
        return combineLatest([this.data$, this.value$]).pipe(
            map(([data, value]) => {
                if (!data)
                    return isObject(value)
                        ? getEntries(value).map(
                              ([k, v]) => new MetadataViewItem(v, new MetadataViewItem(k))
                          )
                        : [];
                const trueData = this.data.trueTypeNode.data;
                if (
                    trueData.objectType === 'struct' ||
                    trueData.objectType === 'union' ||
                    (trueData as MetadataFormData<SetType | ListType | MapType>).type?.name
                ) {
                    const types = getChildrenTypes(trueData);
                    return getEntries(this.value).map(([key, value]) => {
                        return new MetadataViewItem(
                            value,
                            types.keyType
                                ? new MetadataViewItem(
                                      value,
                                      undefined,
                                      trueData.create({ type: types.keyType }),
                                      this.extensions
                                  )
                                : new MetadataViewItem(key),
                            trueData.create({
                                field: types.fields?.find((f) => f.name === key),
                                type: types.valueType,
                            }),
                            this.extensions
                        );
                    });
                }
                return [];
            })
        );
    }
}
