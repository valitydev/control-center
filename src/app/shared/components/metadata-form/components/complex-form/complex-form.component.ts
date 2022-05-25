import { Component, Input } from '@angular/core';
import { ValidationErrors, Validator } from '@angular/forms';
import { FormArray, FormControl } from '@ngneat/reactive-forms';
import { MapType, SetType, ListType } from '@vality/thrift-ts';

import { createControlProviders, getErrorsTree, ValidatedFormControlSuperclass } from '@cc/utils';

import { MetadataFormData } from '../../types/metadata-form-data';

@Component({
    selector: 'cc-complex-form',
    templateUrl: './complex-form.component.html',
    styleUrls: ['complex-form.component.scss'],
    providers: createControlProviders(ComplexFormComponent),
})
export class ComplexFormComponent
    extends ValidatedFormControlSuperclass<unknown>
    implements Validator
{
    @Input() data: MetadataFormData<SetType | MapType | ListType>;

    controls = new FormArray([]);

    get hasLabel() {
        return !!this.data.trueParent;
    }

    add() {
        this.controls.push(new FormControl());
    }

    delete(idx: number) {
        this.controls.removeAt(idx);
    }

    validate(): ValidationErrors | null {
        return (this.control.errors as ValidationErrors) || getErrorsTree(this.controls);
    }
}
