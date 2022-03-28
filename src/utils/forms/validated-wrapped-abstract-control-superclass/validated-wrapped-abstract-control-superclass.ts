import { Directive, OnInit } from '@angular/core';
import { ValidationErrors, Validator } from '@angular/forms';
import { WrappedControlSuperclass } from '@s-libs/ng-core';

import { RequiredSuper, REQUIRED_SUPER } from '../../required-super';
import { getValue } from '../get-value';

@Directive()
export abstract class ValidatedWrappedAbstractControlSuperclass<OuterType, InnerType = OuterType>
    extends WrappedControlSuperclass<OuterType, InnerType>
    implements OnInit, Validator
{
    protected emptyValue: InnerType;

    ngOnInit(): RequiredSuper {
        this.emptyValue = getValue(this.control) as InnerType;
        super.ngOnInit();
        return REQUIRED_SUPER;
    }

    validate(): ValidationErrors | null {
        return this.control.invalid ? { invalid: true } : null;
    }

    protected outerToInner(outer: OuterType): InnerType {
        if (typeof this.emptyValue === 'object') {
            if (!outer) return this.emptyValue;
            return { ...this.emptyValue, ...outer };
        }
        return outer as unknown as InnerType;
    }
}
