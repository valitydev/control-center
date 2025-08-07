import { AbstractControl } from '@angular/forms';

export function setDisabled(
    control?: AbstractControl,
    disabled: boolean = true,
    options: Parameters<AbstractControl['disable']>[0] = {},
) {
    if (!control || control.disabled === disabled) {
        return;
    }
    if (disabled) {
        control.disable(options);
    } else {
        control.enable(options);
    }
}
