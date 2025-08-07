import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

export function hasControls(control: AbstractControl): control is FormGroup | FormArray {
    return 'controls' in control;
}
