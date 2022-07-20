import { Directive, OnInit } from '@angular/core';
import { ValidationErrors, Validator } from '@angular/forms';
import { FormControl } from '@ngneat/reactive-forms';
import { WrappedControlSuperclass } from '@s-libs/ng-core';
import { EMPTY, Observable } from 'rxjs';

import { REQUIRED_SUPER, RequiredSuper } from '../../required-super';
import { getValue } from '../get-value';
import { getErrorsTree } from './utils/get-errors-tree';

@Directive()
export abstract class ValidatedControlSuperclass<OuterType, InnerType = OuterType>
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
        return getErrorsTree(this.control);
    }

    protected setUpOuterToInnerErrors$(
        _outer$: Observable<ValidationErrors>
    ): Observable<ValidationErrors> {
        return EMPTY;
    }

    protected setUpInnerToOuterErrors$(
        _inner$: Observable<ValidationErrors>
    ): Observable<ValidationErrors> {
        return EMPTY;
    }

    protected outerToInner(outer: OuterType): InnerType {
        if (!outer && 'controls' in this.control) {
            return this.emptyValue;
        }
        return outer as never;
    }
}

@Directive()
export class ValidatedFormControlSuperclass<
    OuterType,
    InnerType = OuterType
> extends ValidatedControlSuperclass<OuterType, InnerType> {
    control = new FormControl<InnerType>();
}
