import { AbstractControl } from '@angular/forms';
import { FormArray, FormGroup } from '@ngneat/reactive-forms';

export function hasControls<T>(control: AbstractControl): control is FormGroup<T> | FormArray<T> {
    return 'controls' in control;
}
