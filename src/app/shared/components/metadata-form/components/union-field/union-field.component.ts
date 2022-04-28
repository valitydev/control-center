import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormComponentSuperclass, provideValueAccessor } from '@s-libs/ng-core';
import { Field } from '@vality/thrift-ts';
import { merge } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { MetadataFormData } from '../../types/metadata-form-data';

@UntilDestroy()
@Component({
    selector: 'cc-union-field',
    templateUrl: './union-field.component.html',
    providers: [provideValueAccessor(UnionFieldComponent)],
})
export class UnionFieldComponent
    extends FormComponentSuperclass<{ [N in string]: unknown }>
    implements OnInit
{
    @Input() data: MetadataFormData<string, Field[]>;

    fieldControl = new FormControl<Field>();
    internalControl = new FormControl<unknown>();

    ngOnInit() {
        this.fieldControl.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
            this.internalControl.reset(null, { emitEvent: false });
        });
        merge(this.fieldControl.valueChanges, this.internalControl.valueChanges)
            .pipe(
                map(() => {
                    const field = this.fieldControl.value;
                    return field ? { [field.name]: this.internalControl.value } : null;
                }),
                distinctUntilChanged(),
                untilDestroyed(this)
            )
            .subscribe((value) => {
                this.emitOutgoingValue(value);
            });
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
            this.internalControl.reset(null, { emitEvent: false });
        }
    }
}
