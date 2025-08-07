import { isEqual } from 'date-fns';

import { DateRange } from '../types/date-range';

export function isEqualDateRange(a: DateRange, b: DateRange) {
    if (!a || !b) {
        return a === b;
    }
    return isEqual(a.start, b.start) && isEqual(a.end, b.end);
}
