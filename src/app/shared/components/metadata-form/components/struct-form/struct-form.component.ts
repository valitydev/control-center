import { Component, Injector, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ValidationErrors, Validator, Validators } from '@angular/forms';
import { FormBuilder } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormComponentSuperclass } from '@s-libs/ng-core';
import { Field } from '@vality/thrift-ts';
import isNil from 'lodash-es/isNil';
import omitBy from 'lodash-es/omitBy';
import { merge } from 'rxjs';
import { delay } from 'rxjs/operators';

import { createControlProviders } from '@cc/utils';

import { MetadataFormData } from '../../types/metadata-form-data';

@UntilDestroy()
@Component({
    selector: 'cc-struct-form',
    templateUrl: './struct-form.component.html',
    providers: createControlProviders(StructFormComponent),
})
export class StructFormComponent
    extends FormComponentSuperclass<{ [N in string]: unknown }>
    implements OnChanges, Validator, OnInit
{
    @Input() data: MetadataFormData<string, Field[]>;

    control = this.fb.group<{ [N in string]: unknown }>({});
    labelControl = this.fb.control(false);

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
                        ? omitBy(this.control.value, isNil)
                        : null
                );
            });
    }

    ngOnChanges(changes: SimpleChanges) {
        const newControlsNames = new Set(this.data.ast.map(({ name }) => name));
        Object.keys(this.control.controls).forEach((name) => {
            if (newControlsNames.has(name)) newControlsNames.delete(name);
            else this.control.removeControl(name);
        });
        newControlsNames.forEach((name) =>
            this.control.addControl(
                name,
                this.fb.control(null, {
                    validators:
                        this.data.ast.find((f) => f.name === name)?.option === 'required'
                            ? [Validators.required]
                            : [],
                })
            )
        );
        this.setLabelControl();
        super.ngOnChanges(changes);
    }

    handleIncomingValue(value: { [N in string]: unknown }) {
        this.control.patchValue(value, { emitEvent: false });
        this.setLabelControl(!!(value && Object.keys(value).length));
    }

    validate(): ValidationErrors | null {
        return this.labelControl.value && this.control.invalid
            ? this.control.errors || { structInvalid: true }
            : null;
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
