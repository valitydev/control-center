import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';

import { AbstractControlSuperclass } from './abstract-control-superclass';

/**
 * @deprecated Use FormControlValue
 */
@Directive()
export class FormControlSuperclass<
    OuterType,
    InnerType = OuterType,
> extends AbstractControlSuperclass<OuterType, InnerType> {
    control = new FormControl() as FormControl<InnerType>;
}
