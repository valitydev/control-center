import { Component, Injector, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ValidationErrors, Validators } from '@angular/forms';
import { FormBuilder } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { provideValueAccessor } from '@s-libs/ng-core';
import { Field } from '@vality/thrift-ts';
import isEqual from 'lodash-es/isEqual';
import isNil from 'lodash-es/isNil';
import omitBy from 'lodash-es/omitBy';
import { merge, Observable } from 'rxjs';
import { delay, distinctUntilChanged, map, startWith } from 'rxjs/operators';

import { getErrorsTree, WrappedFormGroupSuperclass } from '@cc/utils';

import { MetadataFormData } from '../../types/metadata-form-data';

@UntilDestroy()
@Component({
    selector: 'cc-struct-form',
    templateUrl: './struct-form.component.html',
    providers: [provideValueAccessor(StructFormComponent)],
})
export class StructFormComponent<T extends { [N in string]: unknown }>
    extends WrappedFormGroupSuperclass<T>
    implements OnChanges, OnInit
{
    @Input() data: MetadataFormData<string, Field[]>;

    labelControl = this.fb.control(false);
    control = this.fb.group<T>({} as never);

    get hasLabel() {
        return (
            !!this.data.trueParent &&
            this.data.trueParent.objectType !== 'union' &&
            this.data.trueParent.typeGroup !== 'complex'
        );
    }

    constructor(injector: Injector, private fb: FormBuilder) {
        super(injector);
    }

    ngOnInit() {
        merge(this.control.valueChanges, this.labelControl.valueChanges)
            .pipe(delay(0), untilDestroyed(this))
            .subscribe(() => {
                this.emitOutgoingValue(
                    this.control.value && this.labelControl.value
                        ? (omitBy(this.control.value, isNil) as T)
                        : null
                );
            });
        return super.ngOnInit();
    }

    ngOnChanges(changes: SimpleChanges) {
        const newControlsNames = new Set(this.data.ast.map(({ name }) => name));
        Object.keys(this.control.controls).forEach((name) => {
            if (newControlsNames.has(name)) newControlsNames.delete(name);
            else this.control.removeControl(name as never);
        });
        newControlsNames.forEach((name) =>
            this.control.addControl(
                name as never,
                this.fb.control(null, {
                    validators:
                        this.data.ast.find((f) => f.name === name)?.option === 'required'
                            ? [Validators.required]
                            : [],
                }) as never
            )
        );
        this.setLabelControl();
        super.ngOnChanges(changes);
    }

    handleIncomingValue(value: T) {
        this.control.patchValue(value as never, { emitEvent: false });
        this.setLabelControl(!!(value && Object.keys(value).length));
    }

    protected setUpInnerToOuterErrors$(): Observable<ValidationErrors> {
        return merge(this.control.valueChanges, this.labelControl.valueChanges).pipe(
            startWith(null),
            map(() => (this.labelControl.value ? getErrorsTree(this.control) : null)),
            distinctUntilChanged(isEqual)
        );
    }

    private setLabelControl(value: boolean = false) {
        if (!this.hasLabel || this.data.isRequired) {
            if (!this.labelControl.value) this.labelControl.setValue(true);
            if (this.labelControl.enabled) this.labelControl.disable();
        } else {
            if (this.labelControl.value !== value) this.labelControl.setValue(value);
            if (this.labelControl.disabled) this.labelControl.enable();
        }
    }
}
