import { Directive, Injector, OnInit } from '@angular/core';
import { ValidationErrors, Validator } from '@angular/forms';
import { WrappedControlSuperclass } from '@s-libs/ng-core';

import { getValue } from '../get-value';
import { getErrorsTree } from './utils/get-errors-tree';

@Directive()
/**
 * - validation of FormGroup/Array internal controls
 * - remember initial value as empty and set it when nothing comes (is this the best behaviour?)
 */
export abstract class ValidatedFormGroupSuperclass<OuterType, InnerType = OuterType>
    extends WrappedControlSuperclass<OuterType, InnerType>
    implements OnInit, Validator
{
    protected emptyValue: InnerType;

    constructor(private injector: Injector) {
        super(injector);
    }

    ngOnInit(): void {
        this.emptyValue = getValue(this.control) as InnerType;
        super.ngOnInit();
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
