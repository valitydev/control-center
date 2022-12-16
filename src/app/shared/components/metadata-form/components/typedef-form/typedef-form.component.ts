import { Component, Input } from '@angular/core';

import { createControlProviders, ValidatedFormControlSuperclass } from '@cc/utils';

import { MetadataFormData } from '../../types/metadata-form-data';
import { MetadataFormExtension } from '../../types/metadata-form-extension';

@Component({
    selector: 'cc-typedef-form',
    templateUrl: './typedef-form.component.html',
    providers: createControlProviders(() => TypedefFormComponent),
})
export class TypedefFormComponent<T> extends ValidatedFormControlSuperclass<T> {
    @Input() data: MetadataFormData<string, 'typedef'>;
    @Input() extensions: MetadataFormExtension[];
}
