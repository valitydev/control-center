import { Directive } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { FormControl } from '@ngneat/reactive-forms';
import { WrappedControlSuperclass } from '@s-libs/ng-core';
import { EMPTY, Observable } from 'rxjs';

@Directive()
export class ValidatedFormControlSuperclass<
    OuterType,
    InnerType = OuterType
> extends WrappedControlSuperclass<OuterType, InnerType> {
    // TODO: Validation sometimes doesn't work (is not forwarded higher by nesting) with Angular FormControl
    control = new FormControl<InnerType>();

    validate(): ValidationErrors | null {
        return this.control.errors;
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
}
