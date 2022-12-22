import { Component, Input, OnInit } from '@angular/core';
import { ValidationErrors, Validator, FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormComponentSuperclass } from '@s-libs/ng-core';
import { Field } from '@vality/thrift-ts';
import { merge } from 'rxjs';
import { delay, distinctUntilChanged, map } from 'rxjs/operators';

import { createControlProviders, getErrorsTree } from '@cc/utils';

import { MetadataFormData } from '../../types/metadata-form-data';
import { MetadataFormExtension } from '../../types/metadata-form-extension';
import { getDefaultValue } from '../../utils/get-default-value';

@UntilDestroy()
@Component({
    selector: 'cc-union-field',
    templateUrl: './union-field.component.html',
    providers: createControlProviders(() => UnionFieldComponent),
})
export class UnionFieldComponent<T extends { [N in string]: unknown }>
    extends FormComponentSuperclass<T>
    implements OnInit, Validator
{
    @Input() data: MetadataFormData<string, 'union'>;
    @Input() extensions: MetadataFormExtension[];

    fieldControl = new FormControl() as FormControl<Field>;
    internalControl = new FormControl() as FormControl<T[keyof T]>;

    ngOnInit() {
        merge(this.fieldControl.valueChanges, this.internalControl.valueChanges)
            .pipe(
                map(() => {
                    const field = this.fieldControl.value;
                    return field ? ({ [field.name]: this.internalControl.value } as T) : null;
                }),
                distinctUntilChanged(),
                delay(0),
                untilDestroyed(this)
            )
            .subscribe((value) => {
                this.emitOutgoingValue(value);
            });
        this.fieldControl.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
            this.cleanInternal(true);
        });
    }

    validate(): ValidationErrors | null {
        return this.fieldControl.errors || getErrorsTree(this.internalControl);
    }

    handleIncomingValue(value: T) {
        if (value) {
            const name: keyof T = Object.keys(value)[0];
            this.fieldControl.setValue(
                this.data.ast.find((f) => f.name === name),
                { emitEvent: false }
            );
            this.internalControl.setValue(value[name], { emitEvent: false });
        } else {
            this.fieldControl.reset(null, { emitEvent: false });
            this.cleanInternal();
        }
    }

    cleanInternal(emitEvent = false) {
        this.internalControl.reset(
            this.fieldControl.value
                ? (getDefaultValue(
                      this.data.metadata,
                      this.data.namespace,
                      this.fieldControl.value.type
                  ) as T[keyof T])
                : null,
            { emitEvent }
        );
    }
}
