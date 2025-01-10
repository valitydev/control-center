import { ChangeDetectorRef, DestroyRef, Directive, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, ValidationErrors, Validator } from '@angular/forms';
import { FormComponentSuperclass as BaseFormComponentSuperclass } from '@s-libs/ng-core';
import { concat, timer } from 'rxjs';

@Directive()
export abstract class FormComponentSuperclass<OuterType>
    extends BaseFormComponentSuperclass<OuterType>
    implements Validator, OnInit
{
    private _cdr = inject(ChangeDetectorRef);
    private _destroyRef = inject(DestroyRef);

    validate(_control: AbstractControl): ValidationErrors | null {
        return null;
    }

    ngOnInit() {
        concat(timer(0), timer(100))
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe(() => {
                this.onValidatorChange();
                this._cdr.markForCheck();
            });
    }

    registerOnValidatorChange(fn: () => void): void {
        this.onValidatorChange = fn;
    }

    private onValidatorChange: () => void = () => undefined;
}
