import { Component, Input, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    ValidationErrors,
    Validator,
    FormArray,
    FormControl,
    AbstractControl,
} from '@angular/forms';
import { FormComponentSuperclass, createControlProviders, getErrorsTree } from '@vality/ng-core';
import { MapType, SetType, ListType } from '@vality/thrift-ts';
import { merge } from 'rxjs';

import { MetadataFormExtension } from '@cc/app/shared/components/metadata-form';

import { MetadataFormData } from '../../types/metadata-form-data';

function updateFormArray<V>(formArray: FormArray<AbstractControl<V>>, values: V[]) {
    formArray.clear({ emitEvent: false });
    values.forEach((v) => {
        formArray.push(new FormControl(v) as never);
    });
    formArray.patchValue(values);
}

type ComplexType<T, K = never> = T[] | Map<K, T> | Set<T>;

@Component({
    selector: 'cc-complex-form',
    templateUrl: './complex-form.component.html',
    styleUrls: ['complex-form.component.scss'],
    providers: createControlProviders(() => ComplexFormComponent),
})
export class ComplexFormComponent<V, K = never>
    extends FormComponentSuperclass<ComplexType<V, K>>
    implements OnInit, Validator
{
    @Input() data: MetadataFormData<SetType | MapType | ListType>;
    @Input() extensions: MetadataFormExtension[];

    valueControls = new FormArray<AbstractControl<V>>([]);
    keyControls = new FormArray<AbstractControl<K>>([]);

    get hasLabel() {
        return !!this.data.trueParent;
    }

    get isKeyValue() {
        return this.data.type.name === 'map';
    }

    get keyType() {
        if ('keyType' in this.data.type) {
            return this.data.type.keyType;
        }
    }

    constructor(private destroyRef: DestroyRef) {
        super();
    }

    ngOnInit() {
        merge(this.valueControls.valueChanges, this.keyControls.valueChanges)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                const values = this.valueControls.value;
                switch (this.data.type.name) {
                    case 'list':
                        this.emitOutgoingValue(values.length ? values : null);
                        break;
                    case 'map': {
                        const keys = this.keyControls.value;
                        this.emitOutgoingValue(
                            keys.length ? new Map(values.map((v, idx) => [keys[idx], v])) : null,
                        );
                        break;
                    }
                    case 'set':
                        this.emitOutgoingValue(values.length ? new Set(values) : null);
                        break;
                }
            });
    }

    handleIncomingValue(value: ComplexType<V, K>) {
        if (this.isKeyValue) {
            const keys = Array.from((value as Map<K, V>)?.keys() || []);
            updateFormArray(this.keyControls, keys);
        }
        const values = this.isKeyValue
            ? Array.from(value?.values() || [])
            : Array.from((value as V[]) || []);
        updateFormArray(this.valueControls, values);
    }

    validate(): ValidationErrors | null {
        return getErrorsTree(this.keyControls) || getErrorsTree(this.valueControls);
    }

    add() {
        this.valueControls.push(new FormControl());
        if (this.isKeyValue) {
            this.keyControls.push(new FormControl());
        }
    }

    delete(idx: number) {
        this.valueControls.removeAt(idx);
        if (this.isKeyValue) {
            this.keyControls.removeAt(idx);
        }
    }
}
