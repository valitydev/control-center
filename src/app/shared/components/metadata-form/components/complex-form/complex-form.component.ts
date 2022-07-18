import { Component, Input, OnInit } from '@angular/core';
import { ValidationErrors, Validator } from '@angular/forms';
import { FormArray, FormControl } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormComponentSuperclass, provideValueAccessor } from '@s-libs/ng-core';
import { MapType, SetType, ListType } from '@vality/thrift-ts';

import { getErrorsTree, provideValidator } from '@cc/utils';

import { MetadataFormData } from '../../types/metadata-form-data';

@UntilDestroy()
@Component({
    selector: 'cc-complex-form',
    templateUrl: './complex-form.component.html',
    styleUrls: ['complex-form.component.scss'],
    providers: [provideValueAccessor(ComplexFormComponent), provideValidator(ComplexFormComponent)],
})
export class ComplexFormComponent<T extends unknown[] | Map<unknown, unknown> | Set<unknown>>
    extends FormComponentSuperclass<T>
    implements OnInit, Validator
{
    @Input() data: MetadataFormData<SetType | MapType | ListType>;

    valueControls = new FormArray([]);
    keyControls = new FormArray([]);

    get hasLabel() {
        return !!this.data.trueParent;
    }

    get hasKeys() {
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
        this.valueControls.patchValue(value as never, { emitEvent: false });
    }

    validate(): ValidationErrors | null {
        return getErrorsTree(this.keyControls) || getErrorsTree(this.valueControls);
    }

    add() {
        this.valueControls.push(new FormControl());
        if (this.hasKeys) this.keyControls.push(new FormControl());
    }

    delete(idx: number) {
        this.valueControls.removeAt(idx);
        if (this.hasKeys) this.keyControls.removeAt(idx);
    }
}
