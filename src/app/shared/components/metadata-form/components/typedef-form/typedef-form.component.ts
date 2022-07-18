import { Component, Input } from '@angular/core';
import { TypeDefs } from '@vality/thrift-ts';

import { createControlProviders, ValidatedFormControlSuperclass } from '../../../../../../utils';
import { MetadataFormData } from '../../types/metadata-form-data';

@Component({
    selector: 'cc-typedef-form',
    templateUrl: './typedef-form.component.html',
    providers: createControlProviders(TypedefFormComponent),
})
export class TypedefFormComponent<T> extends ValidatedFormControlSuperclass<T> {
    @Input() data: MetadataFormData<string, TypeDefs[string]>;
}
