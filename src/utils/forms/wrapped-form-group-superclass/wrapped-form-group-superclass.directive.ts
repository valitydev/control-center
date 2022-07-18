import { Directive, OnInit } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { WrappedControlSuperclass } from '@s-libs/ng-core';
import isEqual from 'lodash-es/isEqual';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';

import { getValue } from '../get-value';
import { getErrorsTree } from './utils/get-errors-tree';

@Directive()
/**
 * - validation of FormGroup/Array internal controls
 * - remember initial value as empty and set it when nothing comes (is this the best behaviour?)
 */
export abstract class WrappedFormGroupSuperclass<OuterType, InnerType = OuterType>
    extends WrappedControlSuperclass<OuterType, InnerType>
    implements OnInit
{
    protected emptyValue: InnerType;

    ngOnInit(): void {
        this.emptyValue = getValue(this.control) as InnerType;
        super.ngOnInit();
    }

    protected setUpInnerToOuterErrors$(): Observable<ValidationErrors> {
        return this.control.valueChanges.pipe(
            startWith(null),
            map(() => getErrorsTree(this.control)),
            distinctUntilChanged(isEqual)
        );
    }

    protected outerToInner(outer: OuterType): InnerType {
        if (!outer && 'controls' in this.control) {
            return this.emptyValue;
        }
        return outer as never;
    }
}
