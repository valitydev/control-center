import { Component, Input } from '@angular/core';
import { Enums } from '@vality/thrift-ts/src/thrift-parser';

import { createControlProviders, ValidatedFormControlSuperclass } from '../../../../../../utils';
import { MetadataFormData } from '../../types/metadata-form-data';

@Component({
    selector: 'cc-enum-field',
    templateUrl: './enum-field.component.html',
    providers: createControlProviders(EnumFieldComponent),
})
export class EnumFieldComponent<T> extends ValidatedFormControlSuperclass<T> {
    @Input() data: MetadataFormData<string, Enums[string]>;
}
