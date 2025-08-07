import { AbstractControl } from '@angular/forms';

import { hasControls } from './has-controls';

export function getValue<T>(control: AbstractControl<T>): T {
    if (!hasControls(control)) {
        return control.value;
    }
    if (Array.isArray(control.controls)) {
        const result: unknown[] = [];
        for (const v of control.controls) {
            result.push(getValue(v) as T);
        }
        return result as T;
    }
    const result: Record<PropertyKey, unknown> = {};
    for (const [k, v] of Object.entries(control.controls)) {
        result[k as keyof T] = getValue(v);
    }
    return result as T;
}
