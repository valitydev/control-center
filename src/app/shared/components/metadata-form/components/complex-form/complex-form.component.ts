import { Component, Input } from '@angular/core';
import { ValidationErrors, Validator } from '@angular/forms';
import { FormArray, FormControl } from '@ngneat/reactive-forms';
import { WrappedFormControlSuperclass } from '@s-libs/ng-core';
import { MapType, SetType, ListType } from '@vality/thrift-ts';

import { createValidatedAbstractControlProviders } from '@cc/utils';

import { MetadataFormData } from '../../types/metadata-form-data';

@Component({
    selector: 'cc-complex-form',
    templateUrl: './complex-form.component.html',
    styleUrls: ['complex-form.component.scss'],
    providers: createValidatedAbstractControlProviders(ComplexFormComponent),
})
export class ComplexFormComponent
    extends WrappedFormControlSuperclass<unknown>
    implements Validator
{
    @Input() data: MetadataFormData<SetType | MapType | ListType>;

    controls = new FormArray([]);

    add() {
        this.controls.push(new FormControl());
    }

    delete(idx: number) {
        this.controls.removeAt(idx);
    }

    validate(): ValidationErrors | null {
        return this.control.invalid || this.controls.invalid
            ? { [this.data.type.name + 'Invalid']: true }
            : null;
    }
}
