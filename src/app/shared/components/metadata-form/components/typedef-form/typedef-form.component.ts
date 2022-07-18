import { Component, Input } from '@angular/core';
import { provideValueAccessor, WrappedFormControlSuperclass } from '@s-libs/ng-core';
import { TypeDefs } from '@vality/thrift-ts';

import { MetadataFormData } from '../../types/metadata-form-data';

@Component({
    selector: 'cc-typedef-form',
    templateUrl: './typedef-form.component.html',
    providers: [provideValueAccessor(TypedefFormComponent)],
})
export class TypedefFormComponent<T> extends WrappedFormControlSuperclass<T> {
    @Input() data: MetadataFormData<string, TypeDefs[string]>;
}
