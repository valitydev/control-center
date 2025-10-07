import { Directive } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';

import { hasControls } from '../has-controls';

import { FormGroupSuperclass } from './form-group-superclass.directive';

@Directive()
export abstract class FormArraySuperclass<
    OuterType extends any[],
    InnerType = OuterType,
> extends FormGroupSuperclass<OuterType, InnerType> {
    protected override outerToInnerValue(outer: OuterType): InnerType {
        if (hasControls(this.control)) {
            if (!outer) {
                return this.emptyValue;
            }
            if (outer?.length !== (this.control as FormArray).controls.length) {
                (this.control as FormArray).clear({ emitEvent: false });
                outer.forEach((v) => (this.control as FormArray).push(new FormControl(v)));
                return outer as never;
            }
        }
        return outer as never;
    }
}
