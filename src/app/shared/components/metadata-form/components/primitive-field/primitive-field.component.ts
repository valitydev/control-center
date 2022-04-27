import { Component, Input } from '@angular/core';
import { ThriftType } from '@vality/thrift-ts';

import { MetadataFormData } from '../../types/metadata-form-data';

@Component({
    selector: 'cc-primitive-field',
    templateUrl: './primitive-field.component.html',
})
export class PrimitiveFieldComponent {
    @Input() data: MetadataFormData<ThriftType>;
}
