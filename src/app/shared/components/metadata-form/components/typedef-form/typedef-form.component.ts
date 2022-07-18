import { Component, Input } from '@angular/core';
import { provideValueAccessor } from '@s-libs/ng-core';
import { TypeDefs } from '@vality/thrift-ts';

import { ValidatedFormControlSuperclass } from '@cc/utils';

import { MetadataFormData } from '../../types/metadata-form-data';

@Component({
    selector: 'cc-typedef-form',
    templateUrl: './typedef-form.component.html',
    providers: [provideValueAccessor(TypedefFormComponent)],
})
export class TypedefFormComponent<T> extends ValidatedFormControlSuperclass<T> {
    @Input() data: MetadataFormData<string, TypeDefs[string]>;
}
