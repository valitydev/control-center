import { Component, Input } from '@angular/core';
import { provideValueAccessor, WrappedFormControlSuperclass } from '@s-libs/ng-core';
import { ThriftType } from '@vality/thrift-ts';

import { MetadataFormData } from '../../types/metadata-form-data';

@Component({
    selector: 'cc-primitive-field',
    templateUrl: './primitive-field.component.html',
    providers: [provideValueAccessor(PrimitiveFieldComponent)],
})
export class PrimitiveFieldComponent extends WrappedFormControlSuperclass<unknown> {
    @Input() data: MetadataFormData<ThriftType>;
}
