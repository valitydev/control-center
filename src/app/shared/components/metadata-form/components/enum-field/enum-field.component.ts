import { Component, Input } from '@angular/core';
import { Enums } from '@vality/thrift-ts/src/thrift-parser';

import { MetadataFormData } from '../../types/metadata-form-data';

@Component({
    selector: 'cc-enum-field',
    templateUrl: './enum-field.component.html',
})
export class EnumFieldComponent {
    @Input() data: MetadataFormData<string, Enums[string]>;

    selected: any;
}
