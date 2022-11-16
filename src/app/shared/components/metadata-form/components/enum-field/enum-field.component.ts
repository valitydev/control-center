import { Component, Input } from '@angular/core';

import { createControlProviders, ValidatedFormControlSuperclass } from '@cc/utils';

import { MetadataFormData } from '../../types/metadata-form-data';

@Component({
    selector: 'cc-enum-field',
    templateUrl: './enum-field.component.html',
    providers: createControlProviders(EnumFieldComponent),
})
export class EnumFieldComponent<T> extends ValidatedFormControlSuperclass<T> {
    @Input() data: MetadataFormData<string, 'enum'>;
}
