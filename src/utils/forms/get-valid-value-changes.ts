import { AbstractControl } from '@angular/forms';
import omitBy from 'lodash-es/omitBy';
import { filter, map } from 'rxjs/operators';

import { getFormValueChanges, isNilOrEmptyString } from '@cc/utils';

export function getValidValueChanges(control: AbstractControl, predicate = isNilOrEmptyString) {
    return getFormValueChanges(control, true).pipe(
        filter(() => control.valid),
        map((value) => omitBy(value, predicate))
    );
}
