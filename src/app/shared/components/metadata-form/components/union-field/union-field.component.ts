import { Component, Input } from '@angular/core';
import { Field } from '@vality/thrift-ts';

import { MetadataFormData } from '../../types/metadata-form-data';

@Component({
    selector: 'cc-union-field',
    templateUrl: './union-field.component.html',
})
export class UnionFieldComponent {
    @Input() data: MetadataFormData<string, Field[]>;

    selected: any;
}
