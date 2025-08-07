import { AbstractControl } from '@angular/forms';
import omitBy from 'lodash-es/omitBy';
import { filter, map } from 'rxjs/operators';

import { isEmptyPrimitive } from '../empty/is-empty-primitive';

import { getValueChanges } from './get-value-changes';

export function getValidValueChanges(control: AbstractControl, predicate = isEmptyPrimitive) {
    return getValueChanges(control).pipe(
        filter(() => control.valid),
        map((value) => omitBy(value, predicate)),
    );
}
