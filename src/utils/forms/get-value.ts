import { AbstractControl } from '@angular/forms';

import { hasControls } from './has-controls';

export function getValue<T extends AbstractControl>(control: T): T['value'] {
    if (!hasControls(control)) {
        return control.value as never;
    }
    if (Array.isArray(control.controls)) {
        const result: T[] = [];
        for (const v of control.controls) {
            result.push(getValue(v) as T);
        }
        return result;
    }
    const result: Partial<T> = {};
    for (const [k, v] of Object.entries(control.controls)) {
        result[k] = getValue(v) as T;
    }
    return result;
}
