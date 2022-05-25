import { Component, Input } from '@angular/core';
import { ValidationErrors, Validator } from '@angular/forms';
import { WrappedFormControlSuperclass } from '@s-libs/ng-core';
import { Enums } from '@vality/thrift-ts/src/thrift-parser';

import { createControlProviders } from '@cc/utils';

import { MetadataFormData } from '../../types/metadata-form-data';

@Component({
    selector: 'cc-enum-field',
    templateUrl: './enum-field.component.html',
    providers: createControlProviders(EnumFieldComponent),
})
export class EnumFieldComponent extends WrappedFormControlSuperclass<unknown> implements Validator {
    @Input() data: MetadataFormData<string, Enums[string]>;

    ngOnInit() {
        super.ngOnInit();
        console.log(this.data);
    }

    validate(): ValidationErrors | null {
        return this.control.errors;
    }
}
