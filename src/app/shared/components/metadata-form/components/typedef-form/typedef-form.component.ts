import { Component, Input } from '@angular/core';
import { ValidationErrors, Validator } from '@angular/forms';
import { WrappedFormControlSuperclass } from '@s-libs/ng-core';
import { TypeDefs } from '@vality/thrift-ts';

import { createValidatedAbstractControlProviders } from '@cc/utils';

import { MetadataFormData } from '../../types/metadata-form-data';

@Component({
    selector: 'cc-typedef-form',
    templateUrl: './typedef-form.component.html',
    providers: createValidatedAbstractControlProviders(TypedefFormComponent),
})
export class TypedefFormComponent
    extends WrappedFormControlSuperclass<unknown>
    implements Validator
{
    @Input() data: MetadataFormData<string, TypeDefs[string]>;

    validate(): ValidationErrors | null {
        return this.control.invalid ? { invalid: true } : null;
    }
}