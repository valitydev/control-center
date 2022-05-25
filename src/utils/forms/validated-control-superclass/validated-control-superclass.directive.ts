import { Directive, OnInit } from '@angular/core';
import { ValidationErrors, Validator } from '@angular/forms';
import { FormArray, FormControl, FormGroup } from '@ngneat/reactive-forms';
import { WrappedControlSuperclass } from '@s-libs/ng-core';

import { REQUIRED_SUPER, RequiredSuper } from '../../required-super';
import { getValue } from '../get-value';
import { getErrorsTree } from './utils/get-errors-tree';

@Directive()
export abstract class ValidatedControlSuperclass<OuterType, InnerType = OuterType>
    extends WrappedControlSuperclass<OuterType, InnerType>
    implements OnInit, Validator
{
    control: FormControl<InnerType> | FormArray<InnerType> | FormGroup<InnerType> =
        new FormControl<InnerType>();

    protected emptyValue: InnerType;

    ngOnInit(): RequiredSuper {
        this.emptyValue = getValue(this.control) as InnerType;
        super.ngOnInit();
        return REQUIRED_SUPER;
    }

    validate(): ValidationErrors | null {
        return getErrorsTree(this.control);
    }

    protected outerToInner(outer: OuterType): InnerType {
        if (!outer && 'controls' in this.control) {
            return this.emptyValue;
        }
        return outer as never;
    }
}
