import { Component, Input } from '@angular/core';
import { TypeDefs } from '@vality/thrift-ts';

import { MetadataFormData } from '../../types/metadata-form-data';

@Component({
    selector: 'cc-typedef-form',
    templateUrl: './typedef-form.component.html',
})
export class TypedefFormComponent {
    @Input() data: MetadataFormData<string, TypeDefs[string]>;
}
