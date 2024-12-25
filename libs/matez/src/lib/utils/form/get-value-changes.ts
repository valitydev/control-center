import { AbstractControl, FormControlState } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

import { getValue } from './get-value';

export function getValueChanges<T>(form: AbstractControl<FormControlState<T> | T>): Observable<T> {
    return form.valueChanges.pipe(
        startWith(form.value),
        map(() => getValue(form)),
    ) as Observable<T>;
}
