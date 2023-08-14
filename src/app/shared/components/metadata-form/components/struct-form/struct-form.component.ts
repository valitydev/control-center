import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ValidationErrors, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import isNil from 'lodash-es/isNil';
import omitBy from 'lodash-es/omitBy';
import { merge } from 'rxjs';
import { delay } from 'rxjs/operators';

import { createControlProviders, ValidatedControlSuperclass } from '@cc/utils';

import { MetadataFormData } from '../../types/metadata-form-data';
import { MetadataFormExtension } from '../../types/metadata-form-extension';

@UntilDestroy()
@Component({
    selector: 'cc-struct-form',
    templateUrl: './struct-form.component.html',
    providers: createControlProviders(() => StructFormComponent),
})
export class StructFormComponent<T extends { [N in string]: unknown }>
    extends ValidatedControlSuperclass<T>
    implements OnChanges, OnInit
{
    @Input() data: MetadataFormData<string, 'struct'>;
    @Input() extensions: MetadataFormExtension[];

    control: FormGroup = this.fb.group<T>({} as T);
    labelControl = this.fb.control(false);

    get hasLabel() {
        return (
            !!this.data.trueParent &&
            this.data.trueParent.objectType !== 'union' &&
            this.data.trueParent.typeGroup !== 'complex'
        );
    }

    constructor(private fb: FormBuilder) {
        super();
    }

    ngOnInit() {
        merge(this.control.valueChanges, this.labelControl.valueChanges)
            .pipe(delay(0), untilDestroyed(this))
            .subscribe(() => {
                this.emitOutgoingValue(
                    this.control.value && this.labelControl.value
                        ? (omitBy(this.control.value, isNil) as T)
                        : null,
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
                }) as never,
            ),
        );
        this.setLabelControl();
        super.ngOnChanges(changes);
    }

    handleIncomingValue(value: T) {
        this.control.patchValue(value as never, { emitEvent: false });
        this.setLabelControl(!!(value && Object.keys(value).length));
    }

    validate(): ValidationErrors | null {
        return this.labelControl.value ? super.validate() : null;
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
