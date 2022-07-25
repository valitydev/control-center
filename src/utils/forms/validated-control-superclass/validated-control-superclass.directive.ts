import { Directive, OnInit } from '@angular/core';
import { FormGroup, ValidationErrors, Validator } from '@angular/forms';
import { WrappedControlSuperclass } from '@s-libs/ng-core';
import { EMPTY, Observable } from 'rxjs';

import { getValue } from '../get-value';
import { getErrorsTree } from './utils/get-errors-tree';

@Directive()
export abstract class ValidatedControlSuperclass<OuterType, InnerType = OuterType>
    extends WrappedControlSuperclass<OuterType, InnerType>
    implements OnInit, Validator
{
    protected emptyValue: InnerType;

    ngOnInit() {
        this.emptyValue = getValue(this.control) as InnerType;
        super.ngOnInit();
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

    protected outerToInnerValue(outer: OuterType): InnerType {
        if ('controls' in this.control) {
            if (!outer) return this.emptyValue;
            if (
                Object.keys(outer).length < Object.keys((this.control as FormGroup).controls).length
            )
                return Object.assign({}, this.emptyValue, outer);
        }
        return outer as never;
    }
}
