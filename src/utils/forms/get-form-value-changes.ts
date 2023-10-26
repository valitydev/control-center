import { AbstractControl, FormControlState } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

import { getValue } from './get-value';

/**
 * @deprecated
 */
export function getFormValueChanges<T>(
    form: AbstractControl<FormControlState<T> | T>,
    hasStart = false,
): Observable<T> {
    return form.valueChanges.pipe(
        ...((hasStart ? [startWith(form.value)] : []) as []),
        map(() => getValue(form)),
    ) as Observable<T>;
}
