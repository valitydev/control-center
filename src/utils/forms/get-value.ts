import { AbstractControl } from '@angular/forms';
import { ControlsValue } from '@ngneat/reactive-forms/lib/types';

import { hasControls } from './has-controls';

export function getValue<T extends AbstractControl>(control: T): T['value'] {
    if (!hasControls(control)) {
        return control.value as never;
    }
    if (Array.isArray(control.controls)) {
        const result: ControlsValue<T>[] = [];
        for (const v of control.controls) {
            result.push(getValue(v) as ControlsValue<T>);
        }
        return result;
    }
    const result: Partial<ControlsValue<T>> = {};
    for (const [k, v] of Object.entries(control.controls)) {
        result[k] = getValue(v as AbstractControl) as ControlsValue<T>;
    }
    return result;
}
