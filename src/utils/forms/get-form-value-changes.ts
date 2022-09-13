import { FormControl } from '@angular/forms';
import { FormArray, FormGroup } from '@ngneat/reactive-forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

import { getValue } from './get-value';

export function getFormValueChanges<T>(
    form: FormControl<T> | FormArray<T> | FormGroup<T>,
    hasStart = false
): Observable<T> {
    return (form.valueChanges as Observable<T>).pipe(
        ...((hasStart ? [startWith(form.value)] : []) as []),
        map(() => getValue(form) as T)
    );
}
