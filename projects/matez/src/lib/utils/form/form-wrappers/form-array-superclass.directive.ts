import { Directive } from '@angular/core';

import { FormGroupSuperclass } from './form-group-superclass.directive';

@Directive()
export abstract class FormArraySuperclass<
    OuterType,
    InnerType = OuterType,
> extends FormGroupSuperclass<OuterType, InnerType> {}
