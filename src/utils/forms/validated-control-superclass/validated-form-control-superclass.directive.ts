import { Directive } from '@angular/core';
import { FormControl } from '@ngneat/reactive-forms';

import { ValidatedControlSuperclass } from './validated-control-superclass.directive';

@Directive()
export class ValidatedFormControlSuperclass<
    OuterType,
    InnerType = OuterType
> extends ValidatedControlSuperclass<OuterType, InnerType> {
    control = new FormControl<InnerType>();
}
