import { Component, Injector, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ValidationErrors, Validator, Validators } from '@angular/forms';
import { FormBuilder, FormControl } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormComponentSuperclass } from '@s-libs/ng-core';
import { Field } from '@vality/thrift-ts';
import isNil from 'lodash-es/isNil';
import omitBy from 'lodash-es/omitBy';
import { merge } from 'rxjs';
import { delay } from 'rxjs/operators';

import { createValidatedAbstractControlProviders } from '@cc/utils';

import { MetadataFormData } from '../../types/metadata-form-data';

@UntilDestroy()
@Component({
    selector: 'cc-struct-form',
    templateUrl: './struct-form.component.html',
    providers: createValidatedAbstractControlProviders(StructFormComponent),
})
export class StructFormComponent
    extends FormComponentSuperclass<{ [N in string]: unknown }>
    implements OnChanges, Validator, OnInit
{
    @Input() data: MetadataFormData<string, Field[]>;

    control = this.fb.group<{ [N in string]: unknown }>({});
    labelControl = this.fb.control(false);

    constructor(injector: Injector, private fb: FormBuilder) {
        super(injector);
    }

    ngOnInit() {
        merge(this.control.valueChanges, this.labelControl.valueChanges)
            .pipe(delay(0), untilDestroyed(this))
            .subscribe(() => this.update());
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
                new FormControl(null, {
                    validators:
                        this.data.ast.find((f) => f.name === name)?.option === 'required'
                            ? [Validators.required]
                            : [],
                })
            )
        );

        if (this.data.field?.option === 'required') {
            this.labelControl.setValue(true);
            this.labelControl.disable();
        } else {
            this.labelControl.setValue(false);
            this.labelControl.enable();
        }

        super.ngOnChanges(changes);
    }

    handleIncomingValue(value: { [N in string]: unknown }) {
        this.control.patchValue(value, { emitEvent: false });
        if (value && Object.keys(value).length) {
            this.labelControl.setValue(true);
        }
    }

    validate(): ValidationErrors | null {
        return this.labelControl.value && this.control.invalid ? { invalid: true } : null;
    }

    private update(value = this.control.value) {
        return this.emitOutgoingValue(value && this.labelControl.value ? omitBy(value, isNil) : {});
    }
}
