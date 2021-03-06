import { InjectionToken } from '@angular/core';
import { MatDateFormats } from '@angular/material/core';
import { DateRange } from '@angular/material/datepicker';
import { MatDialogConfig } from '@angular/material/dialog';
import { Moment } from 'moment';
import * as moment from 'moment';

import { Serializer } from '@cc/app/shared/services/query-params/types/serializer';

export const SEARCH_LIMIT = new InjectionToken<number>('searchLimit');
export const DEFAULT_SEARCH_LIMIT = 10;

export const SMALL_SEARCH_LIMIT = new InjectionToken<number>('smallSearchLimit');
export const DEFAULT_SMALL_SEARCH_LIMIT = 5;

export type DialogConfig = {
    small: MatDialogConfig;
    medium: MatDialogConfig;
    large: MatDialogConfig;
};
export const DIALOG_CONFIG = new InjectionToken<DialogConfig>('dialogConfig');
const BASE_CONFIG: MatDialogConfig = {
    maxHeight: '90vh',
    disableClose: true,
    autoFocus: false,
};
export const DEFAULT_DIALOG_CONFIG: DialogConfig = {
    small: { ...BASE_CONFIG, width: '360px' },
    medium: { ...BASE_CONFIG, width: '552px' },
    large: { ...BASE_CONFIG, width: '648px' },
};

export const DEFAULT_QUERY_PARAMS_SERIALIZERS: Serializer[] = [
    {
        id: 'moment',
        serialize: (date: Moment) => date.utc().format(),
        deserialize: (value) => moment(value),
        recognize: (value) => moment.isMoment(value),
    },
    {
        id: 'momentRange',
        serialize: ({ start, end }: DateRange<Moment>) =>
            `${start ? start.utc().format() : ''}|${end ? end.utc().format() : ''}`,
        deserialize: (value) => {
            const [start, end] = value.split('|').map((p) => (p ? moment(p) : null));
            return { start, end };
        },
        recognize: (value) => {
            if (typeof value !== 'object') return false;
            const { start, end, ...other } = value as DateRange<Moment>;
            if (Object.keys(other).length) return false;
            return (!start || moment.isMoment(start)) && (!end || moment.isMoment(end));
        },
    },
];

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
