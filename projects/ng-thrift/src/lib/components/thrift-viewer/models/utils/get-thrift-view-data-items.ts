import { isObject } from 'lodash-es';

import type { ThriftAst, ValueType } from '@vality/tsthrift';

import { ThriftData } from '../../../../models';
import { getThriftEntries, isComplexType } from '../../../../utils';
import { ThriftViewExtension } from '../../utils/thrift-view-extension';
import { ThriftViewData } from '../thrift-view-data';

import { getChildrenTypes } from './get-children-types';

export function getThriftViewDataItems(
    data: ThriftData<ValueType, keyof ThriftAst> | null | undefined,
    value: unknown,
    extensions?: ThriftViewExtension[],
): ThriftViewData[] {
    if (data) {
        const trueData = data?.trueTypeNode.data as ThriftData<ValueType, keyof ThriftAst>;
        if (
            trueData.objectType === 'struct' ||
            trueData.objectType === 'union' ||
            isComplexType(trueData.type)
        ) {
            const types = getChildrenTypes(trueData);
            return getThriftEntries(value).map(([itemKey, itemValue]) => {
                return new ThriftViewData(
                    itemValue,
                    types?.keyType
                        ? new ThriftViewData(
                              itemKey,
                              undefined,
                              trueData.create({ type: types.keyType }),
                              extensions,
                          )
                        : new ThriftViewData(itemKey),
                    trueData.create({
                        field: types?.fields?.find((f) => f.name === itemKey),
                        type: types?.valueType,
                    }),
                    extensions,
                );
            });
        }
    }
    return isObject(value)
        ? getThriftEntries(value).map(([k, v]) => new ThriftViewData(v, new ThriftViewData(k)))
        : [];
}
