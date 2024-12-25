import { subDays, startOfDay, endOfDay } from 'date-fns';

import { DateRange } from '../types/date-range';

export function createDateRangeToToday(minDays: number = 1): DateRange {
    return {
        /**
         * If we take the beginning of the previous day to the end of the current one,
         * then it is guaranteed that there will be an interval of one day,
         * as a maximum of two days
         */
        start: subDays(startOfDay(new Date()), minDays),
        end: endOfDay(new Date()),
    };
}
