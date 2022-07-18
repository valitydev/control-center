import { Component, Input } from '@angular/core';
import { provideValueAccessor, WrappedFormControlSuperclass } from '@s-libs/ng-core';
import { Enums } from '@vality/thrift-ts/src/thrift-parser';

import { MetadataFormData } from '../../types/metadata-form-data';

@Component({
    selector: 'cc-enum-field',
    templateUrl: './enum-field.component.html',
    providers: [provideValueAccessor(EnumFieldComponent)],
})
export class EnumFieldComponent<T> extends WrappedFormControlSuperclass<T> {
    @Input() data: MetadataFormData<string, Enums[string]>;
}
