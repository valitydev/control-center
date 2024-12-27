import { Component, Input } from '@angular/core';
import { createControlProviders, FormControlSuperclass } from '@vality/matez';
import { ThriftData } from '@vality/ng-thrift';

import { MetadataFormExtension } from '../../types/metadata-form-extension';
@Component({
    selector: 'cc-typedef-form',
    templateUrl: './typedef-form.component.html',
    providers: createControlProviders(() => TypedefFormComponent),
})
export class TypedefFormComponent<T> extends FormControlSuperclass<T> {
    @Input() data: ThriftData<string, 'typedef'>;
    @Input() extensions: MetadataFormExtension[];
}
