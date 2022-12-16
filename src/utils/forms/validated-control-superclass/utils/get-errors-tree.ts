import { AbstractControl, ValidationErrors } from '@angular/forms';

import { hasControls } from '../../has-controls';

/**
 * FormGroup/FormArray don't return internal control errors,
 * so you need to get internal errors manually
 */
export function getErrorsTree(control: AbstractControl): ValidationErrors | null {
    if (control.valid) {
        return null;
    }
    const errors: ValidationErrors = Object.assign({}, control.errors);
    if (hasControls(control)) {
        if (Array.isArray(control.controls)) {
            errors.formArrayErrors = control.controls
                .map((c: AbstractControl) => getErrorsTree(c))
                .filter(Boolean);
        } else {
            errors.formGroupErrors = Object.fromEntries(
                Array.from(Object.entries(control.controls))
                    .map(([k, c]) => [k, getErrorsTree(c)])
                    .filter(([, v]) => !!v)
            ) as ValidationErrors;
        }
    }
    return errors;
}
