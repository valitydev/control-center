import { FormControl } from '@angular/forms';

export function createControls<T extends object>(values: T): { [K in keyof T]: FormControl<T[K]> } {
    return Object.fromEntries(
        Object.entries(values).map(([k, v]) => [k, new FormControl(v, { nonNullable: true })]),
    ) as never;
}
