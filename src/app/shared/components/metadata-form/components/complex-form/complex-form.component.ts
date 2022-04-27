import { Component, Input } from '@angular/core';
import { MapType, SetType, ListType } from '@vality/thrift-ts';

import { MetadataFormData } from '../../types/metadata-form-data';

@Component({
    selector: 'cc-complex-form',
    templateUrl: './complex-form.component.html',
})
export class ComplexFormComponent {
    @Input() data: MetadataFormData<SetType | MapType | ListType>;
}
