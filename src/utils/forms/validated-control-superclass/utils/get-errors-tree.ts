import { AbstractControl, ValidationErrors } from '@angular/forms';

import { hasControls } from '../../has-controls';

export function getErrorsTree(control: AbstractControl): ValidationErrors | null {
    if (control.valid) {
        return null;
    }
    const errors: ValidationErrors = Object.assign({}, control.errors);
    if (hasControls(control)) {
        if (Array.isArray(control.controls)) {
            errors.formArrayErrors = control.controls.map((c) => getErrorsTree(c));
        } else {
            errors.formGroupErrors = Object.fromEntries(
                Array.from(Object.entries(control.controls)).map(([k, c]) => [
                    k,
                    getErrorsTree(c as AbstractControl),
                ])
            );
        }
    }
    return errors;
}
