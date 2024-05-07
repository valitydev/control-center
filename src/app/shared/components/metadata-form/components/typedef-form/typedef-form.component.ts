import { Component, Input } from '@angular/core';
import { createControlProviders, FormControlSuperclass } from '@vality/ng-core';

import { MetadataFormExtension } from '../../types/metadata-form-extension';
import { ThriftData } from '../../types/thrift-data';

@Component({
    selector: 'cc-typedef-form',
    templateUrl: './typedef-form.component.html',
    providers: createControlProviders(() => TypedefFormComponent),
})
export class TypedefFormComponent<T> extends FormControlSuperclass<T> {
    @Input() data: ThriftData<string, 'typedef'>;
    @Input() extensions: MetadataFormExtension[];
}
