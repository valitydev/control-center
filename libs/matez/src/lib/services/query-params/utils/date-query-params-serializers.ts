import { DateRange } from '@angular/material/datepicker';

import { Serializer } from '../types/serializer';

export const DATE_QUERY_PARAMS_SERIALIZERS: Serializer[] = [
    {
        id: 'date',
        serialize: (date: Date) => date?.toISOString(),
        deserialize: (value) => new Date(value),
        recognize: (value) => value instanceof Date,
    },
    {
        id: 'dateRange',
        serialize: ({ start, end }: DateRange<Date>) =>
            `${start?.toISOString()}|${end?.toISOString()}`,
        deserialize: (value) => {
            const [start, end] = value.split('|').map((p) => (p ? new Date(p) : null));
            return { start, end };
        },
        recognize: (value) => {
            if (typeof value !== 'object') {
                return false;
            }
            const { start, end, ...other } = value as DateRange<Date>;
            if (Object.keys(other).length) {
                return false;
            }
            return start instanceof Date || end instanceof Date;
        },
    },
] as Serializer[];
