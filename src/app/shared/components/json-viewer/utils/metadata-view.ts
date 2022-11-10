import { SetType, ListType, MapType } from '@vality/thrift-ts';
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

interface Inline {
    keys: MetadataViewItem[];
    item: MetadataViewItem;
}

export class MetadataViewItem {
    extension$ = getFirstDeterminedExtensionsResult(this.extensions, this.data, this.value);
    key$ = this.extension$.pipe(map((ext) => new MetadataViewItem(ext?.key) ?? this.key));
    value$ = this.extension$.pipe(map((ext) => ext?.value ?? this.value));
    data$ = this.extension$.pipe(map((ext) => (ext ? null : this.data)));

    items$: Observable<MetadataViewItem[]> = this.createItems();
    inline$: Observable<Inline> = defer(() => this.items$).pipe(
        withLatestFrom(this.key$),
        switchMap(([items, key]) => {
            if (!items.length || items.length > 1 || key?.data)
                return of({ keys: [this], item: this });
            const [item] = items;
            return item.inline$.pipe(
                map((childInline) => ({ ...childInline, keys: [this, ...childInline.keys] }))
            );
        })
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
