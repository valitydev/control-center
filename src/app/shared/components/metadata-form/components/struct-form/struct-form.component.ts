import { Component, Input, OnChanges, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    ValidationErrors,
    Validators,
    FormBuilder,
    FormGroup,
    AbstractControl,
} from '@angular/forms';
import {
    createControlProviders,
    ComponentChanges,
    FormComponentSuperclass,
    getValueChanges,
} from '@vality/ng-core';
import isNil from 'lodash-es/isNil';
import omitBy from 'lodash-es/omitBy';
import { combineLatest } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

import { MetadataFormData, isRequiredField } from '../../types/metadata-form-data';
import { MetadataFormExtension } from '../../types/metadata-form-extension';

@Component({
    selector: 'cc-struct-form',
    templateUrl: './struct-form.component.html',
    providers: createControlProviders(() => StructFormComponent),
})
export class StructFormComponent<T extends { [N in string]: unknown }>
    extends FormComponentSuperclass<T>
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

    constructor(
        private fb: FormBuilder,
        private destroyRef: DestroyRef,
    ) {
        super();
    }

    ngOnInit() {
        combineLatest([getValueChanges(this.control), getValueChanges(this.labelControl)])
            .pipe(
                map(([value, labelValue]) =>
                    value && labelValue ? (omitBy(value, isNil) as T) : null,
                ),
                distinctUntilChanged(),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((value) => {
                this.emitOutgoingValue(value);
            });
        return super.ngOnInit();
    }

    ngOnChanges(changes: ComponentChanges<StructFormComponent<T>>) {
        if (changes.data) {
            const newControlsNames = new Set(this.data.ast.map(({ name }) => name));
            Object.keys(this.control.controls).forEach((name) => {
                this.control.removeControl(name as never);
            });
            newControlsNames.forEach((name) =>
                this.control.addControl(
                    name as never,
                    this.fb.control(null, {
                        validators: isRequiredField(this.data.ast.find((f) => f.name === name))
                            ? [Validators.required]
                            : [],
                    }) as never,
                ),
            );
            this.setLabelControl();
        }
        super.ngOnChanges(changes);
    }

    handleIncomingValue(value: T) {
        this.control.patchValue(value as never, { emitEvent: false });
        this.setLabelControl(!!(value && Object.keys(value).length));
    }

    validate(control: AbstractControl): ValidationErrors | null {
        return this.labelControl.value ? super.validate(control) : null;
    }

    private setLabelControl(value: boolean = false) {
        if (!this.hasLabel || this.data.isRequired) {
            if (!this.labelControl.value) {
                this.labelControl.setValue(true);
            }
            if (this.labelControl.enabled) {
                this.labelControl.disable();
            }
        } else {
            if (this.labelControl.value !== value) {
                this.labelControl.setValue(value);
            }
            if (this.labelControl.disabled) {
                this.labelControl.enable();
            }
        }
    }
}
