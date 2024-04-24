import { InjectionToken } from '@angular/core';
import { MatDateFormats } from '@angular/material/core';
import { DATE_QUERY_PARAMS_SERIALIZERS, Serializer } from '@vality/ng-core';

export const DEFAULT_QUERY_PARAMS_SERIALIZERS: Serializer[] = DATE_QUERY_PARAMS_SERIALIZERS;

export const DEFAULT_MAT_DATE_FORMATS: MatDateFormats = {
    parse: {
        dateInput: ['l', 'LL'],
    },
    display: {
        dateInput: 'DD.MM.YYYY',
        monthYearLabel: 'DD.MM.YYYY',
        dateA11yLabel: 'DD.MM.YYYY',
        monthYearA11yLabel: 'DD.MM.YYYY',
    },
};

export const DATE_RANGE_DAYS = new InjectionToken<number>('DATE_RANGE_DAYS');
export const DEFAULT_DATE_RANGE_DAYS: number = 30;

export const DEBOUNCE_TIME_MS = new InjectionToken<number>('DEBOUNCE_TIME_MS');
export const DEFAULT_DEBOUNCE_TIME_MS: number = 300;
