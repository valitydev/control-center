import { Component, Input, OnInit } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { FormControl } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Field } from '@vality/thrift-ts';
import { merge } from 'rxjs';
import { delay, distinctUntilChanged, map } from 'rxjs/operators';

import { createControlProviders, ValidatedControlSuperclass } from '@cc/utils';

import { MetadataFormData } from '../../types/metadata-form-data';
import { getDefaultValue } from '../../utils/get-default-value';

@UntilDestroy()
@Component({
    selector: 'cc-union-field',
    templateUrl: './union-field.component.html',
    providers: createControlProviders(UnionFieldComponent),
})
export class UnionFieldComponent
    extends ValidatedControlSuperclass<{ [N in string]: unknown }>
    implements OnInit
{
    @Input() data: MetadataFormData<string, Field[]>;

    fieldControl = new FormControl<Field>();
    internalControl = new FormControl<unknown>();

    ngOnInit() {
        merge(this.fieldControl.valueChanges, this.internalControl.valueChanges)
            .pipe(
                map(() => {
                    const field = this.fieldControl.value;
                    return field ? { [field.name]: this.internalControl.value } : null;
                }),
                distinctUntilChanged(),
                delay(0),
                untilDestroyed(this)
            )
            .subscribe((value) => {
                this.emitOutgoingValue(value);
            });
        return super.ngOnInit();
    }

    validate(): ValidationErrors | null {
        return this.fieldControl.invalid || this.internalControl.invalid
            ? { unionInvalid: true }
            : null;
    }

    handleIncomingValue(value: { [N in string]: unknown }) {
        if (value) {
            const name = Object.keys(value)[0];
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

    cleanInternal() {
        this.internalControl.reset(
            this.fieldControl.value
                ? getDefaultValue(
                      this.data.metadata,
                      this.data.namespace,
                      this.fieldControl.value.type
                  )
                : null,
            { emitEvent: false }
        );
    }
}
