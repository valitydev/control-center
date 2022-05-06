import { Component, Input } from '@angular/core';
import { ValidationErrors, Validator } from '@angular/forms';
import { WrappedFormControlSuperclass } from '@s-libs/ng-core';
import { Enums } from '@vality/thrift-ts/src/thrift-parser';

import { createValidatedAbstractControlProviders } from '@cc/utils';

import { MetadataFormData } from '../../types/metadata-form-data';

@Component({
    selector: 'cc-enum-field',
    templateUrl: './enum-field.component.html',
    providers: createValidatedAbstractControlProviders(EnumFieldComponent),
})
export class EnumFieldComponent extends WrappedFormControlSuperclass<unknown> implements Validator {
    @Input() data: MetadataFormData<string, Enums[string]>;

    validate(): ValidationErrors | null {
        return this.control.invalid ? { invalid: true } : null;
    }
}
