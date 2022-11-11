import { SetType, ListType, MapType } from '@vality/thrift-ts';
import isNil from 'lodash-es/isNil';
import isObject from 'lodash-es/isObject';
import { Observable, of, defer, switchMap, combineLatest } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';

import { getEntries } from '@cc/app/shared/components/json-viewer/utils/get-entries';

import { MetadataFormData } from '../../metadata-form';
import { getChildrenTypes } from './get-children-types';
import {
    MetadataViewExtension,
    getFirstDeterminedExtensionsResult,
} from './metadata-view-extension';

export class MetadataViewItem {
    extension$ = getFirstDeterminedExtensionsResult(this.extensions, this.data, this.value);
    key$ = this.extension$.pipe(
        map((ext) => (isNil(ext?.key) ? this.key : new MetadataViewItem(ext.key)))
    );
    value$ = this.extension$.pipe(map((ext) => ext?.value ?? this.value));
    data$ = this.extension$.pipe(map((ext) => (ext ? null : this.data)));

    items$: Observable<MetadataViewItem[]> = this.createItems();
    inline$: Observable<MetadataViewItem[]> = defer(() => this.items$).pipe(
        withLatestFrom(this.key$, this.data$),
        switchMap(([items, key, data]) =>
            combineLatest([of(items), of(key), key.value$, of(data)])
        ),
        switchMap(([items, key]) => {
            if (!items.length || items.length > 1 || key?.data) return of([]);
            const [item] = items;
            return combineLatest([
                item.items$,
                item.data$,
                item.key$.pipe(switchMap((key) => key.value$)),
                item.value$,
            ]).pipe(
                switchMap(([childItems, childData, childKey, childValue]) => {
                    if (typeof childKey === 'number' || childData?.objectType === 'union')
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

    isLeaf$ = this.current$.pipe(switchMap((c) => c.items$)).pipe(map((items) => !items.length));

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
                                      trueData.create({
                                          field: types.fields?.find((f) => f.name === key),
                                          type: types.valueType,
                                      }),
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
