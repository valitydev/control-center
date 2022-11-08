import { Component, Input, OnInit } from '@angular/core';
import { ValidationErrors, Validator } from '@angular/forms';
import { FormArray, FormControl } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormComponentSuperclass } from '@s-libs/ng-core';
import { MapType, SetType, ListType } from '@vality/thrift-ts';

import { MetadataFormExtension } from '@cc/app/shared/components/metadata-form';
import { createControlProviders, getErrorsTree } from '@cc/utils';

import { MetadataFormData } from '../../types/metadata-form-data';

function updateFormArray<V>(formArray: FormArray<V>, values: V[]) {
    formArray.clear({ emitEvent: false });
    values.forEach((v) => {
        formArray.push(new FormControl(v) as never);
    });
    formArray.patchValue(values);
}

@UntilDestroy()
@Component({
    selector: 'cc-complex-form',
    templateUrl: './complex-form.component.html',
    styleUrls: ['complex-form.component.scss'],
    providers: createControlProviders(ComplexFormComponent),
})
export class ComplexFormComponent<T extends unknown[] | Map<unknown, unknown> | Set<unknown>>
    extends FormComponentSuperclass<T>
    implements OnInit, Validator
{
    @Input() data: MetadataFormData<SetType | MapType | ListType>;
    @Input() extensions: MetadataFormExtension[];

    valueControls = new FormArray([]);
    keyControls = new FormArray([]);

    get hasLabel() {
        return !!this.data.trueParent;
    }

    get isKeyValue() {
        return this.data.type.name === 'map';
    }

    get keyType() {
        if ('keyType' in this.data.type) return this.data.type.keyType;
    }

    ngOnInit() {
        this.valueControls.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
            switch (this.data.type.name) {
                case 'list':
                    this.emitOutgoingValue(value as never);
                    break;
                case 'map':
                    this.emitOutgoingValue(
                        new Map(value.map((v, idx) => [this.keyControls.value[idx], v])) as never
                    );
                    break;
                case 'set':
                    this.emitOutgoingValue(new Set(value) as never);
                    break;
            }
        });
    }

    handleIncomingValue(value: T) {
        if (this.isKeyValue) {
            const keys = Array.from(value?.keys() || []);
            updateFormArray(this.keyControls, keys);
        }
        const values = this.isKeyValue
            ? Array.from(value?.values() || [])
            : Array.from(value || []);
        updateFormArray(this.valueControls, values);
    }

    validate(): ValidationErrors | null {
        return getErrorsTree(this.keyControls) || getErrorsTree(this.valueControls);
    }

    add() {
        this.valueControls.push(new FormControl());
        if (this.isKeyValue) this.keyControls.push(new FormControl());
    }

    delete(idx: number) {
        this.valueControls.removeAt(idx);
        if (this.isKeyValue) this.keyControls.removeAt(idx);
    }
}
