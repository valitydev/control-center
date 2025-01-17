import { Component, Input } from '@angular/core';
import { FormControlSuperclass, createControlProviders } from '@vality/matez';
import { ThriftData } from '@vality/ng-thrift';

import { MetadataFormExtension } from '../../types/metadata-form-extension';
@Component({
    selector: 'cc-typedef-form',
    templateUrl: './typedef-form.component.html',
    providers: createControlProviders(() => TypedefFormComponent),
    standalone: false,
})
export class TypedefFormComponent<T> extends FormControlSuperclass<T> {
    @Input() data: ThriftData<string, 'typedef'>;
    @Input() extensions: MetadataFormExtension[];
}
