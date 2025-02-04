import { Component, DestroyRef, Input, OnChanges, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import {
    ComponentChanges,
    FormComponentSuperclass,
    createControlProviders,
    getErrorsTree,
    getValueChanges,
} from '@vality/matez';
import { Field } from '@vality/thrift-ts';
import isNil from 'lodash-es/isNil';
import omitBy from 'lodash-es/omitBy';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { ThriftData } from '../../../../../../models';
import { isRequiredField } from '../../../../../../utils';
import { MetadataFormExtension } from '../../types/metadata-form-extension';

@Component({
    selector: 'v-struct-form',
    templateUrl: './struct-form.component.html',
    providers: createControlProviders(() => StructFormComponent),
    standalone: false,
})
export class StructFormComponent<T extends { [N in string]: unknown }>
    extends FormComponentSuperclass<T>
    implements OnChanges, OnInit
{
    @Input() data!: ThriftData<string, 'struct'>;
    @Input() extensions?: MetadataFormExtension[];

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

    override ngOnInit() {
        combineLatest([getValueChanges(this.control), getValueChanges(this.labelControl)])
            .pipe(
                map(([value, labelValue]) =>
                    value && labelValue ? (omitBy(value, isNil) as T) : null,
                ),
                distinctUntilChanged(),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((value) => {
                this.emitOutgoingValue(value as T);
            });
        return super.ngOnInit();
    }

    override ngOnChanges(changes: ComponentChanges<StructFormComponent<T>>) {
        if (changes.data) {
            const newControlsNames = new Set((this.data.ast || []).map(({ name }: Field) => name));
            Object.keys(this.control.controls).forEach((name) => {
                this.control.removeControl(name as never);
            });
            newControlsNames.forEach((name) =>
                this.control.addControl(
                    name as never,
                    this.fb.control(null, {
                        validators: isRequiredField(
                            (this.data.ast || []).find((f: Field) => f.name === name),
                        )
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

    override validate(_control: AbstractControl): ValidationErrors | null {
        return this.labelControl.value ? getErrorsTree(this.control) : null;
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
