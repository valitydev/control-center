import { Component, Input } from '@angular/core';
import { provideValueAccessor } from '@s-libs/ng-core';
import { Enums } from '@vality/thrift-ts/src/thrift-parser';

import { ValidatedFormControlSuperclass } from '@cc/utils';

import { MetadataFormData } from '../../types/metadata-form-data';

@Component({
    selector: 'cc-enum-field',
    templateUrl: './enum-field.component.html',
    providers: [provideValueAccessor(EnumFieldComponent)],
})
export class EnumFieldComponent<T> extends ValidatedFormControlSuperclass<T> {
    @Input() data: MetadataFormData<string, Enums[string]>;
}
