import { Directive, OnInit } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { WrappedControlSuperclass } from '@s-libs/ng-core';
import isEqual from 'lodash-es/isEqual';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { REQUIRED_SUPER, RequiredSuper } from '../../required-super';
import { getValue } from '../get-value';
import { getErrorsTree } from './utils/get-errors-tree';

@Directive()
export abstract class WrappedFormGroupSuperclass<OuterType, InnerType = OuterType>
    extends WrappedControlSuperclass<OuterType, InnerType>
    implements OnInit
{
    protected emptyValue: InnerType;

    ngOnInit(): RequiredSuper {
        this.emptyValue = getValue(this.control) as InnerType;
        super.ngOnInit();
        return REQUIRED_SUPER;
    }

    protected setUpInnerToOuterErrors$(): Observable<ValidationErrors> {
        return this.control.valueChanges.pipe(
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
