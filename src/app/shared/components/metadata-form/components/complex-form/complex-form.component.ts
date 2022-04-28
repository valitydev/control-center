import { Component, Input } from '@angular/core';
import { provideValueAccessor, WrappedFormControlSuperclass } from '@s-libs/ng-core';
import { MapType, SetType, ListType } from '@vality/thrift-ts';

import { MetadataFormData } from '../../types/metadata-form-data';

@Component({
    selector: 'cc-complex-form',
    templateUrl: './complex-form.component.html',
    providers: [provideValueAccessor(ComplexFormComponent)],
})
export class ComplexFormComponent extends WrappedFormControlSuperclass<unknown> {
    @Input() data: MetadataFormData<SetType | MapType | ListType>;
}
