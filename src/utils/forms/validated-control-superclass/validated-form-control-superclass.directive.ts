import { Directive, OnInit } from '@angular/core';
import { ValidationErrors, Validator } from '@angular/forms';
import { WrappedFormControlSuperclass } from '@s-libs/ng-core';

@Directive()
export abstract class ValidatedFormControlSuperclass<OuterType, InnerType = OuterType>
    extends WrappedFormControlSuperclass<OuterType, InnerType>
    implements OnInit, Validator
{
    validate(): ValidationErrors | null {
        return this.control.errors;
    }
}
