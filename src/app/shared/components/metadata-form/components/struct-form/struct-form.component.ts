import { Component, Input } from '@angular/core';
import { Field } from '@vality/thrift-ts';

import { MetadataFormData } from '../../types/metadata-form-data';

@Component({
    selector: 'cc-struct-form',
    templateUrl: './struct-form.component.html',
})
export class StructFormComponent {
    @Input() data: MetadataFormData<string, Field[]>;
}
