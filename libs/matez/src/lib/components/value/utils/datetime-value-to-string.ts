import { formatDate } from '@angular/common';
import { LOCALE_ID, inject } from '@angular/core';

import { TypedValue } from '../types/base-type';

export type DatetimeValue = TypedValue<'datetime', Parameters<typeof formatDate>[0]>;

export function datetimeValueToString(value: DatetimeValue) {
    if (!value?.value) {
        return '';
    }
    const locale = inject(LOCALE_ID);
    return formatDate(value.value, 'dd.MM.yyyy HH:mm:ss', locale, '+0000');
}
