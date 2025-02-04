import { Component, DestroyRef, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    AbstractControl,
    FormArray,
    FormControl,
    ValidationErrors,
    Validator,
} from '@angular/forms';
import { FormComponentSuperclass, createControlProviders, getErrorsTree } from '@vality/matez';
import { ListType, MapType, SetType } from '@vality/thrift-ts';
import { merge } from 'rxjs';

import { ThriftData } from '../../../../../../models';
import { MetadataFormExtension } from '../../types/metadata-form-extension';

function updateFormArray<V>(formArray: FormArray<AbstractControl<V>>, values: V[]) {
    formArray.clear({ emitEvent: false });
    values.forEach((v) => {
        formArray.push(new FormControl(v) as never);
    });
    formArray.patchValue(values);
}

type ComplexType<T, K = never> = T[] | Map<K, T> | Set<T>;

@Component({
    selector: 'v-complex-form',
    templateUrl: './complex-form.component.html',
    styleUrls: ['complex-form.component.scss'],
    providers: createControlProviders(() => ComplexFormComponent),
    standalone: false,
})
export class ComplexFormComponent<V, K = never>
    extends FormComponentSuperclass<ComplexType<V, K>>
    implements OnInit, Validator
{
    @Input() data!: ThriftData<SetType | MapType | ListType>;
    @Input() extensions?: MetadataFormExtension[];

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
        return undefined;
    }

    constructor(private destroyRef: DestroyRef) {
        super();
    }

    override ngOnInit() {
        merge(this.valueControls.valueChanges, this.keyControls.valueChanges)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                const values = this.valueControls.value;
                if (!this.data.isRequired && !values.length) {
                    this.emitOutgoingValue(null as never);
                    return;
                }
                switch (this.data.type.name) {
                    case 'list':
                        this.emitOutgoingValue(values);
                        return;
                    case 'map': {
                        const keys = this.keyControls.value;
                        this.emitOutgoingValue(new Map(values.map((v, idx) => [keys[idx], v])));
                        return;
                    }
                    case 'set':
                        this.emitOutgoingValue(new Set(values));
                        return;
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

    override validate(): ValidationErrors | null {
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
