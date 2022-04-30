import { Component, Input } from '@angular/core';
import { FormArray, FormControl } from '@ngneat/reactive-forms';
import { provideValueAccessor, WrappedFormControlSuperclass } from '@s-libs/ng-core';
import { MapType, SetType, ListType } from '@vality/thrift-ts';

import { MetadataFormData } from '../../types/metadata-form-data';

@Component({
    selector: 'cc-complex-form',
    templateUrl: './complex-form.component.html',
    styleUrls: ['complex-form.component.scss'],
    providers: [provideValueAccessor(ComplexFormComponent)],
})
export class ComplexFormComponent extends WrappedFormControlSuperclass<unknown> {
    @Input() data: MetadataFormData<SetType | MapType | ListType>;

    controls = new FormArray([]);

    add() {
        this.controls.push(new FormControl());
    }

    delete(idx: number) {
        this.controls.removeAt(idx);
    }
}
