import isNil from 'lodash-es/isNil';

import { Option } from '../types';

import { findOptionByValue } from './find-option-by-value';

export function getHintText<T>(
    options: Option<T>[],
    selected: T[],
    hint?: string,
    opts: { multiple?: boolean; showLabel?: boolean } = {},
) {
    if (!isNil(hint)) {
        return hint;
    }
    if (opts.multiple && options?.length > 1) {
        return (selected?.length || 0) + '/' + options.length;
    }
    if (!selected?.length) {
        return '';
    }
    const option = findOptionByValue(options, selected[0]);
    return opts.showLabel ? option?.label : option?.description;
}
